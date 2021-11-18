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
    toggleVideoMute,
    isVideoPlayerVisible
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';
import { default as PostMessenger } from './vungle-ad-post-messenger.js';
import { default as SDKHelper } from './vungle-ad-sdk-helper.js';
import {
    isAutoOpenStoreKitOverlayOnVideoEnabled,
    openStoreKitOverlayInFiveSeconds
} from "./vungle-ad-video-skoverlay.js"
import { fireTpat, tpats } from './events.js'

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

function initVideo(videoSrc, isMuted, isVideoProgressBarVisible) {

    AdHelper.removeClass(fullscreenVideoView, 'hide');
    AdHelper.removeClass(videoCta, 'show');

    //Toggle visibility of video progress bar, if false then hide progress bar
    if (isVideoProgressBarVisible === 'false') AdHelper.addClass(fullscreenVideoViewProgress, 'hide');

    videoSource = videoSrc;
    fullscreenVideoElem.src = videoSource;

    //Only start video once file is ready and source is set
    fullscreenVideoElem.addEventListener('loadedmetadata', function() {
        videoDurationCount = fullscreenVideoElem.duration;
        AdHelper.setVideoDuration(videoDurationCount);
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
        fullscreenVideoElem.addEventListener('seeking', onVideoSeeking);
        videoMuteButton.addEventListener('click', toggleVideoMute);
    videoMuteButton.addEventListener('click', logMuteElementClick);
        window.addEventListener('vungle-pause', pauseVideo);
        window.addEventListener('vungle-resume', playVideo);

        videoLengthReport();
        playVideo();
        if(isAutoOpenStoreKitOverlayOnVideoEnabled()) {
            openStoreKitOverlayInFiveSeconds()
        }
    });
}

function playVideo() {
    if (AdHelper.checkPauseResumeOverlays()) {
        if (isVideoPlayerVisible()) {
            fullscreenVideoElem.play();
        }
    }
}

function isVideoPlayerVisible() {
    return !AdHelper.hasClass(fullscreenVideoView, 'hide');
}

function pauseVideo() {
    fullscreenVideoElem.pause();
}

function hideVideoView() {
    pauseVideo();

    videoMuteButton.removeEventListener('click', toggleVideoMute);
    videoMuteButton.removeEventListener('click', logMuteElementClick);

    AdHelper.addClass(fullscreenVideoView, 'hide');
    AdHelper.addClass(videoMuteButton, 'hide');
    AdHelper.addClass(videoCta, 'hide');
}

function logMuteElementClick() {
    fireTpat(tpats.muteClick);
}

function toggleVideoMute() {
    if (fullscreenVideoElem.muted) {
        //Send report_ad event values
        if (AdHelper.deviceOS() === "windows") {
            SDKHelper.mraidBridgeExt().notifyUserInteraction("event", "unmute");
        } else {
            SDKHelper.mraidBridgeExt().notifyEventValuePairEvent("unmute", 1);
        }

        //Send TPAT events
        SDKHelper.mraidBridgeExt().notifyTPAT("video.unmute");
        unMuteVideo();
    } else {
        //Send report_ad event values
        if (AdHelper.deviceOS() === "windows") {
            SDKHelper.mraidBridgeExt().notifyUserInteraction("event", "mute");
        } else {
            SDKHelper.mraidBridgeExt().notifyEventValuePairEvent("mute", 1);
        }

        //Send TPAT events
        SDKHelper.mraidBridgeExt().notifyTPAT("video.mute");
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
        window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", Math.floor(videoCurrentPlayTime * 1000));
        videoViewedPerSecond++;
    }
}

function videoLengthReport() {
    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoLength", Math.floor(videoDurationCount * 1000));
}

function onVideoSeeking() {
    var currentTime = fullscreenVideoElem.currentTime;
    var delta = currentTime - videoCurrentPlayTime;

    if (Math.abs(delta) > 0.01) {
        fullscreenVideoElem.pause();
        fullscreenVideoElem.currentTime = videoCurrentPlayTime;
    }
}

