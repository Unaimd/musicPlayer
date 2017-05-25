const {ipcRenderer} = require("electron");

if (typeof Hotkey !== "function") {
    throw new Error("Hotkey class required");
} else {

    new Hotkey("ctrl + shift + I", () => {
        ipcRenderer.send("toggleDevTools");
    });

    new Hotkey("ctrl + O", () => {
        ipcRenderer.send("showOptions");
    });

}
