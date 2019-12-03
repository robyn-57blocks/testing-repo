/* ----- Vungle Design Framework - Video Player ----- */

export default {
    initVideo,
    playVideo,
    pauseVideo,
    hideVideoView,
    videoDuration,
    onVideoPlay,
    videoTPATCheckpointsIndex,
    onVideoTPATCheckpoint,
    videoLengthReport,
    endVideoAttributionListeners,
    muteVideo,
    unMuteVideo,
    toggleVideoMute
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';
import { default as PostMessenger } from './vungle-ad-post-messenger.js';

var videoTPATCheckpoints = [0, 25, 50, 75, 100];
var videoTPATCheckpointsReached = [];

var fullscreenVideoElem = document.getElementById('fullscreen-video');
var fullscreenVideoView = document.getElementById('fullscreen-video-view');
var fullscreenVideoViewProgress = document.getElementById('fullscreen-video-progress');
var videoMuteButton = document.getElementById('video-mute');
var soundSwitcher = document.getElementById('mute-unmute-switch');
var videoCta = document.getElementById('video-cta');
var videoSource, videoDurationCount, videoCurrentPlayTime, videoCheckpointIndex, videoPlaySuccessfulDuration;
var videoViewedPerSecond = 0;


var overlays = document.querySelectorAll('[overlay]');


function initVideo(videoSrc, isMuted) {

    AdHelper.removeClass(fullscreenVideoView, 'hide');
    AdHelper.removeClass(videoCta, 'show');

    videoSource = videoSrc;
    fullscreenVideoElem.src = videoSource;

    //Only start video once file is ready and source is set
    fullscreenVideoElem.addEventListener('loadedmetadata', function() {
        videoDurationCount = fullscreenVideoElem.duration;
        videoPlaySuccessfulDuration = (80 / 100) * fullscreenVideoElem.duration;

        //If video is set to not be muted, unmute video
        if (isMuted === 'false') {
            unMuteVideo();
        } else {
            muteVideo();
        }

        //Send event to ad core to begin close button timer for video
        EventController.sendEvent('vungle-fullscreen-video-ready');

        //Start event listeners for video start and TPAT attribution
        fullscreenVideoElem.addEventListener('timeupdate', onVideoPlay);
        fullscreenVideoElem.addEventListener('vungle-fullscreen-video-ready', pauseVideo);
        videoMuteButton.addEventListener('click', toggleVideoMute);
        window.addEventListener('vungle-fullscreen-video-pause', pauseVideo);
        window.addEventListener('vungle-fullscreen-video-play', playVideo);

        videoLengthReport();
        playVideo();
    });
}

function checkPauseResumeOverlays() {
    for (var i = 0; i < overlays.length; i++) {
        if (AdHelper.hasClass(overlays[i], 'show')) return false
        if (AdHelper.hasClass(overlays[i], 'active')) return false
    }
    return true
}

function playVideo() {
    if (checkPauseResumeOverlays())
        fullscreenVideoElem.play();
    PostMessenger.sendMessage('ad-event-resume');
}

function pauseVideo() {
    fullscreenVideoElem.pause();
    PostMessenger.sendMessage('ad-event-pause');
}

function hideVideoView() {
    pauseVideo();
    //Remove event listeners for video pause and play if video view is no longer visible to the user
    //This also allows the privacy iframe to be toggled without accidentally calling the video play/pause
    // window.removeEventListener('vungle-fullscreen-video-pause', pauseVideo);
    // window.removeEventListener('vungle-fullscreen-video-play', playVideo);

    videoMuteButton.removeEventListener('click', toggleVideoMute);

    AdHelper.addClass(fullscreenVideoView, 'hide');
    AdHelper.addClass(videoMuteButton, 'hide');
    AdHelper.addClass(videoCta, 'hide');
}

function toggleVideoMute() {
    console.log("video is " + fullscreenVideoElem.muted);
    if (fullscreenVideoElem.muted) {
        //Trigger TPAT event for unmuting video audio
        window.vungle.mraidBridgeExt.notifyTPAT("video.unmute");
        unMuteVideo();
    } else {
        //Trigger TPAT event for muting video audio
        window.vungle.mraidBridgeExt.notifyTPAT("video.mute");
        muteVideo();
    }
}

function muteVideo() {
    fullscreenVideoElem.muted = true;
    soundSwitcher.checked = false;
}

function unMuteVideo() {
    fullscreenVideoElem.muted = false;
    soundSwitcher.checked = true;
}


function videoDuration() {
    return videoDurationCount;
}

function onVideoPlay() {
    EventController.sendEvent('vungle-video-time-update', fullscreenVideoElem.currentTime);
    videoCurrentPlayTime = fullscreenVideoElem.currentTime;
    var percent = Math.floor((100 / fullscreenVideoElem.duration) * videoCurrentPlayTime);
    var progressVal = fullscreenVideoViewProgress.getElementsByClassName('progress-value')[0];
    fullscreenVideoViewProgress.setAttribute('aria-valuenow', percent);
    progressVal.style.width = percent + '%';
    progressVal.innerHTML = percent + '%';

    //Send an event to the ad core to trigger successfulView once video has been viewed >80%
    if (videoCurrentPlayTime >= videoPlaySuccessfulDuration) {
        EventController.sendEvent('vungle-fullscreen-video-successful-view');
    }

    onVideoTPATCheckpoint();
}

function endVideoAttributionListeners() {

    //Trigger videoViewed one final time after checkpoint.100 to ensure last event captures entire video duration
    if (videoTPATCheckpointsReached[videoTPATCheckpoints.length - 1] === true) {
        console.log('%cvideoViewed ' + Math.floor(videoDurationCount * 1000), "color: #BADA55");
        window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", Math.floor(videoDurationCount * 1000));
    }

    fullscreenVideoElem.removeEventListener('timeupdate', onVideoPlay);
}

function videoTPATCheckpointsIndex(videoCurrentPlayTime, videoDurationCount) {
    var percentageVideoPlayed = ((videoDurationCount - videoCurrentPlayTime) <= 0.5 ? 1 : (Math.floor(videoCurrentPlayTime / videoDurationCount * 4) / 4).toFixed(2)) * 100;

    if (percentageVideoPlayed === 0) {
        return 0;
    } else if (percentageVideoPlayed === 25) {
        return 1;
    } else if (percentageVideoPlayed === 50) {
        return 2;
    } else if (percentageVideoPlayed === 75) {
        return 3;
    } else if (percentageVideoPlayed === 100) {
        return 4;
    }
}


function onVideoTPATCheckpoint() {
    videoCheckpointIndex = videoTPATCheckpointsIndex(videoCurrentPlayTime, videoDurationCount);

    //TPAT video attribution checkpoint - sent each quarter of the video duration that is viewed by the user
    for (var index = 0; index <= videoCheckpointIndex; index++) {
        if (typeof videoTPATCheckpointsReached[index] === "undefined" && videoCurrentPlayTime > 0 && videoDurationCount && typeof videoDurationCount === "number") {
            videoTPATCheckpointsReached[index] = true;
            window.vungle.mraidBridgeExt.notifyTPAT("checkpoint." + videoTPATCheckpoints[index]);
        }
    }

    //Event value sent to the SDK each second during video play
    if (videoCurrentPlayTime > 0 && videoDurationCount && typeof videoDurationCount === "number" && videoViewedPerSecond <= Math.round(videoCurrentPlayTime)) {
        console.log('%cvideoViewed ' + Math.floor(videoCurrentPlayTime * 1000), "color: #BADA55");
        window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", Math.floor(videoCurrentPlayTime * 1000));
        videoViewedPerSecond++;
    }
}

function videoLengthReport() {
    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoLength", Math.floor(videoDurationCount * 1000));
}