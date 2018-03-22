/* ----- Vungle Design Framework - JS ad core initialisation ----- */

var VungleAd = {};

var closeRevealDelay = 4000;
var closeRevealInteractionDelay = 1000;
var minimumPercentageContainerSize = 45;

VungleAd.adSizes = ['xs', 's', 'm', 'l', 'xl'];

var vungleAd = document.getElementById('vungle-ad');

window.addEventListener('load', function() {
	initVungleAd();
});

document.ontouchmove = function(event) {
    event.preventDefault();
}

window.addEventListener('resize', function(event) {
    vungleAd.style.opacity = 0;

    if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(function() {
        renderVungleAdSizingClass();
        vungleAd.style.opacity = 1;
    }, 20);
});

function initVungleAd() {
    //Called when Ad loads
    renderVungleAdSizingClass();
}

function renderVungleAdSizingClass() {

    var vungleAdContainer = document.getElementById('vungle-ad-container');
    var longestSide = (Math.max(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));
    var shortestSide = (Math.min(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));

    if (typeof theme === 'undefined' || theme === null) {
        theme = 'dark';
    }
    // @ifdef NODE_ENV='dev' 
    if (typeof debug === 'undefined' || debug === null) {
        debug = false;
    }
    // @endif

    var minimumContainerSize = (minimumPercentageContainerSize / 100 * longestSide);
    var adSizeSegmentLength = (longestSide - minimumContainerSize) / VungleAd.adSizes.length;
    var arrayCount = Math.floor((shortestSide - minimumContainerSize)/adSizeSegmentLength);

    var adShape, computedSize;
    var adSizeClass = '';

    if (longestSide === shortestSide) {
        //Square ad unit
        adShape = 'square';

    } else if (document.body.clientHeight > document.body.clientWidth) {
        //Portrait ad unit
        adShape = 'portrait';
        if (VungleAd.adSizes[arrayCount]) {
            computedSize = VungleAd.adSizes[arrayCount];
            adSizeClass = ' portrait-' + computedSize;
        } else {
            computedSize = VungleAd.adSizes[VungleAd.adSizes.length - 1];
            adSizeClass = ' portrait-' + computedSize + ' oob';
        }
    } else {
        //Landscape ad unit
        adShape = 'landscape';
        if (VungleAd.adSizes[arrayCount]) {
            computedSize = VungleAd.adSizes[arrayCount];
            adSizeClass = ' landscape-' + computedSize;
        } else {
            computedSize = VungleAd.adSizes[arrayCount];
            adSizeClass = ' landscape-' + computedSize + ' oob';
        }
    }

    adClassName = adShape.concat(adSizeClass);

    //Append body tag with appropriate classnames
    document.body.className = adClassName + ' ' + theme + ' ' + getOS();

    VungleAd.shape = adShape;
    VungleAd.sizeClass = computedSize;
    VungleAd.theme = theme;
    VungleAd.os = getOS();

    // @if NODE_ENV='dev' 
    /*  
        Debug mode: Displays the Vungle boilerplate classes to help you
        identify each classname if you wish to make additional stylistic changes
    */

    if (typeof debug !== 'undefined' && debug !== null) {
        if (debug) {
            var adClassDebug;
            if (adClassName.indexOf('oob') >= 0) {
                adClassDebug = '<p><span class="title">Out of Bounds</span>\
                                <span>Pixel Density: <b>'+window.devicePixelRatio+'</b></span>\
                                <span>Longest Side: <b>'+longestSide+'px</b></span>\
                                <span>Shortest Side: <b>'+shortestSide+'px</b></span>\
                                <span>Minimum Container Size: <b>'+minimumContainerSize+'px</b></span>\
                                </p>';
            } else {
                adClassDebug = '<p><span class="title">' + adClassName + '</span>\
                                <span>Pixel Density: <b>'+window.devicePixelRatio+'</b></span>\
                                <span>Longest Side: <b>'+longestSide+'px</b></span>\
                                <span>Shortest Side: <b>'+shortestSide+'px</b></span>\
                                <span>Minimum Container Size: <b>'+minimumContainerSize+'px</b></span>\
                                </p>';
            }

            if (document.getElementById("vungle-ad-debug") === null) {
                var debugElem = document.createElement("div");
                debugElem.setAttribute("id", "vungle-ad-debug");
                debugElem.className = adClassName;
                debugElem.innerHTML = adClassDebug;

                document.body.appendChild(debugElem);
            } else {
                var debugContainer = document.getElementById("vungle-ad-debug");
                debugContainer.className = adClassName;
                debugContainer.innerHTML = adClassDebug;
            }
        }
    }
    // @endif

    /* Close Button Timer */
    var closeButton = document.getElementById('vungle-close');
    if (typeof closeButtonTimer !== 'undefined' && closeButtonTimer !== null) {
        switch (closeButtonTimer) {
            case 'NOTIMER':
                revealCloseButton();
                break;

            case 'TIMER':
                setTimeout(revealCloseButton, closeRevealDelay);
                document.addEventListener('click', function() {
                    setTimeout(revealCloseButton, closeRevealInteractionDelay);
                });
                break;

            default:
                revealCloseButton();
        }
    } else {
        revealCloseButton();
    }
}

function revealCloseButton() {
    document.getElementById('vungle-close').className = '';
}

function callSDK(event) {
    return actionClicked(event);
}