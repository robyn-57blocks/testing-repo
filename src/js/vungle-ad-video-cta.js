export default {
    initCTAListener,
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';

var fullscreenVideoElem = document.getElementById('fullscreen-video');
var fullscreenVideoView = document.getElementById('fullscreen-video-view');
var videoCta = document.getElementById('video-cta');
var fullscreenVideo = document.getElementById('fullscreen-video');
var footer = document.getElementById('video-footer');



function initCTAListener(pkg) {
    window.addEventListener('vungle-video-time-update', CTAListenerFunction);

    function CTAListenerFunction(e) {
        if (e.detail > parseFloat(pkg.delay)) {
            window.removeEventListener('vungle-video-time-update', CTAListenerFunction)
            initCTA(pkg);
        }
    }
}



function initCTA(pkg) {
    if (pkg.showCTA === 'true')
        AdHelper.addClass(footer, 'show')
    if (pkg.fullscreen === 'true') {
        fullscreenVideo.addEventListener('click', function() {
            window.callSDK('download')
        });
    }
    videoCta.addEventListener('click', function() {
        window.callSDK('download')
    });

}