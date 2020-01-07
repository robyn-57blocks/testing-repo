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



## License
© Vungle. All Rights Reserved. 


- - - - - - -


## Creative-level Features
Design Framework Core sends specific events and attributes it recieves from the SDK and Ad response to the creative-level:
- Events can be used to control the user experience when an environment changes (e.g video in the creative can be paused if the user hides the application, or resumed when they return to the application).
- Attributes can be used to customise the ad experience based on SDK settings, or tokens provided at the Application, Placement or Creative level.


### Events
Specific events are posted to the creative to allow the user experience to be updated based on the user environment. You can use the following event handlers to change the creative experience:

#### `ad-event-init`
Event is triggered once communication between the parent `index.html` and child `ad.html` has been established and completed. Use this event to ensure `VungleHelper` global variable is correctly defined (more information below).
```javascript
window.addEventListener('ad-event-init', function() { // Listening for init event from Design Framework Core
	// Initialise or load anything inside here
});
```

#### `ad-event-pause`
Event is triggered when either the application is closed by the user, or the privacy page is displayed. Use this event to pause animations, audio or video in the creative so they don't continue to play outside the ad experience. 
```javascript
window.addEventListener('ad-event-pause', function() { // Listening for pause event from Design Framework Core
	// Pause anything inside here
});
```

#### `ad-event-resume`
Event is triggered when either the application is resumed by the user, or the privacy page is closed. Use this event to resume animations, audio or video in the creative so they begin to play once the creative is once again visible to the user.
```javascript
window.addEventListener('ad-event-resume', function() { // Listening for resume event from Design Framework Core
	// Resume anything inside here
});
```


### Attributes (VungleHelper)
A global variable called `VungleHelper` defined in the `ad-js-injection.js` provides attributes which can be used at the creative level.

**Important!** Attributes in `VungleHelper` may not be made available immediately when `ad.html` loads, as there is a very small delay in communication between the parent `index.html` and child `ad.html` files. You should use the `ad-event-init` event to ensure `VungleHelper` has been initialised fully. For example:

```javascript
window.addEventListener('ad-event-init', function() { // Listening for init event from Design Framework Core
	document.body.innerHTML = VungleHelper.tokens.CTA_BUTTON_URL // Write to the document the CTA_BUTTON_URL token value
});
```

#### `VungleHelper.closeDelay`
Close button delay. Value (in seconds) of the close button delay for the ad-unit.

#### `VungleHelper.rewardedAd`
Ad-unit rewarded. Displays whether the ad-unit is rewarded or not (true/false).

#### `VungleHelper.tokens`
Ad-unit tokens. Displays token values from ad response (as an object). Returns an object of all token key/value pairs.
To use a specific token, call it's key. For example: `VungleHelper.tokens.CTA_BUTTON_URL`