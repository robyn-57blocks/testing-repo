export default { updateTokens }

import { default as DataStore } from './vungle-ad-data-store.js';

window.addEventListener('ad-event-child-instructions', updateTokens);
window.addEventListener('ad-event-sk-presentation', updateTokens);

function updateTokens(e) {
    if (typeof e.detail === 'undefined' || e.detail.length)
        return

    var content = e.detail

    var settings = DataStore.get('settings', false)
    if (settings) {
        for (var key in content) {
            if (content[key] !== '')
                settings[key] = content[key]
        }
        DataStore.push('settings', settings)
    }
}