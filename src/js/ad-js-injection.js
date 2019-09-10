
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

// Disable Event Propagation for touchstart event listeners
Event.prototype.stopPropagation = function() {}

window.sendMessage = function(title, obj) {
    // Make sure you are sending a string, and to stringify JSON
    var data = {
        title: title,
        content: obj
    }

    window.parent.postMessage(JSON.stringify(data), '*');
};

window.receiveMessage = function(e) {
    if(e.data.length === 0)
        return

    var data = JSON.parse(e.data)
}

window.addEventListener('message', window.receiveMessage)