const {shell} = require("electron");

document.addEventListener("DOMContentLoaded", () => {

    // titlebar elements
    document.querySelectorAll("#titleBar i").forEach((element, index, array) => {
        element.addEventListener("click", () => {
            ipcRenderer.send("titleBar", {
                win: element.parentNode.getAttribute("data-win"),
                action: element.getAttribute("data-action")
            });
        }, false);
    });

    document.querySelectorAll("#titleBar img, #songs [data-action='openDir']").forEach((element) => {
        element.addEventListener("click", () => {
            if (ipcRenderer.send("titleBar", {
                win: element.parentNode.getAttribute("data-win"),
                action: "loadFolder"
            }) == true) {
                while (document.querySelectorAll("#songs [data-type='audio']").length > 0) {
                    document.querySelector("#songs [data-type='audio']").remove();
                }
            }
        });
    });

    document.querySelectorAll("a[target='_blank']").forEach((element) => {
        element.addEventListener("click", (event) => {
            event.preventDefault();

            openExternalURI(element.getAttribute("href"));
        }, false);
    });

    function openExternalURI(url) {
        shell.openExternal(url);
    }

}, false);
