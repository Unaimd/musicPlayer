import {
    ipcRenderer,
} from 'electron';

import fs from "fs";

document.addEventListener("DOMContentLoaded", () => {

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

    Changelog.init();

}, false);
