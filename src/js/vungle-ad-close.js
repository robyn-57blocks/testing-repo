export default {
    initCloseButtonTimer,
    showVideoCloseButtonTimer,
    hideVideoCloseButtonTimer,
    // initEndcardCloseButtonTimer,
    showEndcardCloseButtonTimer,
    hideEndcardCloseButtonTimer,
    endEndcardCloseButtonTimer,
    endEndcardCloseButtonRewardTimer,
    endVideoCloseButtonTimer,
    endVideoCloseButtonRewardTimer
}

import { default as AdHelper } from './vungle-ad-helpers.js';

// var videoClose = document.getElementById('vungle-fullscreen-video-close-icon-container');

// var endcardClose = document.getElementById('vungle-endcard-close');
var videoCloseIconContainer = document.getElementById('vungle-fullscreen-video-close-icon-container');
var endcardCloseIconContainer = document.getElementById('vungle-endcard-close-icon-container');
var videoTimerCountdown = document.getElementById('vungle-video-timer-countdown');
var endcardTimerCountdown = document.getElementById('vungle-endcard-timer-countdown');
var endcardInterval, endcardCountdown, countdown, interval;


function initCloseButtonTimer(settings) {

    AdHelper.removeClass(settings.closeBtn, 'hide');

    if (settings.time !== 0) {
        AdHelper.addClass(settings.closeBtn, 'show')
        var countdown = parseInt(settings.time);

        if (settings.rewarded)
            AdHelper.addClass(settings.closeBtn, 'rewarded')

        settings.timer.textContent = countdown;

        interval = setInterval(function() {
            countdown = --countdown <= 0 ? '' : countdown;
            settings.timer.textContent = countdown;
        }, 1000);

        setTimeout(function() {
            clearInterval(interval);
        }, countdown * 1000)
    }
}

// function initEndcardCloseButtonTimer(settings) {
//
//     AdHelper.removeClass(endcardCloseIconContainer, 'hide');
//
//     if (settings.time !== 0) {
//         AdHelper.addClass(endcardCloseIconContainer, 'show')
//         var endcardCountdown = parseInt(settings.time);
//
//         if (settings.rewarded)
//             AdHelper.addClass(endcardCloseIconContainer, 'rewarded')
//
//         endcardTimerCountdown.textContent = endcardCountdown;
//
//         endcardInterval = setInterval(function() {
//             endcardCountdown = --endcardCountdown <= 0 ? '' : endcardCountdown;
//             endcardTimerCountdown.textContent = endcardCountdown;
//         }, 1000);
//
//         setTimeout(function() {
//             clearInterval(endcardInterval);
//         }, endcardCountdown * 1000)
//     }
// }

function showVideoCloseButtonTimer() {
    AdHelper.removeClass(videoCloseIconContainer, 'hide');
}

function showEndcardCloseButtonTimer() {
    AdHelper.removeClass(endcardCloseIconContainer, 'hide');
}

function hideVideoCloseButtonTimer() {
    AdHelper.addClass(videoCloseIconContainer, 'hide');
}

function hideEndcardCloseButtonTimer() {
    AdHelper.addClass(endcardCloseIconContainer, 'hide');
}

function endVideoCloseButtonTimer(rewarded, rewardedAdDuration, showCloseOnStart) {
    AdHelper.removeClass(videoCloseIconContainer, 'hide');
    AdHelper.addClass(videoCloseIconContainer, 'end');
}

function endEndcardCloseButtonTimer(rewarded, rewardedAdDuration, showCloseOnStart) {
    AdHelper.removeClass(endcardCloseIconContainer, 'hide');
    AdHelper.addClass(endcardCloseIconContainer, 'end');
}

function endVideoCloseButtonRewardTimer() {
    videoTimerCountdown.textContent = '';
}

function endEndcardCloseButtonRewardTimer() {
    endcardTimerCountdown.textContent = '';
}
