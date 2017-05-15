var songsLoader = {
    INITIAL_LOAD: 100,
    MAX_LOAD_PER_ROUND: 50,
    sortProp: null,
    sortMethod: null,

    sortFunctions: {
        moddate: function(a, b) {
            return a.moddate - b.moddate;
        },
        title: function(a, b) {
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
        artist: function(a, b) {
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
        album: function(a, b) {
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
        duration: function(a, b) {
            return a.duration - b.duration;
        }
    },
    sort: function(songs, mode, fnc) {
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
    loadGroup: function(songs, start, num, order, method) {
        if (typeof num !== "number") {
            throw new Error("Unspecified number of songs to be shown");
            return;
        }
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

        for (i = start; i < songs.length; i++) {
            song = songs[i];

            songsLoader.writeSong(song);
        }

    },
    writeSong: function(songJSON) {
        while (document.querySelectorAll("#songs [data-type='info']").length > 0) {
            document.querySelector("#songs [data-type='info']").remove();
        }

        var num = 0;
        var path = songJSON.path;

        var title = songJSON.title;
        if (!title) {
            while(path.indexOf("\\") > 0) {
                path = path.replace("\\", "/");
            }

            var splPath = path.split("/");
            filename = splPath[splPath.length - 1];

            // take title from filename without extension
            title = filename.replace("." + filename.split(".")[filename.split(".").length - 1], "");
        }

        var artist = songJSON.artist[0];
        if (typeof artist === "undefined") {
            artist = "unknown artist";
        }

        var album = songJSON.album;
        if (typeof album === "undefined" || album == "") {
            album = "unknown album";
        }

        var duration = songsLoader.formatDuration(songJSON.duration);
        var moddate = songJSON.moddate;
        var cover = null;

        if (typeof songJSON.cover != "undefined") {
            cover = songJSON.cover;
        } else {
            cover = "./assets/img/default.jpg";
        }

        var songs = document.querySelectorAll("#songs [data-type='audio']");
        if (songs.length > 0) {
            num = parseInt(songs[songs.length - 1].getAttribute("data-num")) + 1;
        }

        var template = '<li class="hidden" data-type="audio" data-num="' + num + '" data-path="' + path + '" data-cover-path="' + cover + '" data-moddate="' + moddate + '" data-random-played="false">';
        template += '<img src="' + cover + '" draggable="false">';
        template += '<p><span class="artist">' + artist + '</span>';
        if (album) {
            template += '&nbsp;<span class="album">' + album + '</span>';
        }
        template += '</p><p><span class="title">' + title + '</span><span class="duration">' + duration + '</span></p></li>';

        document.getElementById("songs").insertAdjacentHTML("beforeend",template);

        updateSongs();
    },
    formatDuration: function (seconds) {
        var sec = Math.round(seconds);
        var min = 0;
        var hour = 0;

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
    addLoader: function () {
        document.getElementById("songs").innerHTML = "<li data-type='info' style='text-align: center;'>Scanning songs...<br><div class='loader'></div></li>";
    },
    updateSortIcons: function(mode) {
        if (mode != "num" & mode != "alpha") {
            mode = "other";
        }

        document.querySelectorAll("[name='method'] + label > i").forEach((element) => {
            var classes = element.className;
            var type = element.getAttribute("data-mode");

            // show
            if (mode == type) {
                if (classes.indexOf("hidden") > 0) {
                    element.className = classes.replace("hidden", "").replace("  ", "");
                }

            // hide
            } else {
                if (classes.indexOf("hidden") < 0) {
                    element.className += " hidden";
                }
            }

        });
    },
    noSongsFound: function() {
        document.getElementById("songs").querySelectorAll("[data-type='info']").forEach((element) => {
            element.remove();
        });

        document.getElementById("songs").innerHTML = "<li data-type='info' style='text-align: center;'><i class='fa fa-exclamation-circle'></i>&nbsp;No songs found on the following path:<br><strong>" + localStorage.getItem("selAudioDir") + "</strong></li>";
        swal("No songs found", "Please select other folder", "info");
    }
};

document.addEventListener("DOMContentLoaded", function() {
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
            songsLoader.loadGroup(songs, 0, songsLoader.INITIAL_LOAD);

            localStorage.setItem("songsJSON", JSON.stringify(songs));
        }
    });

    document.querySelector("select[name='order']").addEventListener("change", order, false);
    document.querySelectorAll("input[name='method']").forEach((element) => {
        element.addEventListener("change", order, false);
    });

    function order() {
        var order = document.querySelector("select[name='order']");
        var method = document.querySelector("[name='method']:checked");

        document.getElementById("songs").innerHTML = "";
        songsLoader.addLoader();

        localStorage.setItem("orderProperty", order.value);
        songsLoader.orderProperty = order.value;
        localStorage.setItem("orderMethod", method.value);
        songsLoader.orderMethod = method.value;

        songsLoader.updateSortIcons(order.options[order.selectedIndex].getAttribute("data-mode"));

        if (localStorage.getItem("songsJSON") !== null) {
            songsLoader.loadGroup(JSON.parse(localStorage.getItem("songsJSON")), 0, songsLoader.INITIAL_LOAD, order.value, method.value);
        } else {
            songsLoader.noSongsFound();
        }
    }


    if (localStorage.getItem("orderProperty")) {
        songsLoader.orderProperty = localStorage.getItem("orderProperty");

        var option = document.querySelector("option[value='" + songsLoader.orderProperty + "']");

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

}, false);
