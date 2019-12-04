# Design Framework Core

The Design Framework Core is our centralised codebase which contains a boilerplate to render custom ad formats on the Vungle network through our SDK. These custom ad formats run as MRAID ad units (using the internal *vungle_mraid* ad format).


## Getting Started
### Running Locally (Dev environment)
- Uses mraid mock defined in `src/js/vungle-ad.js` to emulate tokens/MRAID values from the SDK.
- This allows Design Framework to operate locally within the browser without the SDK.
```
gulp
```

### Running Locally (Prod environment)
- Uses MRAID provided by the SDK.
- This requires the ad unit to be viewed on the device via the SDK.
```
gulp serve:prod
```

### Compiling for Production
- Compiles Design Framework into `/dist` folder.
- `df-dist.zip` is also generated which contains the necessary files to run the bundle on the Vungle SDK.
- Code is minified and merged into `index.html`. The following files are generated:
	- `ad-js-injection.js`
	- `ad.html` (this is a sample ad.html used as a placeholder, which would be replaced by the actual creative).
	- `index.html`
	- `mraid.js`
```
gulp bundle:prod
```


## Cacheable Replacements & Assets
- Design Framework core files which are used to serve the most up to date codebase for ads are hosted in the following buckets:
	- `vungle2-cdn-prod/creative/design-framework` (Production)
	- `vungle2-cdn-qa/creative/design-framework` (Staging/QA)
- Default assets for Design Framework are hosted in the following bucket: `vungle2-cdn-prod/creative/design-framework/assets`

## Event Listeners 

### Ad Tokens
- Design Framework Core provides all the tokens it recieves from the SDK to the ad-unit, these can be found in the globally defined variable `VungleHelper` The tokens will not be usable onload and should only be called for once the `ad-event-init` message has been sent from the core to the ad unit. 
```javascript
window.addEventListener('ad-event-init', function() { // Listening for event from Design Framework Core
	document.getElementById('token-placement').innerHTML = JSON.stringify(VungleHelper.tokens, undefined, 2) // VungleHelper.tokens will now be defined and contain all the tokens provided from Design Framework Core.
});
```
### Pause And Resume 
- Design Framework Core will send down pause and resume events if the ad experience is hidden behind either privacy page or storekit, or if the window is minified. To use these events listen for `ad-event-pause` and `ad-event-resume` 

```javascript
window.addEventListener('ad-event-pause', function() { // Listening for event from Design Framework Core
	// Pause anything inside here
});
```

```javascript
window.addEventListener('ad-event-resume', function() { // Listening for event from Design Framework Core
	// Resume anything inside here
});
```

## License
© Vungle. All Rights Reserved. 