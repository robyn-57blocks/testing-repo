export default {
    initTimer,
    endRewardTimer,
    endCloseTimer,
}

import { default as AdHelper } from './vungle-ad-helpers.js';

var countdownContainer = document.getElementById('vungle-ad-close-icon-container');
var countdownNumberEl = document.getElementById('vungle-ad-timer-countdown');
var rewardTimer = document.getElementById('vungle-ad-reward-timer');
var interval, countdown

function endCloseTimer(rewarded, rewardedAdDuration, showCloseOnStart) {
    AdHelper.addClass(countdownContainer, 'end')
}

function initTimer(settings) {
    
    if (settings.time !== 0) {
        AdHelper.addClass(countdownContainer, 'show')
        var countdown = parseInt(settings.time);

        if (settings.rewarded)
            AdHelper.addClass(countdownContainer, 'rewarded')

        countdownNumberEl.textContent = countdown;

        interval = setInterval(function() {
            countdown = --countdown <= 0 ? '' : countdown;
            countdownNumberEl.textContent = countdown;
        }, 1000);

        setTimeout(function() {
            clearInterval(interval);
        }, countdown * 1000)
    }



}

function endRewardTimer() {
    countdownNumberEl.textContent = '';
}