export default {
    initTimer,
    endRewardTimer,
    endCloseTimer,
}

import { default as AdHelper } from './vungle-ad-helpers.js';

var countdownContainer = document.getElementById('vungle-ad-close-icon-container');
var countdownNumberEl = document.getElementById('vungle-ad-timer-countdown');
var rewardTimer = document.getElementById('vungle-ad-reward-timer');

function endCloseTimer(rewarded) {
    AdHelper.addClass(countdownContainer, 'fill')
    if (rewarded)
        AdHelper.addClass(rewardTimer, 'open')
}

function initTimer(settings) {
    var countdown = settings.time;

    if (settings.rewarded)
        AdHelper.addClass(rewardTimer, 'rewarded')


    countdownNumberEl.textContent = countdown;

    var interval = setInterval(function() {
        countdown = --countdown <= 0 ? '' : countdown;
        countdownNumberEl.textContent = countdown;
    }, 1000);
    setTimeout(function() {
        clearInterval(interval);
    }, time * 1000)
}

function endRewardTimer() {
    AdHelper.removeClass(rewardTimer, 'open')
    AdHelper.addClass(countdownContainer, 'pulse')
}