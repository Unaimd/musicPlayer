var songsLoader = {
    INITIAL_LOAD: 100,
    MAX_LOAD_PER_ROUND: 50,
    loadAll: true
};

document.addEventListener("DOMContentLoaded", function() {
    // save last selected directory
    ipcRenderer.on("selAudioDir", (event, dir) => {
        localStorage.setItem("selAudioDir", dir);

        document.getElementById("songs").innerHTML = "<li data-type='info' style='text-align: center;'>Scanning songs...<br><div class='loader'></div><small>If this remains too long songs couldn't be found</small></li>";
    });

    // load songs from last selected directory
    if (localStorage.getItem("selAudioDir")) {
        ipcRenderer.send("loadAudioFromDir", localStorage.getItem("selAudioDir"));
    }

    ipcRenderer.on("addSongs", (event, songs) => {
        removeLoadMore();

        if (songsLoader.loadAll) {
            loadGroup(songs, 0, songsLoader.INITIAL_LOAD, 0);
        } else {
            loadGroup(songs, 0, songsLoader.INITIAL_LOAD);
        }

        localStorage.setItem("songsJSON", JSON.stringify(songs));
    });

    function loadGroup(songs, start, num, timer) {
        if (typeof num !== "number") {
            throw new Error("Unspecified number of songs to be shown");
            return;
        }

        for (i = start; i < songs.length; i++) {
            song = songs[i];

            if (i % num == 0 && i != start) {

                if (typeof timer !== "undefined") {
                    setTimeout(function() {
                        loadGroup(songs, i, num, timer);
                    }, timer);
                }
                break;

            } else {
                writeSong(song);
            }
        }

        // add load more button
        if (i < songs.length) {
            removeLoadMore();

            document.getElementById("songs").insertAdjacentHTML("beforeend", "<li class='loadMore' style='text-align: center;cursor: pointer;'><i class='fa fa-refresh'></i>&nbsp;Load more songs</li>");
            document.querySelector("li.loadMore").addEventListener("click", loadMore, false);

            document.querySelector("li.loadMore").addEventListener("mouseenter", () => {
                document.querySelector("li.loadMore .fa").className += " fa-spin";
            }, false);

            document.querySelector("li.loadMore").addEventListener("mouseleave", () => {
                document.querySelector("li.loadMore .fa").className = document.querySelector("li.loadMore .fa").className.replace(" fa-spin", "");
            }, false);
        }
    }

    function loadMore() {
        removeLoadMore();

        var songs = document.querySelectorAll("[data-type='audio']");
        loadGroup(JSON.parse(localStorage.getItem("songsJSON")), songs.length, songsLoader.MAX_LOAD_PER_ROUND);
    }

    function removeLoadMore() {
        document.querySelectorAll("li.loadMore").forEach((element) => {
            element.remove();
        });
    }

    function writeSong(songJSON) {
        while (document.querySelectorAll("#songs [data-type='info']").length > 0) {
            document.querySelector("#songs [data-type='info']").remove();
        }

        var num = 0;
        var path = songJSON.path;

        var title = songJSON.title;
        if (typeof title === "undefined") {
            title = "unknown title";
        }

        var artist = songJSON.artist[0];
        if (typeof artist === "undefined") {
            artist = "unknown artist";
        }

        var album = songJSON.album;
        if (typeof album === "undefined" || album == "") {
            album = "unknown album";
        }

        var duration = formatDuration(songJSON.duration);
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
    }

    function formatDuration(seconds) {
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
    }
}, false);
