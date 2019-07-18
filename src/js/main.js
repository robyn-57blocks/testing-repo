import { default as AdCore } from './vungle-ad-core.js';

window.addEventListener('load', function() {
    AdCore.init(function() {
        console.log('VUNGLE AD - ready');
    });
});

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod]; // This is a fix for IE9, we may not need ait any longer.
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
// Listen to message from child window
eventer(messageEvent, function(e) {
    switch (e.data) {
        case 'close':
            alert('close')
            window.callSDK('close');
            break;
        case 'download':
            alert('download')
            window.callSDK('download');
            break;
    }
}, false);