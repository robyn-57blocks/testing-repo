export default { init }

import { default as VungleAd } from './vungle-ad.js';
import { default as DataStore } from './vungle-ad-data-store.js';

function init() {
    var settings = DataStore.get('settings', false) || {}
    settings.ASOIEnabled = false;
    settings.ASOIDelayTimer = 0;
    settings.ASOITapInteractions = 0;

    settings.interactions = 0;
    settings.asoiDelayCompleted = false;
    settings.completeAd = false;
    settings.hasInteracted = false;
    settings.ASOIDelayTimerAutoplay = 5;
    settings.ASOIEnded = false;
    // Define ASOI

    DataStore.push('settings', settings)
    // Event Listeners will be fired from the post-messenger or event-controller
    window.addEventListener('interacted', handleInteraction)
    window.addEventListener('complete', completeAd)
    window.addEventListener('ad-event-close-button-reveal', initASOIDelayTimerAutoplay)
}

function initASOIDelayTimerAutoplay() {
    var settings = DataStore.get('settings', false)

    if (settings.ASOIEnabled === true &&
        settings.asoiDelayStarted !== true &&
        settings.ASOIEnded === false) {

        settings.ASOIDelayTimerAutoplay = settings.ASOIDelayTimerAutoplay || 5;

        settings.asoiDelayStarted = true;

        setTimeout(function() {
            var tmpSettings = DataStore.get('settings', false)
            tmpSettings.asoiDelayCompleted = true;



            if (tmpSettings.completeAd === true &&
                tmpSettings.hasInteracted === false) {

                if (tmpSettings.ASOIEnded)
                    return
                else
                    tmpSettings.ASOIEnded = true

                window.callSDK('download');
            }
            DataStore.push('settings', tmpSettings)
        }, settings.ASOIDelayTimerAutoplay * 1000);
    }
}

function handleInteraction() {
    var settings = DataStore.get('settings', false)

    if (settings && typeof settings.ASOIEnabled !== 'undefined' && settings.ASOIEnabled && settings.ASOIEnded === false) {
        settings.hasInteracted = true;

        // dont call multiple downloads
        if (settings.interactions === -1) {
            return;
        }

        settings.interactions++;


        // ASOI TAP: if user interactions is over a certain amount trigger ASOI
        if (settings.ASOIEnabled === true &&
            settings.ASOITapInteractions > 0 &&
            settings.interactions >= settings.ASOITapInteractions) {

            settings.interactions = -1;

            settings.ASOIEnded = true;
            setTimeout(function() {
                window.callSDK('download');

            }, settings.ASOIDelayTimer * 1000);
        }
        DataStore.push('settings', settings)
    }
}

function completeAd() {
    var settings = DataStore.get('settings', false)

    if (settings.completeAd || settings.ASOIEnded)
        return

    settings.completeAd = true;
    if (settings.ASOIEnabled === true && settings.hasInteracted === true || settings.asoiDelayCompleted === true) {
        settings.ASOIEnded = true;
        setTimeout(function() {
            window.callSDK('download');
        }, settings.ASOIDelayTimer * 1000);
    }
    DataStore.push('settings', settings)
}

// Complete , 1 , 2 and OFF