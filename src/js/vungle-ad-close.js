export default {
    initTimer,
    endRewardTimer,
    endCloseTimer,
}

import { default as AdHelper } from './vungle-ad-helpers.js';

var countdownContainer = document.getElementById('vungle-ad-close-icon-container');
var countdownNumberEl = document.getElementById('vungle-ad-timer-countdown');
var rewardTimer = document.getElementById('vungle-ad-reward-timer');
var interval,countdown

function endCloseTimer(rewarded,rewardedAdDuration, showCloseOnStart) {
    AdHelper.addClass(countdownContainer, 'fill')
    if (rewarded && countdownNumberEl.textContent !== '' && (!showCloseOnStart || rewardedAdDuration > 0))
        AdHelper.addClass(countdownContainer, 'open')
}

function initTimer(settings) {
    var countdown = parseInt(settings.time);

    if (settings.rewarded)
        AdHelper.addClass(countdownContainer, 'rewarded')
    // AdHelper.addClass(document.body, 'windows')


    countdownNumberEl.textContent = countdown;

    interval = setInterval(function() {
        countdown = --countdown <= 0 ? '' : countdown;
        countdownNumberEl.textContent = countdown;
    }, 1000);


    setTimeout(function() {
        clearInterval(interval);
    }, countdown * 1000)
}

function endRewardTimer() {
    AdHelper.removeClass(countdownContainer, 'open')
    AdHelper.addClass(countdownContainer, 'pulse')
    countdownNumberEl.textContent = '';
}