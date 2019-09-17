import { default as DataStore } from './vungle-ad-data-store.js';

window.addEventListener('ad-event-child-instructions', updateTokens);

function updateTokens(e) {
    if (typeof e.data.content === 'undefined' || e.data.content.length)
        return

    var settings = DataStore.get('settings', false)
    if (settings) {
        for (var key in e.data.content) {
            settings[key] = e.data.content[key]
        }
        DataStore.push('settings', settings)
    }
}