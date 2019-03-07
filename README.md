# Design Framework Core

The Design Framework Core is our centralised codebase which contains a boilerplate to render custom ad formats on the Vungle network through our SDK. These custom ad formats run as MRAID ad units (using the internal *vungle_mraid* ad format).


## Getting Started
### Gulp Tasks

####Running Locally (Dev environment)
* Uses mraid mock defined in `src/js/vungle-ad.js` to emulate tokens/MRAID values from the SDK.
* This allows Design Framework to operate locally within the browser without the SDK.
```
gulp
```

####Running Locally (Prod environment)
* Uses MRAID provided by the SDK.
* This requires the ad unit to be viewed on the device via the SDK.
```
gulp serve:prod
```

####Compiling for Production
* Compiles Design Framework into `/dist` folder.
* `df-dist.zip` is also generated which contains the necessary files to run the bundle on the Vungle SDK.
* Code is minified and merged into `index.html`. The following files are generated:
	* `ad-js-injection.js`
	* `ad.html` (this is a sample ad.html used as a placeholder, which would be replaced by the actual creative).
	* `index.html`
	* `mraid.js`
```
gulp bundle:prod
```


## License
© Vungle. All Rights Reserved. 
