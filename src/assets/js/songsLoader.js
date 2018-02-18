const songsLoader = {
    sortProp: null,
    sortMethod: null,

    sortFunctions: {
        moddate: (a, b) => {
            return a.moddate - b.moddate;
        },
        title: (a, b) => {
            a = a.title.toLowerCase();
            b = b.title.toLowerCase();

            if (a > b) {
                return 1;
            } else if (a < b) {
                return - 1;
            } else {
                return 0;
            }
        },
        artist: (a, b) => {
            a = a.artist.toString().toLowerCase();
            b = b.artist.toString().toLowerCase();

            if (a == b && a == "") {
                return songsLoader.sortFunctions.title;
            }

            if (a > b) {
                return 1;
            } else if (a < b) {
                return - 1;
            } else {
                return 0;
            }
        },
        album: (a, b) => {
            a = a.album.toLowerCase();
            b = b.album.toLowerCase();

            if (a == b && a == "") {
                return songsLoader.sortFunctions.title;
            }

            if (a > b) {
                return 1;
            } else if (a < b) {
                return - 1;
            } else {
                return songsLoader.sortFunctions.title;
            }
        },
        duration: (a, b) => {
            return a.duration - b.duration;
        }
    },
    sort: (songs, mode, fnc) => {
        switch(mode) {
            case "moddate":
                fnc = songsLoader.sortFunctions.moddate;
                break;

            case "title":
                fnc = songsLoader.sortFunctions.title;
                break;

            case "artist":
                fnc = songsLoader.sortFunctions.artist;
                break;

            case "album":
                fnc = songsLoader.sortFunctions.album;
                break;

            case "duration":
                fnc = songsLoader.sortFunctions.duration;
                break;

            default:
                fnc = null;
                break;
        }

        if (typeof fnc === "function") {
            return songs.sort(fnc);
        } else {
            return songs;
        }
    },
    loadGroup: (songs, order, method) => {
        if (typeof order === "undefined") {

            if (songsLoader.orderProperty != "") {
                order = songsLoader.orderProperty;
            } else {
                order = "title";
            }

        }
        if (typeof method === "undefined") {

            if (songsLoader.orderMethod != "") {
                method = songsLoader.orderMethod;
            } else {
                method = "asc";
            }

        }

        songs = songsLoader.sort(songs, order);
        if (method == "desc") {
            songs.reverse();
        }

        songs.forEach(song => {
            songsLoader.writeSong(song);
        });

    },
    writeSong: (songJSON) => {
        document.querySelectorAll("#songs [data-type='info']").forEach((element) => {
            element.remove();
        });

        let num = 0;
        let path = songJSON.path;

        let title = songJSON.title;
        if (!title) {
            while(path.indexOf("\\") > 0) {
                path = path.replace("\\", "/");
            }

            let splPath = path.split("/");
            filename = splPath[splPath.length - 1];

            // take title from filename without extension
            let dotSplit = filename.split(".");
            title = filename.replace("." + dotSplit[dotSplit.length - 1], "");
        }

        let artist = songJSON.artist[0];
        if (typeof artist === "undefined") {
            artist = "unknown artist";
        }

        let album = songJSON.album;
        if (typeof album === "undefined" || album == "") {
            album = "unknown album";
        }

        let duration = songsLoader.formatDuration(songJSON.duration);
        let moddate = songJSON.moddate;
        let cover = null;

        if (songJSON.cover) {
            cover = songJSON.cover;
        } else {
            cover = "./assets/img/default.jpg";
        }

        let songs = document.querySelectorAll("#songs [data-type='audio']");
        if (songs.length > 0) {
            num = parseInt(songs[songs.length - 1].getAttribute("data-num")) + 1;
        }

        let songElement = document.createElement("li");
        songElement.className = "hidden";
        songElement.setAttribute("data-type", "audio");
        songElement.setAttribute("data-num", num);
        songElement.setAttribute("data-path", path);
        songElement.setAttribute("data-cover-path", cover);
        songElement.setAttribute("data-moddate", moddate);

        let coverElement = document.createElement("img");
        coverElement.src = cover;
        coverElement.draggable = false;
        songElement.appendChild(coverElement);

        let artistAlbumElement = document.createElement("p");
        songElement.appendChild(artistAlbumElement);

        let artistElement = document.createElement("span");
        artistElement.className = "artist";
        artistElement.innerText = artist;
        artistAlbumElement.appendChild(artistElement);

        if (album) {
            let albumElement = document.createElement("span");
            albumElement.className = "album";
            albumElement.innerText = album;
            artistAlbumElement.appendChild(albumElement);
        }

        let titleDurationElement = document.createElement("p");
        songElement.appendChild(titleDurationElement);

        let titleElement = document.createElement("span");
        titleElement.className = "title";
        titleElement.innerText = title;
        titleDurationElement.appendChild(titleElement);

        let durationElement = document.createElement("span");
        durationElement.className = "duration";
        durationElement.innerText = duration;
        titleDurationElement.appendChild(durationElement);

        document.getElementById("songs").appendChild(songElement);

        updateSongs();
    },
    formatDuration: (seconds) => {
        let sec = Math.round(seconds);
        let min = 0;
        let hour = 0;

        while(sec >= 60) {
            sec -= 60;
            min++;
        }
        if (sec < 10) {
            sec = "0" + sec;
        }

        while (min >= 60) {
            min -= 60;
            hour++;
        }

        if (min < 10) {
            min = "0" + min;
        }

        if (hour > 0) {
            return hour + ":" + min + ":" + sec;
        } else {
            return min + ":" + sec;
        }
    },
    addLoader: () => {
        let loaderElement = document.createElement("li");
        loaderElement.setAttribute("data-type", "info");
        loaderElement.style.textAlign = "center";
        loaderElement.innerText = "Scanning songs";

        loaderElement.appendChild(document.createElement("br"));

        let loaderDivElement = document.createElement("div");
        loaderDivElement.className = "loader";
        loaderElement.appendChild(loaderDivElement);

        document.getElementById("songs").appendChild(loaderElement);
    },
    order: () => {
        let order = document.querySelector("select[name='order']");
        let method = document.querySelector("[name='method']:checked");
        let active;

        if (document.querySelector("#songs .active")) {
            active = document.querySelector("#songs .active").getAttribute("data-path");
        }
        songsLoader.addLoader();

        localStorage.setItem("orderProperty", order.value);
        songsLoader.orderProperty = order.value;
        localStorage.setItem("orderMethod", method.value);
        songsLoader.orderMethod = method.value;

        songsLoader.updateSortIcons(order.options[order.selectedIndex].getAttribute("data-mode"));

        if (localStorage.getItem("songsJSON") !== null) {
            songsLoader.loadGroup(JSON.parse(localStorage.getItem("songsJSON")), order.value, method.value);

            document.querySelectorAll("#songs [data-path]").forEach((element) => {
                if (element.getAttribute("data-path") == active) {
                    element.className += " active";
                    return;
                }
            });

        } else {
            songsLoader.noSongsFound();
        }
    },
    updateSortIcons: (mode) => {
        if (mode != "num" & mode != "alpha") {
            mode = "other";
        }

        document.querySelectorAll("[name='method'] + label > i").forEach((element) => {
            let classes = element.className;
            let type = element.getAttribute("data-mode");

            // show
            if (mode == type) {
                if (classes.indexOf("hidden") > 0) {
                    element.classList.remove("hidden");
                }

            // hide
            } else {
                if (classes.indexOf("hidden") < 0) {
                    element.classList.add("hidden");
                }
            }

        });
    },
    noSongsFound: () => {
        document.getElementById("songs").querySelectorAll("[data-type='info']").forEach((element) => {
            element.remove();
        });

        let liElement = document.createElement("li");
        liElement.setAttribute("data-type", "info");
        liElement.style.textAlign = "center";

        let iconElement = document.createElement("i");
        iconElement.className = "fa fa-exclamation-circle";
        liElement.appendChild(iconElement);

        liElement.innerText = "no songs found on the following path";
        liElement.appendChild(document.createElement("br"));

        let pathElement = document.createElement("strong");
        pathElement.innerText = localStorage.getItem("selAudioDir");
        liElement.appendChild(pathElement);

        document.getElementById("songs").appendChild(liElement);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // save last selected directory
    ipcRenderer.on("selAudioDir", (event, dir) => {
        localStorage.setItem("selAudioDir", dir);

        songsLoader.addLoader();
    });

    // load songs from last selected directory
    if (localStorage.getItem("selAudioDir")) {
        ipcRenderer.send("loadAudioFromDir", localStorage.getItem("selAudioDir"));
    }

    ipcRenderer.on("addSongs", (event, songs) => {
        if (!songs) {
            songsLoader.noSongsFound();
        } else {
            document.getElementById("songs").innerHTML = "";
            songsLoader.loadGroup(songs);

            localStorage.setItem("songsJSON", JSON.stringify(songs));
        }
    });

    document.querySelector("select[name='order']").addEventListener("change", songsLoader.order, false);
    document.querySelectorAll("input[name='method']").forEach((element) => {
        element.addEventListener("change", songsLoader.order, false);
    });

    if (localStorage.getItem("orderProperty")) {
        songsLoader.orderProperty = localStorage.getItem("orderProperty");

        let option = document.querySelector("option[value='" + songsLoader.orderProperty + "']");

        option.setAttribute("selected", "selected");
        songsLoader.updateSortIcons(option.getAttribute("data-mode"));
    }

    if (localStorage.getItem("orderMethod")) {
        songsLoader.orderMethod = localStorage.getItem("orderMethod");
        document.querySelectorAll("[name='method']").forEach((element) => {
            if (element.getAttribute("value") == songsLoader.orderMethod) {
                element.setAttribute("checked", "checked");

            } else {
                element.removeAttribute("checked");
            }

        });
    }

    let dragAndLoad = new Dropable(document.body, {
        dragenter: (event) => {
            let folderIcon = document.querySelector(".dropzone .box");
            if (event.srcElement == folderIcon) {
                folderIcon.getElementsByClassName("fa")[0].className = folderIcon.getElementsByClassName("fa")[0].className.replace(" fa-folder-o ", " fa-folder-open-o ");
            }
        },
        dragleave: (event) => {
            var folderIcon = document.querySelector(".dropzone .box");
            folderIcon.getElementsByClassName("fa")[0].className = folderIcon.getElementsByClassName("fa")[0].className.replace(" fa-folder-open-o ", " fa-folder-o ");
        },
        drop: (event, files) => {
            if (fs.statSync(files[0].path).isDirectory()) {
                ipcRenderer.send("loadAudioFromDir", files[0].path);

            } else {
                swal("Invalid file", "The dropped file should be a folder", "error");
            }
        }
    });

}, false);
