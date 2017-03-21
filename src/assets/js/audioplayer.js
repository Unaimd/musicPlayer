$(document).ready(function() {


    /************************************
    |
    |    Variable declaration
    |
    ************************************/

    /**
     * Document variables
     **/

    // tab title
    $documentTitle = document.title;
    // tab icon
    $documentIcon = $('link[rel="shortcut icon"]');
    // default tab icon
    $defaultDocumentIcon = $documentIcon.attr('href');

    /**
     * Audio player HTML elements
     **/

    // player element
    $player = $('#audioplayer');

    // audio file path
    $musicFile     = $player.find('.title').attr('data-path');
    // audio title
    $musicTitle    = $player.find('.title');
    // audio artist
    $musicArtist   = $player.find('.artist').children('.content');
    // audio album
    $musicAlbum    = $player.find('.album').children('.content');
    // audio duration
    $musicDuration = $player.find('.duration').children('.content');
    // audio bitrate
    $musicBitrate  = $player.find('.bitrate').children('.content');
    // audio album cover
    $musicCover    = $player.find('img');

    /**
     * Buttons of the player
     **/

    // audio files
    $newAudio = $('[data-type="audio"]');

    // time buttons remain with active effect in ms
    $activeTime = 150;

    // play button
    $play = $player.find('[name="play"]');
    // pause button
    $pause = $player.find('[name="pause"]');

    // stop button
    $stop = $player.find('[name="stop"]');

    // previous song button
    $previousSong = $player.find('[name="before"]');
    // next song button
    $nextSong = $player.find('[name="after"]');

    // repeat mode
    $repeatMode = $player.find('[name="repeat"]');
    // no repeat button
    $repeatNone = $player.find('[name="repeat"][data-mode="none"]');
    // repeat all songs
    $repeatAll = $player.find('[name="repeat"][data-mode="all"]');
    // repeat only one song
    $repeatOne = $player.find('[name="repeat"][data-mode="one"]');

    // volume hight
    $volumeUp = $player.find('[name="volume"][data-mode="up"]');
    // voume low
    $volumeDown = $player.find('[name="volume"][data-mode="down"]');
    // volume muted
    $volumeMute = $player.find('[name="volume"][data-mode="mute"]')
    // volume indicator
    $volumeIndicator = $player.find('[name="volume"]');

    // timeline
    $timeline = $player.find('.range');
    // timeline input (show actual time)
    $timelineInput = $timeline.children('.input');
    // played time
    $currentTime = $player.find('.timeline').children('.begin');
    // audio length
    $totalTime = $player.find('.timeline').children('.end');

    /**
     * Audio object & properties
     **/

    // audio object
    $audio = new Audio($musicFile);
    // current audio played time
    $audioCurrentTime = $audio.currentTime;
    // audio volume
    $audioVolume = 1;
    // repeat mode none|all|one
    $audioRepeat = 'none';
    // audio is muted or no
    $audioMuted = false;
    // where show volume up icon
    $volumeUpValue = 0.5;

    // allowed to load more songs via AJAX
    $moreSongs = true;
    // folder from to take the audio
    $audioFolder = '/';
    // every how many elements before have to load more
    $loadAfter = 30;
    // how much time should notification be displayed
    $swalTimer = 1500;
    // scroll animation duration
    $scrollAnimationDuration = 500;
    // scroll to active song
    $scrollEnabled = true;

    /**
     * Initialize
     **/

    // the initialization is done on the document itself

    /**
     * Get & set values to store some information on local storage
     **/

    // localStorage audio volume
    $lsAudioVolume = localStorage.audioVolume;
    if (typeof $lsAudioVolume == 'undefined'){
        localStorage.audioVolume = $audioVolume*100;
    } else {
        $audioVolume = parseInt($lsAudioVolume)/100;
    }
    $volumeIndicator.attr('data-volume',Math.floor($audioVolume*100));

    // audio repeat mode all|one|none
    $lsAudioRepeat = localStorage.audioRepeat
    if (typeof $lsAudioRepeat == 'undefined'){
        localStorage.audioRepeat = $audioRepeat;
        $lsAudioRepeat = localStorage.audioRepeat;
    } else {
        $audioRepeat = localStorage.audioRepeat;

        // set the repeat mode
        $repeatMode.hide();
        if ($lsAudioRepeat == 'all'){
            $repeatAll.show();
        } else if ($lsAudioRepeat == 'one'){
            $repeatOne.show();
        } else if ($lsAudioRepeat == 'none'){
            $repeatNone.show();
        }
    }

});

