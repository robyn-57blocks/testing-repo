/* ----- Vungle Design Framework - Event Controller ----- */

export default {
    sendEvent
};

function sendEvent(name,obj = {}) {
    var event = new CustomEvent(name, {'detail':obj});
    window.dispatchEvent(event);
}