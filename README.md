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



# Creative-level Features
Design Framework Core sends specific events and attributes it recieves from the SDK and Ad response to the creative-level:
- Events can be used to control the user experience when an environment changes (e.g video in the creative can be paused if the user hides the application, or resumed when they return to the application).
- Attributes can be used to customise the ad experience based on SDK settings, or tokens provided at the Application, Placement or Creative level.


## Events
Specific events are posted to the creative to allow the user experience to be updated based on the user environment. You can use the following event handlers to change the creative experience:


#### `ad-event-init`
Event is triggered once communication between the parent `index.html` and child `ad.html` has been established and completed. Use this event to ensure `VungleHelper` global variable is correctly defined (more information below).
```javascript
window.addEventListener('ad-event-init', function() {
	// Listening for init event from Design Framework Core
	// Initialise or load anything inside here
});
```


#### `ad-event-pause`
Event is triggered when either the application is closed by the user, or the privacy page is displayed. Use this event to pause animations, audio or video in the creative so they don't continue to play outside the ad experience. 
```javascript
window.addEventListener('ad-event-pause', function() {
	// Listening for pause event from Design Framework Core
	// Pause anything inside here
});
```


#### `ad-event-resume`
Event is triggered when either the application is resumed by the user, or the privacy page is closed. Use this event to resume animations, audio or video in the creative so they begin to play once the creative is once again visible to the user.
```javascript
window.addEventListener('ad-event-resume', function() {
	// Listening for resume event from Design Framework Core
	// Resume anything inside here
});
```


#### `ad-event-overlay-view-visible`
Event is triggered when SKOverlay is presented on screen.
```javascript
window.addEventListener('ad-event-overlay-view-visible', function() {
	// Listening for SKOverlay visible event from Design Framework Core
	// Make any updates to the creative inside here. E.g hide the CTA button when SKOverlay appears.
});
```


#### `ad-event-overlay-view-finished`
Event is triggered when SKOverlay is no longer visible.
```javascript
window.addEventListener('ad-event-overlay-view-finished', function() {
	// Listening for SKOverlay finished event from Design Framework Core
	// Make any updates to the creative inside here. E.g show the CTA button when SKOverlay is not visible.
});
```


#### `ad-event-overlay-view-failed`
Event is triggered if SKOverlay fails to present on screen.
```javascript
window.addEventListener('ad-event-overlay-view-failed', function() {
	// Listening for SKOverlay failed event from Design Framework Core
	// Make any updates to the creative inside here. E.g re-show the CTA button as the 'ad-event-overlay-view-visible' event would not have been triggered due to the failure.
});
```


## Vungle Helper
A global variable called `VungleHelper` defined in the `ad-js-injection.js` provides additional creative capabilities to enhance the ad experience.

:warning: **Important!**
`VungleHelper` may not be immediately accessible when `ad.html` is loading, as there is a short delay in communication between the parent `index.html` and child `ad.html` files. **You should always use the `ad-event-init` event to guarantee `VungleHelper` accessibility.** For example, use the following:
```javascript
window.addEventListener('ad-event-init', function() {
	// Listening for init event from Design Framework Core
	// Write to the document the CTA_BUTTON_URL token value
	document.body.innerHTML = VungleHelper.tokens.CTA_BUTTON_URL 
});
```


### Attributes
**`VungleHelper.closeDelay`**
Endcard close button delay. Returns a value (in seconds).

**`VungleHelper.rewardedAd`**
Displays if the ad is rewarded or not. Returns true/false.

**`VungleHelper.tokens`**
Ad-unit tokens. Returns an object of all token key/value pairs. (To use a specific token, use the attribute listed below).

**`VungleHelper.tokens.[token name]`**
Ad-unit tokens. Returns the value of the specified token. For example: `VungleHelper.tokens.CTA_BUTTON_URL`



### Methods

 **`VungleHelper.setSKPresentation(eventType, presentationType, presentationOptions[optional])`**
Used to define which StoreKit view should be presented based on the CTA event.
Remember to call these methods during the initialisation of the creative, so the creative can set the correct StoreKit presentation as early into the ad experience as possible. You can also call these methods at a later time during the creative if you want to change the SK presentation based on the creative experience. Once a method has been called, it will be used for future interactions based on the `eventType`, unless another `setSKPresentation` method is subsequently called.

 - **eventType** options:
Defines the type of user interaction that triggers a 'download' event.
	 - `"cta-click"` - used when a user interacts with a CTA, or calling `parent.postMessage('download','*')` directly
	 - `"asoi-complete"` - used when ASOI complete event is triggered
	 - `"asoi-interaction"` - used when ASOI interaction event is triggered

 - **presentationType**  options:
Defines the type of presentation to be displayed for the 'download' event.
	 - `"overlay-view"` - display SKOverlay
	 - `"product-view"` - display SKProductView
	 - `"off"` - display App Store (outside of publisher app) or browser

- **presentationOptions** *(optional parameter, used only for SKOverlay)*:
Format for presentation options must be provided as an object. For example: `{"position": "bottom-raised", "dismissible": true}`
	 - `"position"` - defines position of SKOverlay. One of the following options can be used:
		 - `"bottom"` - SKOverlay is positioned at the bottom of the screen
		 - `"bottom-raised"` - SKOverlay is positioned at a raised position near the bottom of the screen
	 - `"dismissible"` - defines whether SKOverlay can be dismissed by the user. One of the following options can be used:
		 - `true` - SKOverlay can be dismissed by the user
		 - `false` - SKOverlay cannot be dismissed by the user


How to use method (examples):

```javascript
VungleHelper.setSKPresentation("cta-click", "overlay-view", {"position": "bottom-raised", "dismissible": true});
```
```javascript
VungleHelper.setSKPresentation("asoi-complete", "product-view");
```
```javascript
VungleHelper.setSKPresentation("asoi-interaction", "off");
```


 **`VungleHelper.dismissSKOverlay()`**
Used to programatically dismiss SKOverlay without user interaction (if visible).
