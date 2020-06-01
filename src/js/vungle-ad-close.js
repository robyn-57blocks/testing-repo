export default {
    initCloseButtonTimer,
    showCloseButtonTimer,
    hideCloseButtonTimer,
    endEndcardCloseButtonRewardTimer,
    endCloseButtonTimer
}

import { default as AdHelper } from './vungle-ad-helpers.js';

var endcardTimerCountdown = document.getElementById('vungle-endcard-timer-countdown');
var countdown, interval;

function initCloseButtonTimer(settings) {

    AdHelper.removeClass(settings.closeBtn, 'hide');
    
    if (settings.time !== 0) {
        AdHelper.addClass(settings.closeBtn, 'show');
        var countdown = parseInt(settings.time);

        if (settings.rewarded) {
            AdHelper.addClass(settings.closeBtn, 'rewarded');
        }

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

function showCloseButtonTimer(closeBtnContainer) {
    AdHelper.removeClass(closeBtnContainer, 'hide');
}

function hideCloseButtonTimer(closeBtnContainer) {
    AdHelper.removeClass(closeBtnContainer, 'show');
    AdHelper.addClass(closeBtnContainer, 'hide');
}

function endCloseButtonTimer(closeBtnContainer, forcedOrExceeded = false) {
    AdHelper.removeClass(closeBtnContainer, 'hide');
    //if forcedOrExceeded flag is not true
    if (!forcedOrExceeded){
        setTimeout(function() {
            AdHelper.addClass(closeBtnContainer, 'end');
        }, 10)
    }
}

function endEndcardCloseButtonRewardTimer() {
    endcardTimerCountdown.textContent = '';
}
