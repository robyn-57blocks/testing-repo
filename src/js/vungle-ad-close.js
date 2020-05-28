export default {
    initCloseButtonTimer,
    showVideoCloseButtonTimer,
    hideVideoCloseButtonTimer,
    showEndcardCloseButtonTimer,
    hideEndcardCloseButtonTimer,
    endEndcardCloseButtonTimer,
    endEndcardCloseButtonRewardTimer,
    endVideoCloseButtonTimer
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

function endVideoCloseButtonTimer() {
    AdHelper.removeClass(videoCloseIconContainer, 'hide');
    AdHelper.addClass(videoCloseIconContainer, 'end');
}

function endEndcardCloseButtonTimer() {
    AdHelper.removeClass(endcardCloseIconContainer, 'hide');
    AdHelper.addClass(endcardCloseIconContainer, 'end');
}

function endEndcardCloseButtonRewardTimer() {
    endcardTimerCountdown.textContent = '';
}
