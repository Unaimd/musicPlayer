document.addEventListener("DOMContentLoaded", function() {
    initVariables();

    window.addEventListener("variablesLoaded", audioplayer.loadFromLocalStorage(), false);
});

var audioplayer = {
    name: "audioplayer",
    log: true,

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
        volumeUpValue: 50
    },
    config: {
        swalTimer: 1500,
        scrollAnimationDuration: 500,
        scrollEnabled: true
    },

    newSong: function(aElement) {
        audioplayer.stop();

        try {
            document.querySelector("[data-type='audio'].active").className = document.querySelector("[data-type='audio'].active").className.replace(" active", "");
        } catch (error) {
            // no element was active
        }
        aElement.className += " active";

        // get song info
        var path = aElement.getAttribute("data-path");
        var title = aElement.getElementsByClassName("title")[0];
        var artist = aElement.getElementsByClassName("artist")[0];
        var album = aElement.getElementsByClassName("album")[0];
        var duration = aElement.getElementsByClassName("duration")[0];
        var coverImage = aElement.getElementsByTagName("img")[0].getAttribute("src");

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
            // start new object
            audioplayer.audio.object = new Audio(path);
            audioplayer.play();

            audioplayer.audio.object.addEventListener("timeupdate", audioplayer.timeUpdate, false);
        }

    },
    play: function() {
        if (!audioplayer.audio.object.src) {
            swal({
                title: 'Error',
                text: 'No hay ninguna canción seleccionada',
                type: 'error',
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });
            return;
        }

        audioplayer.audio.object.volume = audioplayer.audio.volume / 100;
        audioplayer.audio.object.muted = audioplayer.audio.muted;

        audioplayer.audio.object.play();
        audioplayer.audio.object.addEventListener("ended", function() {
            audioplayer.onended();
        }, false);

        // update document title
        // update doument icon

        audioplayer.scroll(document.getElementById("songs"), document.querySelector("#songs .active"), audioplayer.config.scrollAnimationDuration);

        audioplayer.elements.buttons.play.style.display = "none";
        audioplayer.elements.buttons.pause.style.display = "inline-block";

    },
    pause: function() {
        audioplayer.audio.object.pause();

        // set default document title

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
        if (!active) {
            return;
        }

        active = parseInt(active.getAttribute("data-num"));
        var totalSongs = parseInt(document.querySelectorAll("#songs [data-type='audio']").length);

        if (active < totalSongs) {
            var next = document.querySelector("#songs [data-num='" + (active + 1) + "']");
            audioplayer.newSong(next);

            // load more songs via ajax

        } else {
            swal({
                title: 'Siguiente canción no disponible',
                text: 'No hay mas canciones que reproducir',
                type: 'info',
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });
        }
    },
    previousSong: function() {
        var active = document.querySelector("#songs .active");
        if (!active) {
            return;
        }

        active = parseInt(active.getAttribute("data-num"));

        if (active > 0) {
            var previous = document.querySelector("#songs [data-num='" + (active - 1)  + "']");

            audioplayer.newSong(previous);

        } else {
            swal({
                title: '¡Canción anterior no disponible!',
                text: 'No hay ninguna cancion anterior a la actual',
                type: 'error',
                showConfirmButton: false,
                timer: audioplayer.config.swalTimer
            });
        }
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
                var px = parent.scrollTop + element.getBoundingClientRect().top - element.clientHeight * 1.25;
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
