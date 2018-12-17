import { default as AdCore } from './vungle-ad-core.js';

window.addEventListener('load', function() {
    AdCore.init(function() {
        console.log('ready');
    });
});

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

// Listen to message from child window
eventer(messageEvent, function(e) {
    switch (e.data) {
        case 'close':
            window.callSDK('close');
            break;
        case 'download':
            window.callSDK('download');
            break;
    }
}, false);