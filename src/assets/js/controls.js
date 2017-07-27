if (typeof audioplayer === "undefined") {
    throw "audioplayer is required";
} else {
    function updateSongs() {
        var songs = document.querySelectorAll(".hidden[data-type='audio']");
        for (var i = 0; i < songs.length; i++) {
            updateSong(songs[i]);
        }
    }

    function updateSong(song) {
        song.className = song.className.replace("hidden", "");
        song.className = song.className.replace("  ", " ");

        song.addEventListener("click", play, false);
        song.addEventListener("contextmenu", showContextMenu, false);
    }

    document.querySelector("*:not(#contextMenu)").addEventListener("click", hideContextMenu, false);
    document.querySelectorAll("#contextMenu li").forEach((element) => {
        element.addEventListener("click", () => {

            switch (element.getAttribute("data-target")) {
                case "toggle-theme":

                    var styles = document.head.querySelectorAll("[href$='.css']");

                    document.body.className += " no-transition";

                    if (document.body.getAttribute("data-theme") == "dark") {
                        document.body.setAttribute("data-theme", "light");

                        styles.forEach((element) => {
                            if (element.getAttribute("href").indexOf("/dark/") > 0) {
                                element.setAttribute("href", element.getAttribute("href").replace("/dark/", "/light/"));
                            }
                        });

                    } else if(document.body.getAttribute("data-theme") == "light") {
                        document.body.setAttribute("data-theme", "dark");

                        styles.forEach((element) => {
                            if (element.getAttribute("href").indexOf("/light/") > 0) {
                                element.setAttribute("href", element.getAttribute("href").replace("/light/", "/dark/"));
                            }
                        });

                    }
                    document.body.className = document.body.className.replace(" no-transition", "");
                    break;

                case "settings":
                    ipcRenderer.send("showOptions");
                    break;
                case "change-albumart":
                    var songPath = element.parentNode.parentNode.getAttribute("data-path");
                    ipcRenderer.send("changeAlbumart", songPath);
                    break;

                default:
                    swal({
                        title: "WIP, selected:",
                        text: element.getAttribute("data-target"),
                        html: true,
                        timer: 750
                    });
                }
        }, false);
    });

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

    function hideContextMenu() {
        document.getElementById("contextMenu").style.display = "none";
    }

    function showContextMenu(e) {
        e.preventDefault();

        var contextMenu = document.getElementById("contextMenu");
        var documentWidth = document.body.offsetWidth;
        var documentHeight = document.body.offsetHeight + 30;

        var posX = e.clientX;
        var posY = e.clientY;

        contextMenu.setAttribute("data-path", this.getAttribute("data-path"))
        contextMenu.style.display = "block";

        if (documentWidth > posX + contextMenu.offsetWidth) {
            contextMenu.style.left = posX + "px";
            contextMenu.style.right = null;
        } else {
            contextMenu.style.left = null;
            contextMenu.style.right = documentWidth - posX + "px";
        }

        if (documentHeight > posY + contextMenu.offsetHeight) {
            contextMenu.style.top = posY + "px";
            contextMenu.style.bottom = null;

        } else {
            contextMenu.style.top = null;
            contextMenu.style.bottom = documentHeight - posY + "px";

        }

    }

    function clickPercent(element, e) {
        return (e.pageX - element.getBoundingClientRect().left) / element.offsetWidth;
    }

    function movePlayHead(element, e) {
        var timelintWidth = parseInt(element.offsetWidth);
        var newLeftMargin = e.pageX - element.getBoundingClientRect().left;
    }

    window.addEventListener("variablesLoaded", () => {
        audioplayer.elements.timeline.timeline.addEventListener("click", () => {
            if (audioplayer.audio.object.src) {
                movePlayHead(audioplayer.elements.timeline.timeline, event);
                audioplayer.audio.object.currentTime = audioplayer.audio.object.duration * clickPercent(audioplayer.elements.timeline.timeline, event);
            }
        }, false);

        audioplayer.elements.buttons.play.addEventListener("click", () => {
            audioplayer.play();
        }, false);

        audioplayer.elements.buttons.pause.addEventListener("click", () => {
            audioplayer.pause();
        }, false);

        audioplayer.elements.buttons.stop.addEventListener("click", () => {
            audioplayer.stop();
        }, false);

        audioplayer.elements.buttons.previousSong.addEventListener("click", () => {
            audioplayer.previousSong();
        }, false);

        audioplayer.elements.buttons.nextSong.addEventListener("click", () => {
            audioplayer.nextSong();
        }, false);


        audioplayer.elements.buttons.repeat.forEach((element) => {
            element.addEventListener("click", function() {
                audioplayer.repeat(this);
            }, false);
        });

        audioplayer.elements.buttons.random.forEach((element) => {
            element.addEventListener("click", () => {
                audioplayer.random();
            }, false);
        });

        audioplayer.elements.buttons.volumeIndicator.forEach((element) => {
            element.addEventListener("contextmenu", () => {
                audioplayer.volumeMute();
            }, false);
        });

        var volumeRangeHiderTimer;
        audioplayer.elements.buttons.volumeIndicator.forEach((element) => {
            element.addEventListener("click", () => {
                clearInterval(volumeRangeHiderTimer);
                if (audioplayer.elements.buttons.volumeRange.style.display == "block") {
                    audioplayer.elements.buttons.volumeRange.style.display = "none";

                } else {
                    audioplayer.elements.buttons.volumeRange.style.display = "block";

                    volumeRangeHiderTimer = setTimeout(() => {
                        var element = document.querySelector("input:hover");

                        if (!element || element.getAttribute("name") != "volumeRange") {
                            clearInterval(volumeRangeHiderTimer);
                            audioplayer.elements.buttons.volumeRange.style.display = "none";
                        }
                    }, 2000);
                }
            }, false);
        });

        audioplayer.elements.buttons.volumeRange.addEventListener("mouseout", () => {
            audioplayer.elements.buttons.volumeRange.style.display = "none";
            clearInterval(volumeRangeHiderTimer);
        }, false);

        audioplayer.elements.buttons.volumeRange.addEventListener("input", () => {
            audioplayer.setVolume(audioplayer.elements.buttons.volumeRange.value);
        }, false);


        var hotKeys;
        ipcRenderer.on("keyPress", (event, action) => {

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
