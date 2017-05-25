document.addEventListener("DOMContentLoaded", () => {

    // titlebar elements
    document.querySelectorAll("#titleBar i").forEach((value, index, array) => {
        value.addEventListener("click", () => {
            ipcRenderer.send("titleBar", value.getAttribute("data-action"));
        }, false);
    });

    document.querySelectorAll("#titleBar img, #songs [data-action='openDir']").forEach((element) => {
        element.addEventListener("click", () => {
            if (ipcRenderer.send("titleBar", "loadFolder")) {
                while (document.querySelectorAll("#songs [data-type='audio']").length > 0) {
                    document.querySelector("#songs [data-type='audio']").remove();
                }
            }
        });
    });

}, false);
