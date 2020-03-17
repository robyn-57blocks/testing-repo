export default {
    init
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';
import { default as AdVideoPlayer } from './vungle-ad-video-player.js';

var privacyTimer, privacySubTimer;

var prefix = ''; // stop clashes
var privacyUrl = 'https://privacy.vungle.com';
var privacyBubbleImage;
var privacyDuration = 2000;
var privacySubDuration = 1000;
var privacySubHideDuration = 500;
var privacyIcon = document.getElementById(prefix + 'privacy-icon');
var privacyWrapper = document.getElementById('privacy-page-wrapper');

function init(privacyPageUrl, vunglePrivacyLogoImageSrc) {

    if (typeof privacyPageUrl !== 'undefined') {
        privacyUrl = privacyPageUrl;
    }

    if (typeof vunglePrivacyLogoImageSrc !== 'undefined' && vunglePrivacyLogoImageSrc !== "") {
        //generate image in privacy bubble
        privacyBubbleImage = document.createElement('img');
        privacyBubbleImage.src = vunglePrivacyLogoImageSrc;
        privacyBubbleImage.classList.add('logo-privacy');
        privacyBubbleImage.setAttribute("alt", "Vungle Privacy");
        privacyIcon.appendChild(privacyBubbleImage);
    }

    // add click events
    document.getElementById(prefix + 'privacy-icon').addEventListener("click", privacyExtend);
    document.getElementById(prefix + 'privacy-back-button-container').addEventListener("click", hideIframe);
}

function hideIframe() {
    var loadingPage = document.getElementById(prefix + 'privacy-page-loading');

    AdHelper.removeClass(privacyWrapper, 'active');
    EventController.sendEvent('vungle-resume');

    AdHelper.removeClass(loadingPage, 'loaded');

    document.getElementById(prefix + 'privacy-page-wrapper').style.display = "none";

    document.getElementById(prefix + 'privacy-back-button-container').style.display = "none";
}

function showIFrame() {
    var loadingPage = document.getElementById(prefix + 'privacy-page-loading');
    var privacyPg = document.getElementById(prefix + 'privacy-page');

    EventController.sendEvent('vungle-pause');

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
