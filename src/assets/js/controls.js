if (typeof audioplayer == "undefined") {
    throw "audioplayer is required";
} else {
    function updateSongs() {
        var songs = document.querySelectorAll("[data-type='audio']");
        for (var i = 0; i < songs.length; i++) {
            updateSong(songs[i])
        }
    }

    function updateSong(song) {
        song.removeEventListener("click", play, false);
        song.addEventListener("click", play, false);
    }

    function play() {
        var song = new Song(this, this.getAttribute("data-path"), {
            title: this.querySelector(".title"),
            artist: this.querySelector(".artist"),
            album: this.querySelector(".album"),
            duration: this.querySelector(".duration"),
            cover: this.getAttribute("data-cover-path"),
            moddate: this.getAttribute("data-moddate")
        });
        audioplayer.newSong(song);
    }

    function clickPercent(element, e) {
        return (e.pageX - element.getBoundingClientRect().left) / element.offsetWidth;
    }

    function movePlayHead(element, e) {
        var timelintWidth = parseInt(element.offsetWidth);
        var newLeftMargin = e.pageX - element.getBoundingClientRect().left;
    }

    window.addEventListener("variablesLoaded", function() {
        audioplayer.elements.timeline.timeline.addEventListener("click", function() {
            if (audioplayer.audio.object.src) {
                movePlayHead(audioplayer.elements.timeline.timeline, event);
                audioplayer.audio.object.currentTime = audioplayer.audio.object.duration * clickPercent(audioplayer.elements.timeline.timeline, event);
            }
        }, false);

        audioplayer.elements.buttons.play.addEventListener("click", function() {
            audioplayer.play();
        }, false);

        audioplayer.elements.buttons.pause.addEventListener("click", function() {
            audioplayer.pause();
        }, false);

        audioplayer.elements.buttons.stop.addEventListener("click", function() {
            audioplayer.stop();
        }, false);

        audioplayer.elements.buttons.previousSong.addEventListener("click", function() {
            audioplayer.previousSong();
        }, false);

        audioplayer.elements.buttons.nextSong.addEventListener("click", function() {
            audioplayer.nextSong();
        }, false);

        for (var i=0; i < audioplayer.elements.buttons.repeat.length; i++) {
            audioplayer.elements.buttons.repeat[i].addEventListener("click", function() {
                audioplayer.repeat(this);
            }, false);
        }

        for (var i=0; i < audioplayer.elements.buttons.random.length; i++) {
            audioplayer.elements.buttons.random[i].addEventListener("click", function() {
                audioplayer.random();
            });
        }

        for (var i=0; i < audioplayer.elements.buttons.volumeIndicator.length; i++) {
            audioplayer.elements.buttons.volumeIndicator[i].addEventListener("click", function() {
                audioplayer.volumeMute();
            }, false);
        }

        var hotKeys;
        require("electron").ipcRenderer.on("keyPress", (event, action) => {

            switch (action) {
                case "volumeUp":
                    audioplayer.volumeUp();
                    break;

                case "volumeDown":
                    audioplayer.volumeDown();
                    break;

                case "toggleMute":
                    audioplayer.volumeMute();
                    break

                case "previousSong":
                    audioplayer.previousSong();
                    break;

                case "nextSong":
                    audioplayer.nextSong();
                    break;

                case "playPause":
                    if (audioplayer.audio.object.paused) {
                        audioplayer.play();
                    } else {
                        audioplayer.pause();
                    }
                    break;

                case "stop":
                    audioplayer.stop();
                    break;

                default:
                    console.log("Hotkey: " + action);
                    break;
            }

        });

        audioplayer.log("Controls loaded");
    });

}
