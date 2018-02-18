document.addEventListener("DOMContentLoaded", () => {

    // titlebar elements
    document.querySelectorAll("#titleBar i").forEach((element) => {
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
                document.querySelectorAll("#songs [data-type='audio']").forEach(element => {
                    element.remove();
                });
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
