const {
    app,
    BrowserWindow,
    globalShortcut,
    ipcMain
} = require('electron');

const path = require('path');
const url = require('url');

// window object
let win;

app.on('ready', () => {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        center: true,
        icon: "assets/img/favicon.png",
        autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            devTools: true
        }
    });
    
    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.loadURL("file://" + __dirname + "/index.html");
    
    // hotkeys
    win.webContents.on("did-finish-load", () => {
        
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
        }
        
        event.returnValue = "ok";
    });
    
});

    

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});