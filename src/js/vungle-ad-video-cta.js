export default {
    initCTA,
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';

var fullscreenVideoElem = document.getElementById('fullscreen-video');
var fullscreenVideoView = document.getElementById('fullscreen-video-view');
var videoCta = document.getElementById('video-cta');
var vungleAd = document.getElementById('vungle-ad');
var footer = document.getElementById('video-footer');

function initCTA(pkg) {
    setTimeout(function() {
        if (pkg.showCTA === 'true')
            AdHelper.addClass(footer, 'show')
        if (pkg.fullscreen === 'true') {
            vungleAd.addEventListener('click', function() {
                window.callSDK('download')
            });
        } else {
            videoCta.addEventListener('click', function() {
                window.callSDK('download')
            });
        }
    }, parseInt(pkg.delay) * 1000)
}