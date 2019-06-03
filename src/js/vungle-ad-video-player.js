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
    endVideoAttributionListeners
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';

var videoTPATCheckpoints = [0, 25, 50, 75, 100];
var videoTPATCheckpointsReached = [];

var fullscreenVideoElem = document.getElementById('fullscreen-video');
var fullscreenVideoView = document.getElementById('fullscreen-video-view');
var fullscreenVideoViewProgress = document.getElementById('fullscreen-video-progress');
var videoSource, videoDurationCount, videoCurrentPlayTime, videoCheckpointIndex;
var videoViewedPerSecond = 0;

function initVideo(videoSrc) {
    videoSource = videoSrc;
    fullscreenVideoElem.src = videoSource;

    //Only start video once file is ready and source is set
    fullscreenVideoElem.addEventListener('loadedmetadata', function () {
        videoDurationCount = fullscreenVideoElem.duration;
        EventController.sendEvent('vungle-fullscreen-video-ready');

        //Start event listener on video play to capture attribution/TPAT events
        fullscreenVideoElem.addEventListener('timeupdate', onVideoPlay);
        videoLengthReport();
        playVideo();
    });
}

function playVideo() {
    fullscreenVideoElem.play();
}

function pauseVideo() {
    fullscreenVideoElem.pause();
}

function hideVideoView() {
    AdHelper.addClass(fullscreenVideoView, 'hide');
}

function videoDuration() {
    return videoDurationCount;
}

function onVideoPlay() {
    videoCurrentPlayTime = fullscreenVideoElem.currentTime;
    var percent = Math.floor((100 / fullscreenVideoElem.duration) * videoCurrentPlayTime);
    fullscreenVideoViewProgress.value = percent;
    fullscreenVideoViewProgress.getElementsByTagName('span')[0].innerHTML = percent;

    onVideoTPATCheckpoint();
}

function endVideoAttributionListeners() {

    //Trigger videoViewed one final time after checkpoint.100 to ensure last event captures entire video duration
    if (videoTPATCheckpointsReached[videoTPATCheckpoints.length - 1] === true) {
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

    //Event value sent to the SDK each second
    if (videoCurrentPlayTime > 0 && videoDurationCount && typeof videoDurationCount === "number" && videoViewedPerSecond <= Math.round(videoCurrentPlayTime)) {
        window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", Math.floor(videoCurrentPlayTime * 1000));
        videoViewedPerSecond++;
    }
}

function videoLengthReport() {
    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoLength", Math.floor(videoDurationCount * 1000));
}