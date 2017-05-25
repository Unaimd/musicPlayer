document.addEventListener("DOMContentLoaded", function() {

    // titlebar elements
    document.querySelectorAll("#titleBar i").forEach(function(value, index, array) {
        value.addEventListener("click", function() {
            ipcRenderer.send("titleBar", value.getAttribute("data-action"));
        }, false);
    });

    document.querySelector("#titleBar img").addEventListener("click", function() {
        if (ipcRenderer.send("titleBar", "loadFolder")) {
            while (document.querySelectorAll("#songs [data-type='audio']").length > 0) {
                document.querySelector("#songs [data-type='audio']").remove();
            }
        }
    });

}, false);
