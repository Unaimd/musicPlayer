var audioplayer;

document.addEventListener("DOMContentLoaded", function() {
    initPlayer();
});

function initPlayer() {
    audioplayer = {
        elements: {
            player: document.getElementById("audioplayer"),
            //title: audioplayer.elements.player.getElementsByClassName("title")
        },

        //musicTitle: audioplayer.container,

        play: function(song) {
            alert(song);
        }
    };

    audioplayer.title = audioplayer.elements.player.getElementsByClassName("title");

    console.log("Audioplayer v.2 loaded");
}
