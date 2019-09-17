// Legacy IEC v1 Event
window.callSDK = function(action) {
    parent.postMessage(action, '*');
};

// Legacy IEC v2 Event
window.actionClicked = function(action) {
    parent.postMessage(action, '*');
};

// Adwords Open Event
window.open = function() {
    //Open should always redirect to CTA Download
    parent.postMessage('download', '*');
};

window.addEventListener('touchstart', function() {
    parent.postMessage('interacted', '*');
});

function sendEvent(name, obj = {}) {
    var event = new CustomEvent(name, { 'detail': obj });
    window.dispatchEvent(event);
}

// Disable Event Propagation for touchstart event listeners
Event.prototype.stopPropagation = function() {}

window.sendMessage = function(title, obj) {
    // Make sure you are sending a string, and to stringify JSON
    var data = {
        title: title,
        content: obj
    }

    window.parent.postMessage(data, '*');
};

window.receiveMessage = function(e) {
    if (e.data.length === 0 || typeof e.data.title === 'undefined')
        return
    sendEvent(e.data.title, e.data.content || {})
}

window.addEventListener('message', window.receiveMessage);

window.sendInstructions = function() {
    window.sendMessage('ad-event-child-instructions', window.vungleSettings)
}

window.vungleSettings = {
    ASOIEnabled: true,
    ASOIDelayTimer: 0,
    ASOITapInteractions: 2
}

if (typeof window.vungleSettings !== 'undefined')
    window.sendInstructions()
