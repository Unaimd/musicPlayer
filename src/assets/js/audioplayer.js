document.addEventListener("DOMContentLoaded", () => {
    initVariables();

    window.addEventListener("variablesLoaded", audioplayer.loadFromLocalStorage(), false);
});

var audioplayer = {
    name: "audioplayer",
    log: true,
    windowDefaultTitle: null,

    elements: {
        player: null,
        title: null,
        artist: null,
        album: null,
        cover: null,

        buttons: {
            play: null,
            pause: null,

            stop: null,

            previousSong: null,
            nextSong: null,

            repeat: null,
            repeatNone: null,
            repeatAll: null,
            repeatOne: null,

            random: null,
            randomOn: null,
            randomOff: null,

            volumeIndicator: null,
            volumeUp: null,
            volumeDown: null,
            volumeMute: null,
            volumeRange: null
        },
        timeline: {
            timeline: null,
            input: null,
            played: null,
            total: null
        }
    },
    audio: {
        object: new Audio(),
        currentTime: 0,
        volume: 100,
        repeat: "none",
        muted: false,
        volumeUpValue: 50,
        random: false
    },
    config: {
        swalTimer: 1500,
        scrollAnimationDuration: 500,
        scrollEnabled: true,
        restartOnFirst: true,
        restartOnLast: true
    },

    newSong: (song) => {
        if (song instanceof Song) {
            var path = song.path;
            var title = song.title;
            var artist = song.artist;
            var album = song.album;
            var duration = song.duration;
            var coverImage = song.cover;
            var aElement = song.element;
        } else {
            if (audioplayer.log) {
                swal({
                    title: "Not valid Song",
                    text: "The given element should be a Song object",
                    type: "error",
                    showConfirmButton: false,
                    timer: audioplayer.config.swalTimer
                });
            }

            throw new Error("The given element should be a Song object");
            return;
        }

        audioplayer.stop();

        try {
            document.querySelector("[data-type='audio'].active").className = document.querySelector("[data-type='audio'].active").className.replace("active", "");
        } catch (error) {
            // no element was active
        }
        aElement.className += " active";


        // set new info
        audioplayer.elements.title.innerText = title.innerText;

        if (typeof artist != "undefined") {
            audioplayer.elements.artist.innerText = artist.innerText;
        } else {
            audioplayer.elements.artist.innerText = null;
        }

        if (typeof album != "undefined") {
            audioplayer.elements.album.innerText = album.innerText;
        } else {
            audioplayer.elements.album.innerText = null;
        }

        audioplayer.elements.cover.setAttribute("src", coverImage);
        audioplayer.elements.timeline.total.innerText = duration.innerText;

        // test if browser supports audio format
        var extSplit = path.split(".");
        var format = extSplit[extSplit.length - 1];

        if (!! audioplayer.audio.object.canPlayType("audio/" + format) === false) {

            swal({
                title: "Invalid format",
                text: "We can't play that song as it's file format " + format.toUpperCase() + " is not supported by this player",
                type:  "error",
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });

        } else {
            audioplayer.audio.object = new Audio(path);
            audioplayer.play();

            if (audioplayer.random && document.querySelectorAll("#songs [data-random-num]").length == 0) {
                audioplayer.randomOrder();
            }

            audioplayer.audio.object.addEventListener("timeupdate", audioplayer.timeUpdate, false);
        }

    },
    play: () => {
        if (!audioplayer.audio.object.src) {
            swal({
                title: 'No song playing',
                text: 'Select a song to play!',
                type: 'error',
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });
            return;
        }

        // update window title with songs info
        if (audioplayer.windowDefaultTitle === null) {
            audioplayer.windowDefaultTitle = document.body.getAttribute("data-default-title");
        }
        var activeSong = document.querySelector("#songs .active");
        // ─ = alt + 196
        document.title = activeSong.querySelector(".title").innerText + " ─ " + activeSong.querySelector(".artist").innerText + " ── " + audioplayer.windowDefaultTitle;

        audioplayer.audio.object.volume = audioplayer.audio.volume / 100;
        audioplayer.audio.object.muted = audioplayer.audio.muted;

        audioplayer.audio.object.play();
        audioplayer.audio.object.addEventListener("ended", () => {
            audioplayer.onended();
        }, false);

        audioplayer.scroll(document.getElementById("songs"), document.querySelector("#songs .active"), audioplayer.config.scrollAnimationDuration);

        audioplayer.elements.buttons.play.style.display = "none";
        audioplayer.elements.buttons.pause.style.display = "inline-block";

    },
    pause: () => {
        audioplayer.audio.object.pause();

        // set default document title
        document.title = audioplayer.windowDefaultTitle;

        audioplayer.elements.buttons.pause.style.display = "none";
        audioplayer.elements.buttons.play.style.display = "inline-block";
    },
    stop: () => {
        audioplayer.pause();
        audioplayer.audio.object.currentTime = 0;
        audioplayer.elements.timeline.input.style.marginLeft = "0px";
    },
    nextSong: () => {
        var active = document.querySelector("#songs .active");
        var next = null;
        if (!active) {
            return;
        }

        var songs = document.querySelectorAll("#songs [data-type='audio']");
        var totalSongs = parseInt(songs[songs.length - 1].getAttribute("data-num"));

        if (!audioplayer.audio.random) {

            active = parseInt(active.getAttribute("data-num"));

            if (active < totalSongs) {
                next = new Song(document.querySelector("#songs [data-num='" + (active + 1) + "']"));

            } else if (audioplayer.config.restartOnLast) {
                next = new Song(document.querySelector("#songs [data-type='audio']"));

            }

        } else {
            active = parseInt(active.getAttribute("data-random-num"));

            if (active < totalSongs) {
                next = new Song(document.querySelector("#songs [data-random-num='" + (active + 1) + "']"));

            } else if (audioplayer.config.restartOnLast) {
                next = new Song(document.querySelector("#songs [data-random-num='0']"));

            }

        }

        if (next == null) {
            swal({
                title: 'Next song not available!',
                text: 'There aren\'t more songs to play',
                showConfirmButton: false,
                type: 'info',
                timer: audioplayer.config.swalTimer
            });
        } else {
            next.parse();
            audioplayer.newSong(next);
        }
    },
    previousSong: () => {
        var active = document.querySelector("#songs .active");
        var previous = null;
        if (!active) {
            return;
        }

        if (audioplayer.audio.object.currentTime > 3) {
            previous = new Song(document.querySelector("#songs .active"));

        } else if (!audioplayer.audio.random) {

            var firstSong = document.querySelector("#songs [data-type='audio']");
            active = parseInt(active.getAttribute("data-num"));

            if (active > parseInt(firstSong.getAttribute("data-num"))) {
                previous = new Song(document.querySelector("#songs [data-num='" + (active - 1)  + "']"));

            } else if (active == parseInt(firstSong.getAttribute("data-num")) && audioplayer.config.restartOnFirst) {
                var allSongs = document.querySelectorAll("#songs [data-type='audio']");
                previous = new Song(allSongs[allSongs.length - 1]);
            }

        } else {

            var firstSong = document.querySelector("#songs [data-random-num='0']");
            active = parseInt(active.getAttribute("data-random-num"));

            if (active > parseInt(firstSong.getAttribute("data-random-num"))) {
                previous = new Song(document.querySelector("#songs [data-random-num='" + (active - 1) + "']"));

            } else if (active == parseInt(firstSong.getAttribute("data-random-num")) && audioplayer.config.restartOnLast) {
                var allSongs = document.querySelectorAll("#songs [data-type='audio']");
                previous = new Song(document.querySelector("#songs [data-random-num='" + (allSongs.length - 1) + "']"));

            }

        }

        if (previous == null) {
            swal({
                title: 'Previous song not available!',
                text: 'There isn\'t any song previous to the one is playing',
                type: 'error',
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });

            return;

        } else {
            previous.parse();
            audioplayer.newSong(previous);
        }
    },
    repeat: (repeat) => {
        var mode = repeat.getAttribute("data-mode");
        var button;

        repeat.style.display = "none";

        switch (mode) {
            case "none":
                mode = "all";
                button = audioplayer.elements.buttons.repeatAll;
                break;
            case "all":
                mode = "one";
                button = audioplayer.elements.buttons.repeatOne;
                break;
            case "one":
                mode = "none";
                button = audioplayer.elements.buttons.repeatNone;
                break;
        }

        audioplayer.audio.repeat = mode;
        localStorage.audioRepeat = mode;
        button.style.display = "inline-block";
    },
    setVolume: (newVolume) => {
        newVolume = parseInt(newVolume);
        if (newVolume > 100 || newVolume < 0) {
            throw new Error("Invalid volume value must be 0-100 range");
            return;
        }

        audioplayer.audio.object.volume = newVolume / 100;
        audioplayer.audio.volume = newVolume;

        for (var i=0; i < audioplayer.elements.buttons.volumeIndicator.length; i++) {
            audioplayer.elements.buttons.volumeIndicator[i].setAttribute("data-volume", audioplayer.audio.volume);
        }

        if (audioplayer.audio.volume >= audioplayer.audio.volumeUpValue && audioplayer.audio.muted == false) {
            audioplayer.elements.buttons.volumeUp.style.display = "inline-block";
            audioplayer.elements.buttons.volumeDown.style.display = "none";

        } else if (audioplayer.audio.volume < audioplayer.audio.volumeUpValue && audioplayer.audio.muted == false) {
            audioplayer.elements.buttons.volumeDown.style.display = "inline-block";
            audioplayer.elements.buttons.volumeUp.style.display = "none";
        }

        audioplayer.elements.buttons.volumeRange.value = audioplayer.audio.volume;
        localStorage.audioVolume = audioplayer.audio.volume;
    },
    volumeUp: () => {
        if (audioplayer.audio.volume < 100) {
            audioplayer.setVolume(audioplayer.audio.volume + 2);
        }
    },
    volumeDown: () => {
        if (audioplayer.audio.volume > 0) {
            audioplayer.setVolume(audioplayer.audio.volume - 2);
        }
    },
    volumeMute: () => {
        if (!audioplayer.audio.muted) {
            audioplayer.audio.object.muted = true;
            audioplayer.audio.muted = true;

            audioplayer.elements.buttons.volumeUp.style.display = "none";
            audioplayer.elements.buttons.volumeDown.style.display = "none";
            audioplayer.elements.buttons.volumeMute.style.display = "inline-block";

            audioplayer.elements.buttons.volumeRange.value = 0;

        } else {
            audioplayer.audio.object.muted = false;
            audioplayer.audio.muted = false;

            audioplayer.elements.buttons.volumeMute.style.display = "none";

            if (audioplayer.audio.volume > audioplayer.audio.volumeUpValue) {
                audioplayer.elements.buttons.volumeUp.style.display = "inline-block";
            } else {
                audioplayer.elements.buttons.volumeDown.style.display = "inline-block";
            }

            audioplayer.elements.buttons.volumeRange.value = audioplayer.audio.volume;
        }
    },
    random: () => {
        var random;
        var songs = [].slice.call(document.querySelectorAll("#songs [data-type='audio']"), 0);

        if (audioplayer.audio.random) {
            random = +false;

            songs.forEach((song) => {
                song.removeAttribute("data-random-num");
            });

            audioplayer.elements.buttons.randomOn.style.display = "none";
            audioplayer.elements.buttons.randomOff.style.display = "inline-block";

        } else {
            random = +true;

            audioplayer.randomOrder();

            audioplayer.elements.buttons.randomOff.style.display = "none";
            audioplayer.elements.buttons.randomOn.style.display = "inline-block";
        }

        audioplayer.audio.random = random;
        localStorage.setItem("audioRandom", random);
    },
    randomOrder: (songs) => {
        var songs = [].slice.call(document.querySelectorAll("#songs [data-type='audio']"), 0);
        var rndSongNumber;

        while(songs.length > 0) {
            rndSongNumber = Math.round(Math.random() * (songs.length - 1));

            songs[rndSongNumber].setAttribute("data-random-num", document.querySelectorAll("#songs [data-type='audio']").length - songs.length);
            songs.splice(rndSongNumber, 1);
        }

        return true;
    },
    onended: () => {
        audioplayer.stop();

        switch (audioplayer.audio.repeat) {
            case "all":
                audioplayer.nextSong();
                break;
            case "one":
                audioplayer.play();
                break;
        }
    },
    timeUpdate: () => {
        var percent = (audioplayer.audio.object.currentTime / audioplayer.audio.object.duration) * 100;
        audioplayer.elements.timeline.input.style.left = "calc(" + percent + "% - 5px)";

        var curTime = Math.round(audioplayer.audio.object.currentTime);

        var curMin = 0;
        var curSec = 0;

        if (curTime < 60) {
            curSec = curTime;
        } else {
            curMin = Math.floor(curTime / 60);
            curSec = curTime - curMin * 60;
        }

        if (curMin < 10) {
            curMin = "0" + curMin;
        }
        if (curSec < 10) {
            curSec = "0" + curSec;
        }

        audioplayer.elements.timeline.played.innerText = curMin + ":" + curSec;
    },

    scroll: (parent, element, duration) => {
        if (duration <= 0) {
            return;
        }

        // mouse not over parent
        if (parent.querySelector(":hover") === null) {
            if (typeof element == "object") {
                try {
                    var px = parent.scrollTop + element.getBoundingClientRect().top - element.clientHeight * 1.25;
                } catch (error) {
                    if (error) {
                        return;
                    }
                }
            } else {
                var px = element;
            }

            var diff = px - parent.scrollTop;
            var perTick = diff / duration * 10;

            setTimeout(() => {
                parent.scrollTop = parent.scrollTop + perTick;
                if (parent.scrollTop == px) {
                    return;
                }
                audioplayer.scroll(parent, px, parseInt(duration - 10));
            }, 10);
        }
    },
    loadFromLocalStorage: () => {
        var lsAudioVolume = localStorage.getItem("audioVolume");
        if (lsAudioVolume == null) {
            localStorage.setItem("audioVolume", audioplayer.audio.volume);
            audioplayer.elements.buttons.volumeRange.value = audioplayer.audio.volume;
        } else {
            audioplayer.audio.volume = parseInt(lsAudioVolume);
            audioplayer.elements.buttons.volumeRange.value = audioplayer.audio.volume;
        }

        for (var i = 0; i < audioplayer.elements.buttons.volumeIndicator.length; i++) {
            audioplayer.elements.buttons.volumeIndicator[i].setAttribute("data-volume", Math.floor(audioplayer.audio.volume))
        }

        var lsAudioRepeat = localStorage.getItem("audioRepeat");
        if (lsAudioRepeat == null) {
            localStorage.setItem("audioRepeat", audioplayer.audio.repeat);
        } else {
            audioplayer.audio.repeat = lsAudioRepeat;
        }

        for (var i = 0; i < audioplayer.elements.buttons.repeat.length; i++) {
            audioplayer.elements.buttons.repeat[i].style.display = "none";
        }

        switch (audioplayer.audio.repeat) {
            case "none":
                audioplayer.elements.buttons.repeatNone.style.display = "inline-block";
                break;
            case "all":
                audioplayer.elements.buttons.repeatAll.style.display = "inline-block";
                break;
            case "one":
                audioplayer.elements.buttons.repeatOne.style.display = "inline-block";
                break;
        }

        var lsAudioRandom = localStorage.getItem("audioRandom");
        if (lsAudioRandom == null) {
            localStorage.setItem("audioRandom", audioplayer.audio.random);
        } else {
            audioplayer.audio.random = +lsAudioRandom;
            if (lsAudioRandom == true) {
                audioplayer.elements.buttons.randomOff.style.display = "none";
                audioplayer.elements.buttons.randomOn.style.display = "inline-block";
            } else {
                audioplayer.elements.buttons.randomOn.style.display = "none";
                audioplayer.elements.buttons.randomOff.style.display = "inline-block";
            }
        }
    },
    log: (txt) => {
        if (audioplayer.log) {
            console.info(audioplayer.name + ": " + txt);
        }
    }
};

