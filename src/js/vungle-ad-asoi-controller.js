export default { init }

import { default as VungleAd } from './vungle-ad.js';
import { default as DataStore } from './vungle-ad-data-store.js';

function init() {

    // Event Listeners will be fired from the post-messenger or event-controller
    window.addEventListener('interacted', handleInteraction)
    window.addEventListener('complete', completeAd)
}

function handleInteraction() {
    var settings = DataStore.get('settings', false) || {}

    settings.hasInteracted = true;
    // dont call multiple downloads
    if (settings.interactions === -1) {
        return;
    }

    // initialize if not already initialized
    // Default setting for ASOI is complete as this is the same in legacy
    settings.ASOI = settings.ASOI || VungleAd.tokens.APP_STORE_ON_INTERACTION || 'complete';
    settings.interactions = settings.interactions || 0;
    settings.interactions++;

    DataStore.push('settings', settings)
    // ASOI TAP: if user interactions is over a certain amount trigger ASOI
    if (settings.ASOI !== false &&
        isNaN(settings.ASOI) === false &&
        settings.interactions >= parseInt(settings.ASOI)) {

        settings.interactions = -1;
        window.callSDK('download');
    }
}



function completeAd() {
    if (typeof VungleAd.tokens.APP_STORE_ON_INTERACTION === 'undefined' || VungleAd.tokens.APP_STORE_ON_INTERACTION === 'complete')
        // Default state for ASOI is Complete, 
        window.callSDK('download');
}

// Complete , 1 , 2 and OFF