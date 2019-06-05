/* ----- Vungle Design Framework - Video Player ----- */

export default {
    initVideo,
    playVideo,
    pauseVideo,
    hideVideoView,
    videoDuration
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';

var fullscreenVideoElem = document.getElementById('fullscreen-video');
var fullscreenVideoView = document.getElementById('fullscreen-video-view');
var fullscreenVideoViewProgress = document.getElementById('fullscreen-video-progress');
var videoSource, videoDurationCount;

function initVideo(videoSrc) {
    videoSource = videoSrc;
    fullscreenVideoElem.src = videoSource;

    fullscreenVideoElem.addEventListener('loadedmetadata', function () {
        videoDurationCount = fullscreenVideoElem.duration;
        EventController.sendEvent('vungle-fullscreen-video-ready');
        playVideo();
    });

    fullscreenVideoElem.addEventListener('timeupdate', function(e) {
        EventController.sendEvent('vungle-video-time-update', fullscreenVideoElem.currentTime);
        var percent = Math.floor((100 / fullscreenVideoElem.duration) * fullscreenVideoElem.currentTime);
        fullscreenVideoViewProgress.value = percent;
        fullscreenVideoViewProgress.getElementsByTagName('span')[0].innerHTML = percent;
    }, false);
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
    console.log('videoDuration is: '+videoDurationCount);
    return videoDurationCount;
}