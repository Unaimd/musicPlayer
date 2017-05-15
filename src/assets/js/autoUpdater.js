var autoUpdater = {
    checking: function() {
        console.info("autoUpdater: searching for updates");
    },
    updateAvailable: function() {
        console.info("autoUpdater: newer update was found");
    },
    updateNotAvailable: function() {
        console.info("autoUpdater: newer update was not found");
    },
    error: function(error) {
        console.error("autoUpdater: " + erorr);
    },
    downloadProgress: function(progressObj) {
        var bytesPerSecond = progressObj.bytesPerSecond;
        var percent = progressObj.percent;
        var transferred = progressObj.transferred;
        var total = progressObj.total;

        swal("Downloading new update", "status: " + Math.round(percent) + "% downloaded");
    },
    updateDownloaded: function() {
        swal({
            title: "New update was downloaded",
            text: "Would you like to install it now?",
            type: "info",
            showConfirmButton: true,
            confirmButtonText: "Yes",
            showCancelButton: true,
            cancelButtonText: "No"

        }, function() {
            autoUpdater.quitAndInstall();
        });
    },
    quitAndInstall: function() {
        ipcRenderer.send("update");
    }
};

ipcRenderer.on("autoUpdater", (event, obj) => {

    switch (obj.type) {
        case "checking":
            autoUpdater.checking(obj.data);
            break;

        case "checking":
            autoUpdater.checking(obj.data);
            break;

        case "updateAvailable":
            autoUpdater.updateAvailable(obj.data);
            break;

        case "updateNotAvailable":
            autoUpdater.updateNotAvailable(obj.data);
            break;

        case "error":
            autoUpdater.console.error(obj.data);
            break;

        case "downloadProgress":
            autoUpdater.downloadProgress(obj.data);
            break;

        case "updateDownloaded":
            autoUpdater.updateDownloaded();
            break;

        default:
            console.log("autoUpdater: " + obj.type + "\n" + obj.data);
            break;
    }
});
