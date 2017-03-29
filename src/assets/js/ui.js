document.addEventListener("DOMContentLoaded", function() {
    const {ipcRenderer} = require("electron");

    // titlebar elements
    document.querySelectorAll("#titleBar i").forEach(function(value, index, array) {
        value.addEventListener("click", function() {
            ipcRenderer.sendSync("titleBar", value.getAttribute("data-action"));
        }, false);
    });

    document.querySelector("#titleBar img").addEventListener("click", function() {
        var resp = ipcRenderer.sendSync("titleBar", "loadFolder");
        console.log(typeof resp + " " + resp.title);
        
        resp.forEach(function(value) {
            console.log(value.title + " " + value.artist);
        });

    });
}, false);
