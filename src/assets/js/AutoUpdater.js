import {
    ipcRenderer
} from 'electron';

const AutoUpdater = {
    checking: () => {
        AutoUpdater.log("Searching for updates");
    },
    updateAvailable: () => {
        AutoUpdater.log("Newer update was found");
    },
    updateNotAvailable: () => {
        AutoUpdater.log("Newer update was not found");
    },
    error: (error) => {
        swal("Error", "There was an error trying to search updates, check the developer console for more details", "error");
        console.error("AutoUpdater: " + error);
    },
    downloadProgress: (progressObj) => {
        var bytesPerSecond = progressObj.bytesPerSecond;
        var percent = progressObj.percent;
        var transferred = progressObj.transferred;
        var total = progressObj.total;

        swal({
            title: "Downloading new update...",
            text: "status: " + Math.round(percent) + "% downloaded",
            showConfirmButton: false
        });
    },
    updateDownloaded: () => {
        swal({
            title: "New update was downloaded",
            text: "Would you like to install it now?",
            type: "info",
            showConfirmButton: true,
            confirmButtonText: "Yes",
            showCancelButton: true,
            cancelButtonText: "No"

        }, () => {
            AutoUpdater.quitAndInstall();
        });
    },
    quitAndInstall: () => {
        ipcRenderer.send("update");
    },

    log: (txt) => {
        console.info("autoUpdater: " + txt);
    }
};

ipcRenderer.on("AutoUpdater", (event, obj) => {

    switch (obj.type) {
        case "checking":
            AutoUpdater.checking(obj.data);
            break;

        case "checking":
            AutoUpdater.checking(obj.data);
            break;

        case "updateAvailable":
            AutoUpdater.updateAvailable(obj.data);
            break;

        case "updateNotAvailable":
            AutoUpdater.updateNotAvailable(obj.data);
            break;

        case "error":
            AutoUpdater.error(obj.data);
            break;

        case "downloadProgress":
            AutoUpdater.downloadProgress(obj.data);
            break;

        case "updateDownloaded":
            AutoUpdater.updateDownloaded();
            break;

        default:
            console.log("AutoUpdater: " + obj.type + "\n" + obj.data);
            break;
    }
});