var hotKeys;
require("electron").ipcRenderer.on("keyPress", (event, action) => {

    hotKeys(action);

});


    /************************************
    |
    |       Non updatable functions
    |
    ************************************/

    // put new song
    function newSong ($this){
        // stop previous song
        $stop.click();

        $('[data-type="audio"]').removeClass('active');
        $this.addClass('active');

        // get new song info
        $path = $this.attr('data-path');
        $title = $this.find('.title').text();
        $artist = $this.find('.artist').text();
        $album = $this.find('.album').text();
        $duration = $this.find('.duration').text();
        $bitrate = $this.attr('data-bitrate');
        $coverImage = $this.find('img').attr('src');

        // set new info
        $musicTitle.text($title);
        $musicArtist.text($artist);
        $musicAlbum.text($album);
        $musicDuration.text($duration);
        $totalTime.text($duration);
        $musicBitrate.children('.content').text($artist);
        $musicCover.attr('src', $coverImage);

        // test if browser supports audio format
        $extensionSplit = $path.split('.');
        $format = $extensionSplit[$extensionSplit.length - 1];

        if (!!$audio.canPlayType('audio/'+$format) === false){
            swal ('Formato no soportado','No es posible reproducir la canción, tu navegador no soporta el formato '+$format.toUpperCase(),'error');
        } else {
            // start the new object
            $audio = new Audio($path);
            $play.click();
        }


        update();
    }

    var ajaxUrl;
    const url = "/public/controllers/music/listSongs.php";

    // test access to server
    var response = true;
    var accesible = false;
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

    // ajax to load the songs
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
            $lastNum = $newAudio.length;
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
                        update();
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


