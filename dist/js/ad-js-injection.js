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