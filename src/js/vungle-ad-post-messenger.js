export default { init, sendMessage }
import { default as EventController } from './vungle-ad-event-controller.js';

var iframe;
var iframeLoaded = false;
var buffer = [];

function init() {
    iframe = document.getElementById('ad-content');

    iframe.onload = function() {
        iframeLoaded = true;
        pushBufferedMessages();
    }
}


function sendMessage(title, obj) {

    var data = {
        title: title,
        content: obj
    }

    if (iframeLoaded)
        iframe.contentWindow.postMessage(JSON.stringify(data), '*');
    else
        buffer.push(data)
}

window.sendMsg = function(title, obj) {
    sendMessage(title, obj);
}

function pushBufferedMessages() {
    for (var i = 0; i < buffer.length; i++)
        sendMessage(buffer[i])
    buffer = [];
}

window.addEventListener('vungle-ad-iframe-reload', function() { iframeLoaded = false })
window.addEventListener('message', recieveMessage)

function recieveMessage(e) {
    if (e.data.length === 0)
        return

    var data = e.data;
    try {
        data = JSON.parse(e.data)
    } catch (e) {
        console.log(e)
    }

    EventController.sendEvent(data.title || data, data.obj)
}