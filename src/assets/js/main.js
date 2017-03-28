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

        } else if (typeof ajaxUrl === "string" && ajaxUrl !== null) {
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
