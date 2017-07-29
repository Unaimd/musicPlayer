var Changelog = {
    offset: document.querySelector(".changelog-offset"),
    changelog: document.querySelector(".changelog"),
    version: localStorage.getItem("version"),
    runnningVersion: ipcRenderer.sendSync("changelog", "getVersion"),

    init: () => {
        if (!Changelog.version || Changelog.version < Changelog.runnningVersion) {
            localStorage.setItem("version", Changelog.runnningVersion);

            Changelog.setTitle();
            Changelog.show();
        }
    },

    show: () => {
        Changelog.offset.addEventListener("click", Changelog.close, false);
        Changelog.changelog.querySelector(".close").addEventListener("click", Changelog.close, false);

        Changelog.offset.style.display = "block";
        Changelog.changelog.style.display = "block";
    },

    close: () => {
        Changelog.changelog.className += " hide";
        Changelog.offset.className += " hide";

        setTimeout(() => {
            Changelog.changelog.remove();
            Changelog.offset.remove()
        }, 200)
    },

    setTitle: (txt) => {
        if (!txt) {
            Changelog.changelog.querySelector(".version").innerText = Changelog.runnningVersion;
        } else {
            Changelog.changelog.querySelector(".title").innerText = txt;
        }
    },

    setContent: (html) => {
        if (!html) {
            html = ipcRenderer.sendSync("changelog", "getChangelog");
        }

        Changelog.changelog.querySelector(".changelogContent").innerHTML = html;
    }

}

Changelog.show();
Changelog.setTitle();
Changelog.setContent();
