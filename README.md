# DEPRECATED

The code for this project has been moved into this repo....

https://bitbucket.org/vungle_creative_labs/design-framework-components/src/master/

...and can be found at 

design-framework-components/components/vungle

# VCL - Design Framework

The Design Framework defines a 'boilerplate' of reusable components of all our Ad units through the work produced by VCL. This boilerplate is designed to modularise components which we use for bespoke creative, Dynamic Templates/Native, and our future full-native ad experiences (such as AR).


## Getting Started

1. Install nodejs - Chrome's JavaScript runtime
2. Install node-sass

```
npm install
```


## Components
### Ad Skeleton
* **index.html**
	* The skeleton of the ad unit including all declarations for external files, such as javascript libraries and CSS.
	* The index.html file also includes our consistent ad elements: CTA, close and Vungle logo.

### Event Handlers and Breakpoint System
* **vungle-ad-core.js**
	* `initVungleAd()` - Used to update class names based on the Vungle breakpoint system. This method should be first called on `window.onload` to ensure the ad is displayed correctly.
	* `callSDK(event)` - Used as the bridge between webview and SDK. Previously named `doSomething()`. This method handles our close and CTA response on the SDK side.
	* Template setup values allow the template to be designed for specific ad units.
		* Debug - displays an overlay showing the breakpoint of the current window size to help guide the designer.
		* dynamicTemplates - can be used to make creative changes to the ad unit if the creative is a Dynamic Template.
		* theme - used to toggle stylistic changes to the creative based on theme. By default, there should always be either light or dark themes, but the designer may choose to add new themes in the future.

* **vungle-ad-creative.js**
	* Used to define any custom javascript for the creative. This is also where our `initVungleAd()` must be called.
	* Define any event listeners.
	* Define any touch events.

* **vungle-ad-helpers.js**
	* Additional helpers to speed up production and reduce code.
	* `addClass()` - add a classname to an element.
	* `removeClass()` - remove a classname from an element.
	* `hasClass()` - check if an element has a class.
	* `getOS()` - returns OS of browser user agent, either `iOS`, `Android`, `Windows` or `null`.
	* `vungleVideoType()` - returns info on Vungle video (ratio, classname, original video width/height).
	* `resizeVideo()` - resizes video to fit parent container without visible black bars based on our supported ratios.

### Styling
* **vungle-ad-creative.scss**
	* Styles specific to the creative. All other styles are imported in this file and only this style is required to be defined in the index.html file.
* **_vungle-ad-core.scss**
	* Styling consistent across multiple creative such as header, footer and any CSS resets. We also define variables for reusable properties (such as colours etc.)
* **_vungle-ad-core-breakpoints.scss**
	* Vungle breakpoint classnames. We define shortcut variables which the designer can use in other stylesheets to define specific styles based on breakpoint.
* **_vungle-ad-core-mixins.scss**
	* Additional helpers to speed up production, reduce code and also ensure we use correct styling across multiple browsers with different browser prefixes.
* **_vungle-ad-dynamic-templates.scss**
	* Styling specific to DTs (such as font-sizes, colours etc.) We use this file to separate specific elements out to ensure they are used across interstitial ad units and smaller native ad units.


## Versioning
Current: v0.1.0


## License
© Vungle. All Rights Reserved.
