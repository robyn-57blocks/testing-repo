export default {
    init
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';
import { default as AdVideoPlayer } from './vungle-ad-video-player.js';

var privacyTimer, privacySubTimer;

var prefix = ''; // stop clashes
var privacyUrl = 'https://privacy.vungle.com/';
var privacyDuration = 2000;
var privacySubDuration = 1000;
var privacySubHideDuration = 500;
var privacyIcon = document.getElementById(prefix + 'privacy-icon');
var privacyWrapper = document.getElementById('privacy-page-wrapper');

function init() {
    // add click events
    document.getElementById(prefix + 'privacy-icon').addEventListener("click", privacyExtend);
    document.getElementById(prefix + 'privacy-back-button-container').addEventListener("click", hideIframe);
}

function hideIframe() {
    var loadingPage = document.getElementById(prefix + 'privacy-page-loading');

    AdHelper.removeClass(privacyWrapper, 'active');
    if (AdVideoPlayer.isVideoViewVisible) { EventController.sendEvent('vungle-fullscreen-video-play') };

    AdHelper.removeClass(loadingPage, 'loaded');

    document.getElementById(prefix + 'privacy-page-wrapper').style.display = "none";

    document.getElementById(prefix + 'privacy-back-button-container').style.display = "none";
}

function showIFrame() {
    var loadingPage = document.getElementById(prefix + 'privacy-page-loading');
    var privacyPg = document.getElementById(prefix + 'privacy-page');

    if (AdVideoPlayer.isVideoViewVisible) { EventController.sendEvent('vungle-fullscreen-video-pause') };

    document.getElementById(prefix + 'privacy-page-wrapper').style.display = "initial";
    document.getElementById(prefix + 'privacy-back-button-container').style.display = "initial";

    AdHelper.removeClass(loadingPage, 'loaded');
    AdHelper.addClass(loadingPage, 'loading');
    AdHelper.addClass(privacyWrapper, 'active');

    privacyPg.onload = function() {
        AdHelper.removeClass(loadingPage, 'loading');
        AdHelper.addClass(loadingPage, 'loaded');
    };

    privacyPg.src = privacyUrl;
}

function hidePrivacyIcon() {
    AdHelper.removeClass(privacyIcon, 'open');

    privacySubTimer = setTimeout(function() {
        AdHelper.removeClass(privacyIcon, 'reverse');
    }, privacySubHideDuration);
}

function privacyExtend() {

    if (AdHelper.hasClass(privacyIcon, 'open')) {
        showIFrame();
        hidePrivacyIcon();
        return;
    }

    AdHelper.addClass(privacyIcon, 'open');

    clearTimeout(privacyTimer);

    privacyTimer = setTimeout(function() {
        hidePrivacyIcon();
    }, privacyDuration);

    privacySubTimer = setTimeout(function() {
        AdHelper.addClass(privacyIcon, 'reverse');
    }, privacySubDuration);
}