// audioplayer HTML elements
function initVariables() {
    var variablesLoadedEvnt = new CustomEvent("variablesLoaded", {
        detail: "Audioplayer variables loaded",
        bubbles: false,
        cancelable: false
    });

    audioplayer.elements.player = document.getElementById("audioplayer");
    audioplayer.elements.title = audioplayer.elements.player.getElementsByClassName("title")[0];
    audioplayer.elements.artist = audioplayer.elements.player.getElementsByClassName("artist")[0].getElementsByClassName("content")[0];
    audioplayer.elements.album = audioplayer.elements.player.getElementsByClassName("album")[0].getElementsByClassName("content")[0];
    audioplayer.elements.cover = audioplayer.elements.player.getElementsByTagName("img")[0];


    audioplayer.elements.buttons.play = audioplayer.elements.player.querySelector("[name='play']");
    audioplayer.elements.buttons.pause = audioplayer.elements.player.querySelector("[name='pause']");

    audioplayer.elements.buttons.stop = audioplayer.elements.player.querySelector("[name='stop']");

    audioplayer.elements.buttons.previousSong = audioplayer.elements.player.querySelector("[name='previousSong']");
    audioplayer.elements.buttons.nextSong = audioplayer.elements.player.querySelector("[name='nextSong']");

    audioplayer.elements.buttons.repeat = audioplayer.elements.player.querySelectorAll("[name='repeat']");
    audioplayer.elements.buttons.repeatNone = audioplayer.elements.player.querySelector("[name='repeat'][data-mode='none']");
    audioplayer.elements.buttons.repeatAll = audioplayer.elements.player.querySelector("[name='repeat'][data-mode='all']");
    audioplayer.elements.buttons.repeatOne = audioplayer.elements.player.querySelector("[name='repeat'][data-mode='one']");

    audioplayer.elements.buttons.random = audioplayer.elements.player.querySelectorAll("[name='random']");
    audioplayer.elements.buttons.randomOn = audioplayer.elements.player.querySelector("[name='random'][data-mode='active']");
    audioplayer.elements.buttons.randomOff = audioplayer.elements.player.querySelector("[name='random'][data-mode='disabled']");

    audioplayer.elements.buttons.volumeIndicator = audioplayer.elements.player.querySelectorAll("[name='volume']");
    audioplayer.elements.buttons.volumeUp = audioplayer.elements.player.querySelector("[name='volume'][data-mode='up']");
    audioplayer.elements.buttons.volumeDown = audioplayer.elements.player.querySelector("[name='volume'][data-mode='down']");
    audioplayer.elements.buttons.volumeMute = audioplayer.elements.player.querySelector("[name='volume'][data-mode='mute']");
    audioplayer.elements.buttons.volumeRange = audioplayer.elements.player.querySelector("[name='volumeRange']");


    audioplayer.elements.timeline.timeline = audioplayer.elements.player.getElementsByClassName("range")[0];
    audioplayer.elements.timeline.input = audioplayer.elements.player.getElementsByClassName("input")[0];
    audioplayer.elements.timeline.played = audioplayer.elements.player.getElementsByClassName("begin")[0];
    audioplayer.elements.timeline.total = audioplayer.elements.player.getElementsByClassName("end")[0];

    audioplayer.log("Variables loaded");
    window.dispatchEvent(variablesLoadedEvnt);
}
