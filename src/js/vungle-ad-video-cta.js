export default {
    initCTAListener,
    initCTA
}

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as EventController } from './vungle-ad-event-controller.js';
 
import { isFullScreenClickOnVideoEnabled, isCtaOnlyOnVideoEnabled } from "./vungle-ad-video-skoverlay.js"


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
    
    const videoCta = document.getElementById('video-cta');
    const fullscreenVideo = document.getElementById('fullscreen-video');
    
    if (pkg.showCTA === 'true')
        AdHelper.addClass(videoCta, 'show');

    if (isFullScreenClickOnVideoEnabled()) {
        fullscreenVideo.addEventListener('click', function() {
            window.callSDK('download', 'fsc-video')
        });
    }

    if (isCtaOnlyOnVideoEnabled()) {
        videoCta.addEventListener('click', function() {
            window.callSDK('download', 'fsc-video')
        });
    }

}
