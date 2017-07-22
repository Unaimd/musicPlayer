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

const {autoUpdater} = require("electron-updater");

const songsMgr = require("./includes/songsMgr.include.js");

// window objects
let win,
    preloadWin,
    optionsWin;

let updateMsg

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
        minWidth: 490,
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

        width: 700,
        //height: 0,
        center: true,
        resizable: false,
        autoHideMenuBar: true,
        frame: false
    });

    optionsWin.loadURL("file://" + __dirname + "/options.html");

    optionsWin.on("close", (event) => {
        event.preventDefault();

        optionsWin.hide();
    });

    // hide preload and show main window
    win.once("ready-to-show", () => {
        preloadWin.close();
        win.show();

        updateMsg = function(type, data) {
            win.webContents.send("autoUpdater", {
                type: type,
                data: data
            });
            console.log(type + " " + data);
        }

        try {
            autoUpdater.checkForUpdates();
        } catch (error) {
            console.log("\nError finding updates");
            updateMsg("error", error);
        }
    });

    // hotkeys
    win.webContents.on("did-finish-load", () => {

        // toggle debugger
        ipcMain.on("toggleDevTools", () => {
            win.webContents.toggleDevTools();
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
        var window = arg.win;
        var action = arg.action;

        if (window == "main") {
            window = win;
        } else if (window == "options") {
            window = optionsWin;
        } else {
            return;
        }

        // close
        if (action == "close") {

            if (window == win) {
                window.close();
                app.quit();
            } else {
                window.hide();
            }

        // maximize unmazimize
        } else if (action == "maximize") {

                // is maximized
                if (window.isMaximized()) {
                    window.unmaximize();

                // is not maximized
                } else {
                    window.maximize();
                }

        } else if (action == "minimize") {
            window.minimize();

        } else if (action == "loadFolder") {
            if (songsMgr.loadMusicFromDir(event)) {
                event.returnValue = true;
            } else {
                event.returnValue = false;
            }
        }

        event.returnValue = "ok";
    });

    ipcMain.on("showOptions", () => {
        optionsWin.show();
    });

    ipcMain.on("loadAudioFromDir", (event, dir) => {
        songsMgr.loadMusicFromDir(event, dir);
        return;
    });

    ipcMain.on("changeAlbumart", (event, songPath) => {
        songsMgr.setAlbumArt(songPath);
    });

    ipcMain.on("update", () => {
        autoUpdater.quitAndInstall();
    });
});



// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});


autoUpdater.on("checking-for-update", () => {
    updateMsg("checking", "Checking for updates...");
});

autoUpdater.on("update-available", (event, info) => {
    updateMsg("updateAvailable", "Update available");
});

autoUpdater.on("update-not-available", (event, info) => {
    updateMsg("updateNotAvailable","Update not available");
});

autoUpdater.on("error", (event, error) => {
    updateMsg("error", "Error in auto-updater:" + error);
});

autoUpdater.on("download-progress", (progressObj) => {
    updateMsg("downloadProgress", progressObj);
});

autoUpdater.on("update-downloaded", (event, info) => {
    updateMsg("updateDownloaded", null);
});
