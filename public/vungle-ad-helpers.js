/* ----- Vungle Design Framework - JS ad helper methods ----- */

/*	addClass() - add a classname to an element
	removeClass() - remove a classname from an element
	hasClass() - check if an element has a class
	getOS() - returns OS of browser user agent, either iOS, Android, Windows or null
	vungleVideoType() - returns info on Vungle video (ratio, classname, original video width/height)
	resizeVideo() - resizes video to fit parent container without visible black bars based on our supported ratios
*/

function addClass(elem, classString) {
	if (elem.classList) {
		elem.classList.add(classString);
	} else {
		elem.className += ' ' + classString;
	}
}

function removeClass(elem, classString) {
	if (elem.classList) {
		elem.classList.remove(classString);
	} else {
		elem.className = elem.className.replace(new RegExp('(^|\\b)' + classString.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}
}

function hasClass(elem, classString) {
    return (' ' + elem.className + ' ').indexOf(' ' + classString + ' ') > -1;
}

function getOS() {
	var userAgent = window.navigator.userAgent,
		platform = window.navigator.platform,
		macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
		windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
		iosPlatforms = ['iPhone', 'iPad', 'iPod'],
		os = null;
	
	if ((macosPlatforms.indexOf(platform) !== -1) || (iosPlatforms.indexOf(platform) !== -1)) {
		os = 'ios';
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		os = 'windows';
	} else if (/Android/.test(userAgent)) {
		os = 'android';
	} else {
		os = ''
	}
	
	return os;
}

function greatestCommonDivisor(a, b) {
        return (b == 0) ? a : greatestCommonDivisor(b, a%b);
    }
	
function vungleVideoType(width, height) {
	var r = greatestCommonDivisor(width,height);
	var type;
	switch(width/r+":"+height/r) {
	    case "16:9":
	    	type = "landscape";
	        break;
	    case "9:16":
	    	type = "portrait";
	        break;
	    case "1:1":
	    	type = "square";
	        break;
	    default:
	        type = "nonconform";
	}
	
	return {
		ratio:width/r+":"+height/r,
		classname:"ratio"+width/r+""+height/r,
        type:type,
        width:width,
        height:height
    };
}

function resizeVideo(videoArea, videoHolderElem, videoContainerElem) {

	var ratio916 = 0.5625;
	var ratio916width = videoArea.offsetHeight*ratio916;
	var ratio916height = videoArea.offsetWidth/ratio916;
	
	var ratio169 = 0.5625;
	var ratio169width = videoArea.offsetHeight/ratio169;
	var ratio169height = videoArea.offsetWidth*ratio169;
	
	var ratio11width = videoArea.offsetHeight;
	var ratio11height = videoArea.offsetWidth;
	
	videoHolderElem.style.width = "";
	videoHolderElem.style.height= "";
	
	if (hasClass(document.body, 'portrait') || hasClass(document.body, 'square')) {
		if (vungleVideo.ratio === "9:16") {
			//Portrait ad unit
			if (ratio916width<=videoArea.offsetWidth) {
				videoHolderElem.style.width = ratio916width+"px";
			} else {
				videoHolderElem.style.height = ratio916height+"px";
			}
		} else if (vungleVideo.ratio === "16:9") {
			//Landscape ad unit
			if (ratio169height<=videoArea.offsetHeight) {
				videoHolderElem.style.height = ratio169height+"px";
			} else {
				videoHolderElem.style.width = ratio169width+"px";
			}
		} else {
			//Square ad unit
			if (ratio11width<=videoArea.offsetWidth) {
				videoHolderElem.style.width = ratio11width+"px";
			} else {
				videoHolderElem.style.height = ratio11height+"px";
			}
		}
	} else {
		if (vungleVideo.ratio === "9:16") {
			//Portrait ad unit
			if (ratio916height<=videoArea.offsetHeight) {
				videoHolderElem.style.height = ratio916height+"px";
			} else {
				videoHolderElem.style.width = ratio916width+"px";
			}
		} else if (vungleVideo.ratio === "16:9") {
			//Landscape ad unit
			if (ratio169height<=videoArea.offsetHeight) {
				videoHolderElem.style.height = ratio169height+"px";
			} else {
				videoHolderElem.style.width = ratio169width+"px";
			}
		} else {
			//Square ad unit
			if (ratio11width<=videoArea.offsetWidth) {
				videoHolderElem.style.width = ratio11width+"px";
			} else {
				videoHolderElem.style.height = ratio11height+"px";
			}
		}
	}
}