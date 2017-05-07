document.addEventListener("DOMContentLoaded", function() {
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
            volumeMute: null
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

    newSong: function(song) {
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
            document.querySelector("[data-type='audio'].active").className = document.querySelector("[data-type='audio'].active").className.replace(" active", "");
        } catch (error) {
            // no element was active
        }
        aElement.className += " active";


        // set new info
        audioplayer.elements.title.innerHTML = title.innerHTML;

        if (typeof artist != "undefined") {
            audioplayer.elements.artist.innerHTML = artist.innerHTML;
        } else {
            audioplayer.elements.artist.innerHTML = null;
        }

        if (typeof album != "undefined") {
            audioplayer.elements.album.innerHTML = album.innerHTML;
        } else {
            audioplayer.elements.album.innerHTML = null;
        }

        audioplayer.elements.cover.setAttribute("src", coverImage);
        audioplayer.elements.timeline.total.innerHTML = duration.innerHTML;

        // test if browser supports audio format
        var extSplit = path.split(".");
        var format = extSplit[extSplit.length - 1];

        if (!! audioplayer.audio.object.canPlayType("audio/" + format) === false) {

            swal({
                title: "Formato no soportado",
                text: "No es posible reproducir la cancion, tu navegador no soporta el formato " + format.toUpperCase(),
                type:  "error",
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });

        } else {
            audioplayer.audio.object = new Audio(path);
            audioplayer.play();

            audioplayer.audio.object.addEventListener("timeupdate", audioplayer.timeUpdate, false);
        }

    },
    play: function() {
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
        document.title = activeSong.querySelector(".title").innerHTML + " ─ " + activeSong.querySelector(".artist").innerHTML + " ── " + audioplayer.windowDefaultTitle;

        audioplayer.audio.object.volume = audioplayer.audio.volume / 100;
        audioplayer.audio.object.muted = audioplayer.audio.muted;

        audioplayer.audio.object.play();
        audioplayer.audio.object.addEventListener("ended", function() {
            audioplayer.onended();
        }, false);

        if (audioplayer.audio.random) {
            document.querySelector(".active").setAttribute("data-random-played", true);
        }

        audioplayer.scroll(document.getElementById("songs"), document.querySelector("#songs .active"), audioplayer.config.scrollAnimationDuration);

        audioplayer.elements.buttons.play.style.display = "none";
        audioplayer.elements.buttons.pause.style.display = "inline-block";

    },
    pause: function() {
        audioplayer.audio.object.pause();

        // set default document title
        document.title = audioplayer.windowDefaultTitle;

        audioplayer.elements.buttons.pause.style.display = "none";
        audioplayer.elements.buttons.play.style.display = "inline-block";
    },
    stop: function() {
        audioplayer.pause();
        audioplayer.audio.object.currentTime = 0;
        audioplayer.elements.timeline.input.style.marginLeft = "0px";
    },
    nextSong: function() {
        var active = document.querySelector("#songs .active");
        var next = null;
        if (!active) {
            return;
        }

        if (!audioplayer.audio.random) {

            active = parseInt(active.getAttribute("data-num"));
            var songs = document.querySelectorAll("#songs [data-type='audio']");
            var totalSongs = parseInt(songs[songs.length - 1].getAttribute("data-num"));

            if (active < totalSongs) {
                next = new Song(document.querySelector("#songs [data-num='" + (active + 1) + "']"));

            } else if (audioplayer.config.restartOnLast) {
                next = new Song(document.querySelector("#songs [data-type='audio']"));

            }

        } else {
            var availableSongs = document.querySelectorAll("#songs [data-type='audio'][data-random-played='false']");
            var totalSongs = document.querySelectorAll("#songs [data-type='audio']").length;

            if (availableSongs.length > 0) {
                var rndSongNumber = Math.round(Math.random() * (availableSongs.length - 1));
                next = new Song(availableSongs[rndSongNumber]);

            } else if (audioplayer.config.restartOnLast) {
                var songs = document.querySelectorAll("#songs [data-type='audio'][data-random-played='true']");
                songs.forEach(function(song) {
                    song.setAttribute("data-random-played", false);
                });

                // repeat function
                audioplayer.nextSong();
                return;
            }

        }
        if (next == null) {
            swal({
                title: 'Siguiente canción no disponible ',
                text: 'No hay mas canciones que reproducir',
                type: 'info',
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });
        } else {
            next.parse();
            audioplayer.newSong(next);
        }
    },
    previousSong: function() {
        var firstSong = document.querySelector("#songs [data-type='audio']");
        var active = document.querySelector("#songs .active");
        if (!active) {
            return;
        }

        active = parseInt(active.getAttribute("data-num"));

        if (active > parseInt(firstSong.getAttribute("data-num"))) {
            var previous = new Song(document.querySelector("#songs [data-num='" + (active - 1)  + "']"));

        } else if (active == parseInt(firstSong.getAttribute("data-num")) && audioplayer.config.restartOnFirst) {
            var allSongs = document.querySelectorAll("#songs [data-type='audio']");
            var previous = new Song(allSongs[allSongs.length - 1]);

        } else {
            swal({
                title: '¡Canción anterior no disponible!',
                text: 'No hay ninguna cancion anterior a la actual',
                type: 'error',
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });

            return;
        }
        previous.parse();
        audioplayer.newSong(previous);
    },
    repeat: function(repeat) {
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
    volumeUp: function() {
        if (audioplayer.audio.volume < 100) {
            var newVolume = audioplayer.audio.volume + 2;

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

            localStorage.audioVolume = audioplayer.audio.volume;
        }
    },
    volumeDown: function() {
        if (audioplayer.audio.volume > 0) {
            var newVolume = audioplayer.audio.volume - 2;

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

            localStorage.audioVolume = audioplayer.audio.volume;
        }
    },
    volumeMute: function() {
        if (!audioplayer.audio.muted) {
            audioplayer.audio.object.muted = true;
            audioplayer.audio.muted = true;

            audioplayer.elements.buttons.volumeUp.style.display = "none";
            audioplayer.elements.buttons.volumeDown.style.display = "none";
            audioplayer.elements.buttons.volumeMute.style.display = "inline-block";

        } else {
            audioplayer.audio.object.muted = false;
            audioplayer.audio.muted = false;

            audioplayer.elements.buttons.volumeMute.style.display = "none";

            if (audioplayer.audio.volume > audioplayer.audio.volumeUpValue) {
                audioplayer.elements.buttons.volumeUp.style.display = "inline-block";
            } else {
                audioplayer.elements.buttons.volumeDown.style.display = "inline-block";
            }
        }
    },
    random: function() {
        var random;

        if (audioplayer.audio.random) {
            random = +false;

            var songs = document.querySelectorAll("#songs [data-random-played='true']");
            songs.forEach(function(song) {
                song.setAttribute("data-random-played", false);
            });

            audioplayer.elements.buttons.randomOn.style.display = "none";
            audioplayer.elements.buttons.randomOff.style.display = "inline-block";

        } else {
            random = +true;

            audioplayer.elements.buttons.randomOff.style.display = "none";
            audioplayer.elements.buttons.randomOn.style.display = "inline-block";
        }

        audioplayer.audio.random = random;
        localStorage.setItem("audioRandom", random);
    },
    onended: function() {
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
    timeUpdate: function() {
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

        audioplayer.elements.timeline.played.innerHTML = curMin + ":" + curSec;
    },

    scroll: function(parent, element, duration) {
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

            setTimeout(function () {
                parent.scrollTop = parent.scrollTop + perTick;
                if (parent.scrollTop == px) {
                    return;
                }
                audioplayer.scroll(parent, px, parseInt(duration - 10));
            }, 10);
        }
    },
    loadFromLocalStorage: function() {
        var lsAudioVolume = localStorage.getItem("audioVolume");
        if (lsAudioVolume == null) {
            localStorage.setItem("audioVolume", audioplayer.audio.volume)
        } else {
            audioplayer.audio.volume = parseInt(lsAudioVolume);
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
    log: function(txt) {
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


    audioplayer.elements.timeline.timeline = audioplayer.elements.player.getElementsByClassName("range")[0];
    audioplayer.elements.timeline.input = audioplayer.elements.player.getElementsByClassName("input")[0];
    audioplayer.elements.timeline.played = audioplayer.elements.player.getElementsByClassName("begin")[0];
    audioplayer.elements.timeline.total = audioplayer.elements.player.getElementsByClassName("end")[0];

    audioplayer.log("Variabled loaded");
    window.dispatchEvent(variablesLoadedEvnt);
}
