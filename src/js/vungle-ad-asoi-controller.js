export default { init, handleInteraction, triggerAsoiEvent, completeAd}

import { default as VungleAd } from './vungle-ad.js';
import { default as DataStore } from './vungle-ad-data-store.js';
import { fireTpat, tpats } from './events.js';

var tokenisedASOI;

function init(asoiTokenValue) {
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
    settings.ASOITriggered = false;

    //If ASOI token exists then use token value, otherwise fall back to default which is complete
    if (asoiTokenValue) {
        tokenisedASOI = asoiTokenValue;
    } else {
        tokenisedASOI = "complete";
    }

    DataStore.push('settings', settings)

    // Event Listeners will be fired from the post-messenger or event-controller
    window.addEventListener('interacted', handleInteraction)
    window.addEventListener('complete', completeAd)
    window.addEventListener('ad-event-close-button-reveal', initASOIDelayTimerAutoplay)
}

function initASOIDelayTimerAutoplay() {
    // @if NODE_ENV='dev'
    console.log('%cASOI%c close button visible - autoplay', 'color: #EB7500;font-weight:bold', 'color: inherit');
    // @endif
    var settings = DataStore.get('settings', false)

    if (settings.ASOIEnabled === true &&
        settings.asoiDelayStarted !== true &&
        settings.ASOIEnded === false &&
        (tokenisedASOI == "aggressive" || tokenisedASOI == "complete")) {

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

                triggerAsoiEvent(asoiEventTypes.complete);
            }
            DataStore.push('settings', tmpSettings)
        }, settings.ASOIDelayTimerAutoplay * 1000);
    }
}

  const asoiEventTypes = {
    interaction: "interaction",
    complete: "complete"
  }

function triggerAsoiEvent(eventType) {
  if(eventType === asoiEventTypes.interaction) {
    fireTpat(tpats.asoiInteraction);
    window.callSDK('download', 'asoi-interaction');
  } else if (eventType === asoiEventTypes.complete) {
    fireTpat(tpats.asoiComplete);
    window.callSDK('download', 'asoi-complete');
  }
}


function handleInteraction() {

    var settings = DataStore.get('settings', false)

    // @if NODE_ENV='dev'
    console.log('%cASOI%c interaction', 'color: #EB7500;font-weight:bold', 'color: inherit');
    console.log(`settings: ${JSON.stringify(settings)}`);
    // @endif

    fireTpat(tpats.endcardClick);

    
    if (settings && typeof settings.ASOIEnabled !== 'undefined' && 
        settings.ASOIEnabled && settings.ASOIEnded === false && 
        (tokenisedASOI == "aggressive" || tokenisedASOI == "complete")) {

        settings.hasInteracted = true;

        // dont call multiple downloads
        if (settings.interactions === -1) {
            return;
        }

        settings.interactions++;

        // ASOI TAP: if user interactions is over a certain amount trigger ASOI
        if (settings.ASOIEnabled === true &&
            settings.ASOITapInteractions > 0 &&
            settings.interactions >= settings.ASOITapInteractions &&
            tokenisedASOI == "aggressive") {

            settings.interactions = -1;
            settings.ASOIEnded = true;
            settings.ASOITriggered = true;

            setTimeout(function() {
                triggerAsoiEvent(asoiEventTypes.interaction);
            }, settings.ASOIDelayTimer * 1000);
        }

        // ASOI event for aggressive or complete, only if previous ASOI logic above has not be triggered
        if (settings.ASOIEnabled === true &&
            settings.hasInteracted === true && 
            settings.completeAd === true &&
            settings.ASOITriggered === false &&
            (tokenisedASOI == "aggressive" || tokenisedASOI == "complete")) {
            
            settings.ASOITriggered = true;
            
            setTimeout(function() {
                triggerAsoiEvent(asoiEventTypes.interaction);
            }, settings.ASOIDelayTimer * 1000);
        }

        DataStore.push('settings', settings)
    }
}

function completeAd() {
    var settings = DataStore.get('settings', false)

    // @if NODE_ENV='dev'
    console.log('%cASOI%c complete', 'color: #EB7500;font-weight:bold', 'color: inherit');
    console.log(`settings: ${JSON.stringify(settings)}`);
    // @endif

    if (settings.completeAd || settings.ASOIEnded)
        return

    settings.completeAd = true;
    const shouldFireCompleteEvent = settings.ASOIEnabled === true &&
       (settings.hasInteracted === true || settings.asoiDelayCompleted === true) &&
       (tokenisedASOI == "aggressive" || tokenisedASOI == "complete")
    

    if (shouldFireCompleteEvent) {
        settings.ASOIEnded = true;
        
        setTimeout(function() {
          triggerAsoiEvent(asoiEventTypes.complete);
        }, settings.ASOIDelayTimer * 1000);
    }

    DataStore.push('settings', settings)
}
