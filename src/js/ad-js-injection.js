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
    sendEvent(e.data.title)
}

window.addEventListener('message', window.receiveMessage);


// window.addEventListener('touchstart', function(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     console.log('touchstart');
// },true);

// window.addEventListener('touchmove', function(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     console.log('touchmove');
// },true);

// window.addEventListener('touchend', function(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     console.log('touchend');
// },true);

document.ontouchmove = function(e) {
       e.preventDefault();
   }

document.ontouchmove = function(e) {
       e.preventDefault();
   }

// document.ontouchmove = function(e) {
//     e.preventDefault();
// }