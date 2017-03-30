var songsLoader = {

};

document.addEventListener("DOMContentLoaded", function() {
    // save last selected directory
    ipcRenderer.on("selAudioDir", (event, msg) => {
        localStorage.setItem("selAudioDir", msg);
    });

    // load songs from last selected directory
    if (localStorage.getItem("selAudioDir")) {
        setTimeout(function() {
            ipcRenderer.send("loadAudioFromDir", localStorage.getItem("selAudioDir"));
        }, 5);
    }

    ipcRenderer.on("addSong", (event, msg) => {
        while (document.querySelectorAll("#songs [data-type='info']").length > 0) {
            document.querySelector("#songs [data-type='info']").remove();
        }

        var num = 0;
        var path = msg.path;

        var title = msg.title;
        if (typeof title === "undefined") {
            title = "unknown title";
        }

        var artist = msg.artist[0];
        if (typeof artist === "undefined") {
            artist = "unknown artist";
        }

        var album = msg.album;
        if (typeof album === "undefined" || album == "") {
            album = null;
        }
        var duration = formatDuration(msg.duration);
        var moddate = msg.moddate;
        var cover = null;

        if (typeof msg.cover != "undefined") {
            cover = "data:image/" + msg.cover.format + ";base64,";
            cover += msg.cover.data;
        } else {
            cover = "./assets/img/default.jpg";
        }

        var songs = document.querySelectorAll("#songs [data-type='audio']");
        if (songs.length > 0) {
            num = parseInt(songs[songs.length - 1].getAttribute("data-num")) + 1;
        }

        var template = '<li data-type="audio" data-num="' + num + '" data-path="' + path + '" data-cover-path="' + cover + '" data-moddate="' + moddate + '">';
        template += '<img src="' + cover + '" draggable="false">';
        template += '<p><span class="artist">' + artist + '</span>';
        if (album) {
            template += '&nbsp;<span class="album">' + album + '</span>';
        }
        template += '</p><p><span class="title">' + title + '</span><span class="duration">' + duration + '</span></p></li>';

        document.getElementById("songs").innerHTML += template;

        // as it's on a timeout it only will be executed one
        setTimeout(function() {
            updateSongs();
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
