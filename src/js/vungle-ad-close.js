export default {
    initVideoCloseButtonTimer,
    showVideoCloseButtonTimer,
    hideVideoCloseButtonTimer,
    initEndcardCloseButtonTimer,
    showEndcardCloseButtonTimer,
    hideEndcardCloseButtonTimer,
    endEndcardCloseButtonTimer,
    endEndcardCloseButtonRewardTimer
}

import { default as AdHelper } from './vungle-ad-helpers.js';

var videoClose = document.getElementById('vungle-fullscreen-video-close-icon-container');

// var endcardClose = document.getElementById('vungle-endcard-close');
var endcardCloseIconContainer = document.getElementById('vungle-endcard-close-icon-container');
var endcardTimerCountdown = document.getElementById('vungle-endcard-timer-countdown');
var endcardInterval, endcardCountdown;


function initVideoCloseButtonTimer(delayDuration) {
    AdHelper.removeClass(videoClose, 'hide');
}

function showVideoCloseButtonTimer() {
    AdHelper.removeClass(videoClose, 'hide');
}

function hideVideoCloseButtonTimer() {
    AdHelper.addClass(videoClose, 'hide');
}

function initEndcardCloseButtonTimer(settings) {

    AdHelper.removeClass(endcardCloseIconContainer, 'hide');

    if (settings.time !== 0) {
        AdHelper.addClass(endcardCloseIconContainer, 'show')
        var endcardCountdown = parseInt(settings.time);

        if (settings.rewarded)
            AdHelper.addClass(endcardCloseIconContainer, 'rewarded')

        endcardTimerCountdown.textContent = endcardCountdown;

        endcardInterval = setInterval(function() {
            endcardCountdown = --endcardCountdown <= 0 ? '' : endcardCountdown;
            endcardTimerCountdown.textContent = endcardCountdown;
        }, 1000);

        setTimeout(function() {
            clearInterval(endcardInterval);
        }, endcardCountdown * 1000)
    }
}

function showEndcardCloseButtonTimer() {
    AdHelper.removeClass(endcardCloseIconContainer, 'hide');
}

function hideEndcardCloseButtonTimer() {
    AdHelper.addClass(endcardCloseIconContainer, 'hide');
}

function endEndcardCloseButtonTimer(rewarded, rewardedAdDuration, showCloseOnStart) {
    AdHelper.removeClass(endcardCloseIconContainer, 'hide');
    AdHelper.addClass(endcardCloseIconContainer, 'end');
}

function endEndcardCloseButtonRewardTimer() {
    endcardTimerCountdown.textContent = '';
}
