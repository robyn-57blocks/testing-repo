export default { init }

import { default as VungleAd } from './vungle-ad.js';
import { default as DataStore } from './vungle-ad-data-store.js';

function init() {
    var settings = DataStore.get('settings', false)
    settings.ASOIEnabled = false;
    settings.ASOIDelayTimer = 0;
    settings.ASOITapInteractions = 0;
    settings.interactions = 0;
    settings.asoiDelayCompleted = false;
    settings.completeAd = false;
    settings.hasInteracted = false;
    settings.ASOIDelayTimerAutoplay = 5;
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
        settings.asoiDelayStarted !== true) {

        settings.ASOIDelayTimerAutoplay = settings.ASOIDelayTimerAutoplay || 5;

        settings.asoiDelayStarted = true;

        setTimeout(function() {
            var tmpSettings = DataStore.get('settings', false)
            tmpSettings.asoiDelayCompleted = true;

            if (tmpSettings.completeAd === true &&
                tmpSettings.hasInteracted === false) {
                window.callSDK('download');
            }
            DataStore.push('settings', tmpSettings)
        }, settings.ASOIDelayTimerAutoplay * 1000);
    }
}

function handleInteraction() {
    var settings = DataStore.get('settings', false)

    if (settings && typeof settings.ASOIEnabled !== 'undefined' && settings.ASOIEnabled) {
        settings.hasInteracted = true;

        // dont call multiple downloads
        if (settings.interactions === -1) {
            return;
        }

        settings.interactions++;

        DataStore.push('settings', settings)

        // ASOI TAP: if user interactions is over a certain amount trigger ASOI
        if (settings.ASOIEnabled === true &&
            settings.ASOITapInteractions > 0 &&
            settings.interactions >= settings.ASOITapInteractions) {

            settings.interactions = -1;

            setTimeout(function() {
                window.callSDK('download');
            }, settings.ASOIDelayTimer * 1000);
        }
    }
}


function completeAd() {
    var settings = DataStore.get('settings', false)
    settings.completeAd = true;
    settings.ASOIDelayTimer = settings.ASOIDelayTimer || 0;
    if ((settings.ASOIEnabled === true && settings.hasInteracted === true) || settings.asoiDelayCompleted === true) {
        setTimeout(function() {
            window.callSDK('download');
        }, settings.ASOIDelayTimer * 1000);
    }
    DataStore.push('settings', settings)
}

// Complete , 1 , 2 and OFF