function update() {

    /************************************
    |
    |    Events when clicking elements
    |
    ************************************/



    $play.unbind('click').click(function(){
        play();
    });

    $pause.unbind('click').click(function(){
        pause();
    });

    $stop.unbind('click').click(function(){
        stop();
    });

    $nextSong.unbind('click').click(function(){
        nextSong();
    });

    $previousSong.unbind('click').click(function(){
        previousSong();
    });

    $newAudio.unbind('click').click(function(){
        newSong($(this));
    });

    $repeatMode.unbind('click').click(function(){
        repeat($(this));
    });

    $volumeIndicator.unbind('click').click(function(){
        volumeMute();
    });



    /************************************
    |
    |            Hotkeys
    |
    ************************************/


    hotKeys = function (name){

        // playPause
        if (name == "playPause"){
            if ($audio.paused){
                play();
                $pause.addClass('active');
            } else {
                pause();
                $play.addClass('active');
            }

        // previousSong
        } else if (name == "previousSong") {
            previousSong();

        // nextSong
        } else if (name == "nextSong") {
            nextSong();

        // stop
        } else if (name == "stop") {
            stop();

        // volumeDown
        } else if (name == "volumeDown") {
           volumeDown();

        // volumeUp
        } else if (name == "volumeUp") {
            volumeUp();

        // toggleMute
        } else if (name == "toggleMute") {
            volumeMute();

        } else {
            swal("hotKeys", name);
        }

    };



    /************************************
    |
    |             Functions
    |
    ************************************/



    // give active effect to element and remove it after $activeTime
    function active($element){
        $element.addClass('active');
        setTimeout(function(){
            $element.removeClass('active');
        },$activeTime);
    }

    // play the audio
    function play(){
        $audio.volume = $audioVolume;
        $audio.muted = $audioMuted;
        $audio.play();
        $duration = $audio.duration;

        document.title = $musicTitle.text();

        if ($musicCover.attr('src').indexOf('default.jpg') > -1){
            $documentIcon.attr('href', $defaultDocumentIcon);
        } else {
            $documentIcon.attr('href', $musicCover.attr('src'));
        }
        scroll($("[data-type=audio].active"));

        $play.hide();
        $pause.show();

        active($pause);

    }

    // pause the audio
    function pause(){
        $audio.pause();

        document.title = $documentTitle;
        $pause.hide();
        $play.show();

        active($play);
    }

    // stop the audio
    function stop(){
        pause(false);
        $audio.currentTime = 0;

        $timelineInput.css('marginLeft','0px');

        active($stop);
    }

    // previous song
    function nextSong(){
        $active = parseInt($('#songs').find('.active').attr('data-num'));
        $totalSongs = $('#songs').find('[data-type="audio"]').length;

        $loadOn = $totalSongs - $loadAfter;

        // if there are more songs to play
        if ($active < $totalSongs){
            $next = $('#songs').find('[data-num="'+($active+1)+'"]');
            newSong($next);

            active($nextSong);

            // load more songs via ajax
            if ($active >= $loadOn && $moreSongs == true){
            loadSongs($audioFolder,10);
            }
        } else {
            swal({
                title:'Siguiente canción no disponible',
                text:'No hay mas canciones que reproducir',
                type:'info',
                showConfirmButton: false,
                timer: $swalTimer
            });
        }
    }

    // previous song
    function previousSong(){
        $active = parseInt($('#songs').find('.active').attr('data-num'));

        // if actual is first
        if ($active > 0){
            $previous = $('#songs').find('[data-num="'+($active-1)+'"]');
            newSong($previous);

            active($previousSong)
        } else {
            swal({
                title: '¡Canción anterior no disponible!',
                text: 'No hay ninguna cancion anterior a la actual',
                type: 'error',
                showConfirmButton: false,
                timer: $swalTimer
            });
        }

    }

    // channge what repeat mode is
    function repeat($this){
        $mode = $this.attr('data-mode');

        active($repeatMode);

        $this.hide();
        if ($mode == 'none'){
            $repeatAll.show();
            $audioRepeat = 'all';
        } else if ($mode == 'all'){
            $repeatOne.show();
            $audioRepeat = 'one';
        } else if ($mode == 'one'){
            $repeatNone.show();
            $audioRepeat = 'none';
        }
        localStorage.audioRepeat = $audioRepeat;
    }

    // volume up
    function volumeUp(){
        if ($audioVolume < 1) {
            // round volume to decimal
            $newVolume = Math.round(($audioVolume + 0.02)*100)/100;

            $audio.volume = $newVolume;
            $audioVolume = $audio.volume;

            active($volumeIndicator);

            // update the volume icon
            $volumeIndicator.attr('data-volume',Math.ceil($audioVolume*100));
            if ($audioVolume >= $volumeUpValue && $audioMuted == false){
                $volumeUp.show();
                $volumeDown.hide();
            } else if ($audioVolume < $volumeUpValue && $audioMuted == false){
                $volumeDown.show();
                $volumeUp.hide();
            }
            localStorage.audioVolume = $audioVolume*100;
        }
    }

    // volume down
    function volumeDown (){
        if ($audioVolume > 0){
            // round volume to decimal
            $newVolume = Math.round(($audioVolume - 0.02)*100)/100;

            $audio.volume = $newVolume;
            $audioVolume = $audio.volume;

            active($volumeIndicator);

            // update the volume icon
            $volumeIndicator.attr('data-volume',Math.ceil($audioVolume*100));
            if ($audioVolume >= $volumeUpValue && $audioMuted == false){
                $volumeUp.show();
                $volumeDown.hide();
            } else if ($audioVolume < $volumeUpValue && $audioMuted == false){
                $volumeDown.show();
                $volumeUp.hide();
            }
            localStorage.audioVolume = $audioVolume*100;
        }
    }

    // mute and unmute
    function volumeMute (){

        active($volumeIndicator);

        // mute
        if (!$audio.muted){
            $audio.muted = true;
            $audioMuted = true;

            // hide volume up or down
            $volumeUp.hide()
            $volumeDown.hide()
            $volumeMute.show();
        // unmute
        } else {
            $audio.muted = false;
            $audioMuted = false;

            $volumeMute.hide();
            // hide volume up or down
            if ($audioVolume > $volumeUpValue){
                $volumeUp.show()
            } else {
                $volumeDown.show()
            }
        }
    }

    // when ending current audio
    $audio.onended = function(){
        stop();

        if ($audioRepeat == 'none'){
            // do nothing
        } else if ($audioRepeat == 'all'){
            nextSong();
        } else if ($audioRepeat == 'one'){
            play();
        }
    };

    // update timeline
    $audio.addEventListener('timeupdate', timeUpdate, false);

    // change current time by clicking on the timeline
    $timeline.click(function (event){
        moveplayhead(event);
        $audio.currentTime = $audio.duration * clickPercent(event);
    });

    // update the position on the input on the timeline
    function timeUpdate(){
        $duration = $audio.duration;
        $percent = ($audioCurrentTime/$duration)*100;
        $timelineInput.css('left','calc('+$percent+'% - 5px)');

        $audioCurrentTime = $audio.currentTime;
        $intCurTime = Math.round($audioCurrentTime);

        $curMin = 0;
        $curSec = 0;

        // get minutes
        if ($intCurTime < 60){
            $curSec = $intCurTime;
        } else {
            $curMin = Math.floor($intCurTime/60);
            $curSec = $intCurTime - $curMin * 60;
        }

        if ($curSec < 10){
            $curSec = '0'+$curSec;
        }
        if ($curMin < 10){
            $curMin = '0'+$curMin;
        }

        $currentTime.text($curMin+':'+$curSec);
    }

    // return percentage of the song on clicked position
    function clickPercent(e){
        return (e.pageX - $('.range').offset().left) / $timelineWidth;
    }

    // moves the input from the timeline
    function moveplayhead(e){
        $timelineWidth = parseInt($timeline.css('width'));
        $newMargLeft = e.pageX - $('.range').offset().left;

        if ($newMargLeft >= 0 && $newMargLeft <= $timelineWidth){
            $timelineInput.css('left',$newMargLeft + "px");
        }
        if ($newMargLeft < 0){
            $timelineInput.css('left',"0px");
        }
        if ($newMargLeft > $timelineWidth){
            $timelineInput.css('left',$timelineWidth + "px");
        }
    }

    // scroll to next song
    $("#songs").mouseover(function() {
       $scrollEnabled = false;
    });

    $("#songs").mouseout(function() {
       $scrollEnabled = true;
    });

    function scroll($element) {
        if ($scrollEnabled) {
            var px = $("#songs").scrollTop() + $element.position().top - $element.height();

            $("#songs").animate({
                scrollTop: px
            }, $scrollAnimationDuration);
        }
    }

    // load more songs when scrolling
    $('#songs').scroll(function(){
        $lastSong = $('[data-type="audio"]').last();

        if ($(window).scrollTop() + $(window).height() > $lastSong.offset().top - 400){
            loadSongs($audioFolder,$loadAfter);
        }

    });
}
