$moreSongs = true;
var response = true;
var accesible = false;
const url = "/public/controllers/music/listSongs.php";
function isAccesible() {
    ajaxUrl = localStorage.getItem("ajaxUrl");

    while(!accesible && response) {
        response = false;

        // request server
        if (ajaxUrl === null) {
            $.ajax({
                url: "http://alexbcberio.ddns.net" + url,
                complete: function(xhr, data) {

                    if (xhr.responseText.indexOf("Welcome to your Vodafone Router") > 0) {
                        localStorage.setItem("ajaxUrl", "alexbcberio.local");

                    } else if (data == "success") {
                        localStorage.setItem("ajaxUrl", "alexbcberio.ddns.net");
                    }
                    ajaxUrl = localStorage.getItem("ajaxUrl");

                    accesible = true;
                    response = true;
                }

            });

        } else if (typeof ajaxUrl === "string") {
            $.ajax({
                url: "http://" + ajaxUrl + url,
                complete: function(xhr, data) {

                    if (data == "success") {
                        if (ajaxUrl == "alexbcberio.ddns.net" && xhr.responseText.indexOf("Welcome to your Vodafone Router") > -1) {
                            localStorage.setItem("ajaxUrl", "alexbcberio.local");

                        } else {
                            ajaxUrl = localStorage.getItem("ajaxUrl");
                        }

                    } else if (data == "error") {
                        localStorage.removeItem("ajaxUrl");
                        ajaxUrl = localStorage.removeItem("ajaxUrl");
                    }

                    response = true;
                    accesible = true;
                }
            });

        }
    }

    return true;
}

function loadSongs($folder,$num,$order,$lastNum) {
    if (!$moreSongs) {
        return false;
    }

    // add a loader
    $loader = '<li id="loader"><div class="loader"></div></li>';
    $('#songs').find('li').last().after($loader);

    if (!isAccesible()) {
        return false;
    }

    if (typeof $order === 'undefined'){
        $order = $('#songs').attr('data-order');
    }
    if (typeof $lastNum === 'undefined') {
        $lastNum = $("[data-type='audio']").length;
    }

    $lastFile = '';
    if (typeof $('[data-type="audio"]').attr('data-type') !== 'undefined') {
        $lastFile = $('[data-type="audio"]').last().attr('data-path').split('/');
        $lastFile = $('[data-type="audio"]').last().attr('data-path').split('/')[$lastFile.length - 1];
    }

    if ($moreSongs == true) {

        $ajax = new XMLHttpRequest;
        $ajax.onreadystatechange = function (){
            if ($ajax.readyState == 4 && $ajax.status == 200) {
                // if no more songs
                if ($ajax.responseText == ''){
                    $moreSongs = false;
                } else {
                    $('#songs').find('li').last().after($ajax.responseText);
                    $newAudio = $('[data-type="audio"]');
                    $moreSongs = true;
                    updateSongs();
                }
                $("#loader").remove();
            }
        };

        $ajax.open('POST','http://' + ajaxUrl + url, true);
        $ajax.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        $ajax.send('listDir='+$folder+'&numFiles='+$num+'&lastFile='+$lastFile+'&lastNum='+$lastNum+'&order='+$order+"&addIp");

    }
    $moreSongs = false;
}

$('#songs').scroll(function(){
    $lastSong = $('[data-type="audio"]').last();

    if ($(window).scrollTop() + $(window).height() > $lastSong.offset().top - 400) {
        loadSongs("/", 30);
    }

});

// change current time by clicking on the timeline
$(".range").click(function (event){
    moveplayhead(event);
    audioplayer.audio.object.currentTime = audioplayer.audio.object.duration * clickPercent(event);
});

// return percentage of the song on clicked position
function clickPercent(e){
    return (e.pageX - $('.range').offset().left) / $timelineWidth;
}

// moves the input from the timeline
function moveplayhead(e){
    $timelineWidth = parseInt($(".range").css('width'));
    $newMargLeft = e.pageX - $('.range').offset().left;

    if ($newMargLeft >= 0 && $newMargLeft <= $timelineWidth){
        $(".range").find(".input").css('left',$newMargLeft + "px");
    }
    if ($newMargLeft < 0){
        $(".range").find(".input").css('left',"0px");
    }
    if ($newMargLeft > $timelineWidth){
        $(".range").find(".input").css('left',$timelineWidth + "px");
    }
}
