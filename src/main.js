const {
    app,
    BrowserWindow,
    globalShortcut,
    ipcMain,
    dialog
} = require('electron');

const path = require('path');
const url = require('url');

const fs = require('fs');

const id3 = require('musicmetadata');
const curl = require('curl');

// window objects
let win,
    preloadWin,
    optionsWin;

app.on('ready', () => {
    preloadWin = new BrowserWindow({
        width: 300,
        height: 350,
        show: true,

        center: true,
        resizable: false,
        autoHideMenuBar: true,
        frame: false,
        transparent: true
    });

    preloadWin.loadURL("file://" + __dirname + "/preload.html");

    win = new BrowserWindow({
        show: false,

        width: 800,
        height: 600,
        minWidth: 741,
        minHeight: 541,

        center: true,

        icon: "assets/img/favicon.png",
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            devTools: true
        },
    });

    win.loadURL("file://" + __dirname + "/index.html");

    optionsWin = new BrowserWindow({
        parent: win,
        modal: true,
        show: false,

        //width: 0,
        //height: 0,
        center: true,
        resizable: false,
        autoHideMenuBar: true,
        frame: true

    });

    optionsWin.loadURL("file://" + __dirname + "/options.html");

    optionsWin.on("close", (event) => {
        optionsWin.hide();

        event.preventDefault();
    });


    // hide preload and show main window
    win.once("ready-to-show", () => {
        preloadWin.close();
        win.show();
    });


    // hotkeys
    win.webContents.on("did-finish-load", () => {
        // show options
        globalShortcut.register("cmdOrCtrl+O", () => {
            optionsWin.show();
        });

        // volume up
        globalShortcut.register("volumeUp", () => {
            win.webContents.send("keyPress", "volumeUp");
        });
        globalShortcut.register("Alt+Up", () => {
            win.webContents.send("keyPress", "volumeUp");
        });

        // volume down
        globalShortcut.register("volumeDown", () => {
            win.webContents.send("keyPress", "volumeDown");
        });
        globalShortcut.register("Alt+Down", () => {
            win.webContents.send("keyPress", "volumeDown");
        });

        // toggleMute
        globalShortcut.register("Alt+M", () => {
            win.webContents.send("keyPress", "toggleMute");
        });

        // previousSong
        globalShortcut.register("mediaPreviousTrack", () => {
            win.webContents.send("keyPress", "previousSong");
        });
        globalShortcut.register("Alt+Left", () => {
            win.webContents.send("keyPress", "previousSong");
        });

        // nextSong
        globalShortcut.register("MediaNextTrack", () => {
            win.webContents.send("keyPress", "nextSong");
        });
        globalShortcut.register("Alt+Right", () => {
            win.webContents.send("keyPress", "nextSong");
        });

        // playPause
        globalShortcut.register("MediaPlayPause", () => {
            win.webContents.send("keyPress", "playPause");
        });
        globalShortcut.register("Alt+Space", () => {
            win.webContents.send("keyPress", "playPause");
        });

        // stop
        globalShortcut.register("MediaStop", () => {
            win.webContents.send("keyPress", "stop");
        });
        globalShortcut.register("Alt+Enter", () => {
            win.webContents.send("keyPress", "stop");
        });

    });

    // user interface titlebar actions
    ipcMain.on("titleBar", (event, arg) => {

        // close
        if (arg == "close") {
            win.close();
            app.quit();

        // maximize unmazimize
        } else if (arg == "maximize") {

            // is maximized
            if (win.isMaximized()) {
                win.unmaximize();

            // is not maximized
            } else {
                win.maximize();
            }

        } else if (arg == "minimize") {
            win.minimize();

        } else if (arg == "loadFolder") {
            if (loadMusicFromDir(event)) {
                event.returnValue = true;
            } else {
                event.returnValue = false;
            }
        }

        event.returnValue = "ok";
    });

    ipcMain.on("loadAudioFromDir", (event, dir) => {
        loadMusicFromDir(event, dir);
        return;
    });

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});

function selectFolder() {
    var dir = dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if (typeof dir === "undefined") {
        return false;
    } else {
        return dir[0];
    }
}

function sortSongs(dir, files, mode, callback) {
    var sortFunction;

    if (mode == "moddate") {

        sortFunction = function(a, b) {
            var statsA = fs.statSync(dir + "/" + a);
            var mtimeA = new Date(statsA.mtime).valueOf();

            var statsB = fs.statSync(dir + "/" + b);
            var mtimeB = new Date(statsB.mtime).valueOf();

            return mtimeB - mtimeA;
        };

    }

    files.sort(sortFunction);

    if (typeof callback === "function") {
        callback(files);
    }
}

