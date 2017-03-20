document.addEventListener("DOMContentLoaded", function() {
    initVariables();
    initObject();

    loadFromLocalStorage();
});

var audioplayer = {
    version: "0.0.1",
    name: "Audioplayer",

    play: function(song) {
        alert(song );
    },
    log: function(txt) {
        console.info(audioplayer.name + " v" + audioplayer.version + ": " + txt);
    }
};

// audioplayer HTML elements
function initVariables() {
    audioplayer.elements = {};

    audioplayer.elements.player = document.getElementById("audioplayer");
    audioplayer.elements.title = audioplayer.elements.player.getElementsByClassName("title")[0];
    audioplayer.elements.artist = audioplayer.elements.player.getElementsByClassName("artist")[0].getElementsByClassName("content")[0];
    audioplayer.elements.album = audioplayer.elements.player.getElementsByClassName("album")[0].getElementsByClassName("content")[0];
    audioplayer.elements.cover = audioplayer.elements.player.getElementsByTagName("img")[0];


    audioplayer.elements.buttons = {};

    audioplayer.elements.buttons.play = audioplayer.elements.player.querySelector("[name='play']");
    audioplayer.elements.buttons.pause = audioplayer.elements.player.querySelector("[name='pause']");

    audioplayer.elements.buttons.stop = audioplayer.elements.player.querySelector("[name='stop']");

    audioplayer.elements.buttons.previousSong = audioplayer.elements.player.querySelector("[name='before']");
    audioplayer.elements.buttons.nextSong = audioplayer.elements.player.querySelector("[name='after']");

    audioplayer.elements.buttons.repeat = audioplayer.elements.player.querySelector("[name='repeat']");
    audioplayer.elements.buttons.repeatNone = audioplayer.elements.player.querySelector("[name='repeat'][data-mode='none']");
    audioplayer.elements.buttons.repeatAll = audioplayer.elements.player.querySelector("[name='repeat'][data-mode='all']");
    audioplayer.elements.buttons.repeatOne = audioplayer.elements.player.querySelector("[name='repeat'][data-mode='one']");

    audioplayer.elements.buttons.volumeIndicator = audioplayer.elements.player.querySelector("[name='volume']");
    audioplayer.elements.buttons.volumeUp = audioplayer.elements.player.querySelector("[name='volume'][data-mode='up']");
    audioplayer.elements.buttons.volumeDown = audioplayer.elements.player.querySelector("[name='volume'][data-mode='down']");
    audioplayer.elements.buttons.volumeMute = audioplayer.elements.player.querySelector("[name='volume'][data-mode='mute']");


    audioplayer.elements.timeline = {};

    audioplayer.elements.timeline.timeline = audioplayer.elements.player.getElementsByClassName("range")[0];
    audioplayer.elements.timeline.input = audioplayer.elements.timeline.timeline.getElementsByClassName("input")[0];
    audioplayer.elements.timeline.played = audioplayer.elements.timeline.timeline.getElementsByClassName("begin")[0];
    audioplayer.elements.timeline.total = audioplayer.elements.timeline.timeline.getElementsByClassName("end")[0];

    audioplayer.log("Variabled loaded");
}

// audio objects & properties
function initObject() {
     audioplayer.audio = {};

     audioplayer.audio.object = new Audio();

     audioplayer.audio.currentTime = audioplayer.audio.object.currentTime;
     audioplayer.audio.volume = 1;
     audioplayer.audio.repeat = "none";
     audioplayer.audio.muted = false;
     audioplayer.audio.volumeUpValue = 0.5;


     audioplayer.config = {};

     audioplayer.config.moreSongs = true;
     audioplayer.config.folder = "/";
     audioplayer.config.loadAfter = 30;
     audioplayer.config.swalTimer = 1500;
     audioplayer.config.scrollAnimationDuration = 500;
     audioplayer.config.scrollEnabled = true;

     audioplayer.log("Object and Properties loaded");
}

// load data from localStorage
function loadFromLocalStorage() {
    var lsAudioVolume = localStorage.audioVolume;
    if (typeof lsAudioVolume == "undefined") {
        localStorage.audioVolume = audioplayer.audio.volume * 100;
    } else {
        audioplayer.audio.volume = parseInt(lsAudioVolume) / 100;
    }
    audioplayer.elements.buttons.volumeIndicator.setAttribute("data-volume", Math.floor(audioplayer.audio.volume * 100));

    var lsAudioRepeat = localStorage.audioRepeat;
    if (typeof lsAudioRepeat == "undefined") {
        localStorage.audioRepeat = audioplayer.audio.repeat;
    } else {
        audioplayer.audio.repeat = lsAudioRepeat;
    }

    audioplayer.elements.buttons.repeat.style.display = "none";

    switch(audioplayer.audio.repeat) {
        case "all":
            audioplayer.elements.buttons.repeatAll.style.display = "inline-block";
            break;
        case "one":
            audioplayer.elements.buttons.repeatOne.style.display = "inline-block";
            break;
        case "none":
            audioplayer.elements.buttons.repeaNone.style.display = "inline-block";
            break;
    }
}
