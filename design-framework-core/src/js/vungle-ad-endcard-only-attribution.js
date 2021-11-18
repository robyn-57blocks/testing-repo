/* ----- Vungle Design Framework - Endcard Only Attribution ----- */

export default {
    startTimer,
    resumeTimer,
    pauseTimer,
    clearTimer
}

import { default as AdHelper } from './vungle-ad-helpers.js';

/* Trigger events at the following times:

0 seconds   - videoLength: 5000, videoViewed: 100, TPAT: checkpoint.0
1 second    - no events should be triggered
2 seconds   - videoViewed: 2000, TPAT: checkpoint.25
3 seconds   - videoViewed: 3000, TPAT: checkpoint.50
4 seconds   - videoViewed: 4000, TPAT: checkpoint.75
5 seconds   - videoViewed: 5000, TPAT: checkpoint.100

Position 0 of the arrays are set to null to skip first second
*/

var endcardOnlyAttributionTimer;
var timerPaused = false;
var timeSeconds = 0;

var endcardOnlyVideoViewCheckpoints = [null, 2000, 3000, 4000, 5000];
var endcardOnlyTPATCheckpoints = [null, 25, 50, 75, 100];
var endcardOnlyTPATCheckpointsReached = [];

function startTimer() {
    //Trigger mock video length and initial view events immediately
    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoLength", 5000);
    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", 100);

    //Trigger initial checkpoint.0 immediately
    window.vungle.mraidBridgeExt.notifyTPAT("checkpoint." + 0);

    //Trigger remaining checkpoints at it's specific second defined by the array position (interval runs every second, until it reaches the end of the array)
    endcardOnlyAttributionTimer = window.setInterval(function() {
        if(!timerPaused) {
            if (typeof endcardOnlyTPATCheckpointsReached[timeSeconds] === "undefined" ) {
                endcardOnlyTPATCheckpointsReached[timeSeconds] = true;
                
                //Only trigger TPAT and videoViewed event in the case that the checkpoint is a non-null value
                if (endcardOnlyTPATCheckpoints[timeSeconds]) {
                    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", endcardOnlyVideoViewCheckpoints[timeSeconds]);
                    window.vungle.mraidBridgeExt.notifyTPAT("checkpoint." + endcardOnlyTPATCheckpoints[timeSeconds]);
                }
            }

            if (++timeSeconds === endcardOnlyTPATCheckpoints.length) {
                clearTimer();
            }
        }
    }, 1000);
}

function resumeTimer() {
    timerPaused = false;
}

function pauseTimer() {
    timerPaused = true;
}

function clearTimer() {
    window.clearInterval(endcardOnlyAttributionTimer);
}