function getSongMetadata(file, callback) {
    var filemtime;
    fs.stat(file, (err, stats) => {
        filemtime = new Date(stats.mtime).valueOf();
    });

    var resp = {
        path: file,
        title: undefined,
        artist: undefined,
        album: undefined,
        duration: undefined,
        cover: undefined,
        moddate: filemtime
    };

    var readableStream = fs.createReadStream(file);
    var parser = id3(readableStream, {duration: true}, function (err, metadata) {

        resp = {
            path: file,
            title: metadata.title,
            artist: metadata.artist,
            album: metadata.album,
            duration: metadata.duration,
            cover: undefined,
            moddate: filemtime
        }

        var path = __dirname + "/assets/img/albumArt/";
        var filename;

        if (metadata.album) {
            filename = metadata.album;
        } else {
            filename = metadata.title;
        }

        if (typeof metadata.picture[0] !== "undefined") {
            var image = metadata.picture[0];
            var format = image.format;

            filename += "." + format;

            resp.cover = path + filename;

            // create directory where the images are stored
            if (!fs.existsSync(path)) {
                fs.mkdir(path, function(error) {
                    if (error) {
                        console.log("error creating albums folder: " + path);
                    }
                });
            }

            // create image if not exists
            if (!fs.existsSync(path + filename)) {
                var base64buffer = new Buffer(image.data, "base64");
                fs.writeFile(path + filename, base64buffer, function(error) {
                    if (error) {
                        console.log("error creating album image: " + path + filename);
                    }
                });
            }

        // search for cover in folder
        } else if (fs.existsSync(path + filename + ".jpg")) {
            resp.cover = path + filename + ".jpg";

        }/* else {
            var albumQuery = resp.title;

            curl.get("https://itunes.apple.com/search?country=US&entity=album&term=" + albumQuery, {}, (error, response) => {
                if (error) {
                    console.log(error);
                } else {
                    var json = JSON.parse(response.body);

                    if (json.resultCount > 0) {
                        resp.cover = json.results[0].artworkUrl100.replace("100x100", "512x512");
                    }
                }
            });
        }*/

        readableStream.close();

        if (typeof callback === "function") {
            callback(resp);
        }
    });
}

function loadMusicFromDir(event, dir) {
    var cachedDir = __dirname + "/assets/metadata.json";

    var songs = new Array();

    if (typeof dir === "undefined") {
        dir = selectFolder();
    }

    if (dir === false) {
        return false;
    }

    if (fs.existsSync(dir)) {

        if (fs.existsSync(cachedDir)) {
            // send the selected audio folder
            event.sender.send("selAudioDir", dir);

            cachedJson = JSON.parse(fs.readFileSync(cachedDir));

            if (cachedJson.folder == dir) {
                readFromJson(event, fs.readFileSync(cachedDir, {
                    "encoding": "utf8"
                }));

                return true;
            }
        }

        // save songs metadata to json file
        var data = {};
        data.folder = dir;
        data.songs = new Array();

        scanSongs(dir, (songs) => {
            // no songs found
            if (songs.length == 0) {
                event.sender.send("addSongs", false);
            }

            songs.forEach((song) => {
                data.songs.push(song);
            });

            fs.writeFileSync(cachedDir, JSON.stringify(data), {
                "encoding": "utf8"
            });

            readFromJson(event, fs.readFileSync(cachedDir, {
                "encoding": "utf8"
            }));
        });

    }

    return true;
}

function scanSongs(dir, callback) {
    var songs = new Array();
    var totalSongs = 0;
    fs.readdir(dir, (error, files) => {

        files.forEach((file, index) => {
            var filePath = path.resolve(dir, file);

            // directory
            if (fs.lstatSync(filePath).isDirectory()) {

            // file
            } else if (fs.lstatSync(filePath).isFile()) {
                var dotSplit = file.split(".");

                if (dotSplit[dotSplit.length - 1].toUpperCase() == "MP3") {
                    totalSongs++;

                    getSongMetadata(filePath, function(metadata) {
                        songs.push(metadata);
                    });
                }
            }

            // execute code on scanning last file
            if (files.length - index == 1) {
                var interval = setInterval(() => {
                    if (songs.length == totalSongs) {
                        if (typeof callback === "function") {
                            callback(songs);
                        }
                        clearInterval(interval);
                    }
                }, 10);
            }

        });

    });

}

function readFromJson(event, json) {
    json = JSON.parse(json);

    event.sender.send("addSongs", json.songs);
}
