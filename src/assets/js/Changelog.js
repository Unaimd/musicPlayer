const Changelog = {
    offset: document.getElementsByClassName("changelog-offset")[0],
    changelog: document.getElementsByClassName("changelog")[0],
    version: localStorage.getItem("version"),
    runnningVersion: ipcRenderer.sendSync("changelog", "getVersion"),

    init: () => {
        if (!Changelog.version || Changelog.version < Changelog.runnningVersion) {
            localStorage.setItem("version", Changelog.runnningVersion);

            Changelog.setTitle();
            Changelog.setContent();
            Changelog.show();
        }
    },

    show: () => {
        Changelog.offset.addEventListener("click", Changelog.close, false);
        Changelog.changelog.getElementsByClassName("close")[0].addEventListener("click", Changelog.close, false);

        Changelog.offset.style.display = "block";
        Changelog.changelog.style.display = "block";
    },

    close: () => {
        Changelog.changelog.classList.add("hide");
        Changelog.offset.classList.add("hide");

        setTimeout(() => {
            Changelog.changelog.remove();
            Changelog.offset.remove()
        }, 200)
    },

    setTitle: (txt) => {
        Changelog.changelog.getElementsByClassName("version")[0].innerText = txt ? txt : Changelog.runnningVersion;
    },

    setContent: (html) => {
        if (!html) {
            html = ipcRenderer.sendSync("changelog", "getChangelog");
        }

        Changelog.changelog.getElementsByClassName("changelogContent")[0].innerHTML = html;
    }

}
