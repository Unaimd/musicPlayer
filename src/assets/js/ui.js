document.addEventListener("DOMContentLoaded", function() {
    const {ipcRenderer} = require("electron");

    // titlebar elements
    document.querySelectorAll("#titleBar i").forEach(function(value, index, array) {
        value.addEventListener("click", function() {
            ipcRenderer.sendSync("titleBar", value.getAttribute("data-action"));
        }, false);
    });

    document.querySelector("#titleBar img").addEventListener("click", function() {
        while (document.querySelectorAll("#songs [data-type='audio']").length > 0) {
            document.querySelector("#songs [data-type='audio']").remove();
        }
        ipcRenderer.sendSync("titleBar", "loadFolder");

    });

    ipcRenderer.on("addSong", (event, msg) => {
        const base64 = "data:image/png;base64,";
        var path = msg.path;
        var title = msg.title;
        var artist = msg.artist[0];
        var album = msg.album;
        var duration = formatDuration(msg.duration);
        var cover = msg.cover;
        var moddate = msg.moddate;

        var num = 0;
        var songs = document.querySelectorAll("#songs [data-type='audio']");
        if (songs.length > 0) {
            num = parseInt(songs[songs.length - 1].getAttribute("data-num")) + 1;
        }

        var template = '<li data-type="audio" data-num="' + num + '" data-path="' + path + '" data-cover-path="' + base64 + cover.data + '">';
        template += '<img src="' + base64 + cover.data + '" draggable="false">';
        template += '<p><span class="artist">' + artist.toUpperCase() + '</span>&nbsp;<span class="album">' + album.toUpperCase() + '</span></p>';
        template += '<p><span class="title">' + title.toUpperCase() + '</span><span class="duration">' + duration + '</span></p></li>';

        document.getElementById("songs").innerHTML += template;

        setTimeout(function() { // else not working
            updateSong(document.querySelector("#songs [data-num='" + num + "']"));
        });
    });

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
