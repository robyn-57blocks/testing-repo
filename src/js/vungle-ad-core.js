/* ----- Vungle Design Framework - JS ad core initialisation ----- */

var closeRevealDelay = 4000;
var closeRevealInteractionDelay = 1000;

var vungleAd = document.getElementById('vungle-ad');

window.addEventListener('load', function() {
	initVungleAd();
});

document.ontouchmove = function(event) {
    event.preventDefault();
}

var vungleAdSizes = ['xl', 'l', 'm', 's', 'xs'];

function initVungleAd() {

    var vungleAdContainer = document.getElementById('vungle-ad-container');

    var longestSide = (Math.max(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));
    var shortestSide = (Math.min(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));

    /*
        The original innerWidth/Height potentially breaks ad when viewed on the latest Chrome,
        so we have gone ahead and used offsetWidth/Height within the body tag CSS
        
        var longestSide = (Math.max(window.innerHeight, window.innerWidth));
        var shortestSide = (Math.min(window.innerHeight, window.innerWidth));
    */

    if (typeof theme === 'undefined' || theme === null) {
        theme = 'dark';
    }
    // @ifdef NODE_ENV='dev' 
    if (typeof debug === 'undefined' || debug === null) {
        debug = false;
    }
    // @endif

    var range = ((longestSide - shortestSide) / longestSide) * 100;
    var adClassName;

    if (longestSide === shortestSide) {
        //Square ad unit
        adClassName = 'square';

    } else if (window.innerHeight > window.innerWidth) {
        //Portrait ad unit
        if (vungleAdSizes[(Math.ceil(range / 10) * 1) - 1]) {
            adClassName = 'portrait portrait-' + vungleAdSizes[(Math.ceil(range / 10) * 1) - 1];
        } else {
            adClassName = 'portrait portrait-' + vungleAdSizes[vungleAdSizes.length - 1] + ' oob';
        }

    } else {
        //Landscape ad unit
        if (vungleAdSizes[(Math.ceil(range / 10) * 1) - 1]) {
            adClassName = 'landscape landscape-' + vungleAdSizes[(Math.ceil(range / 10) * 1) - 1];
        } else {
            adClassName = 'landscape landscape-' + vungleAdSizes[vungleAdSizes.length - 1] + ' oob';
        }
    }

    //Append body tag with appropriate classnames
    document.body.className = adClassName + ' ' + theme + ' ' + getOS();

    window.addEventListener('resize', function(event) {
        vungleAd.style.opacity = 0;

        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(function() {
            initVungleAd();
            vungleAd.style.opacity = 1;
        }, 200);
    });

    // @ifdef NODE_ENV='dev' 
    /*  
        Debug mode: Displays the Vungle boilerplate classes to help you
        identify each classname if you wish to make additional stylistic changes
    */
    if (typeof debug !== 'undefined' || debug !== null) {
        if (debug) {
            var adClassDebug;
            if (adClassName.indexOf('oob') >= 0) {
                adClassDebug = '<span>Out of Bounds</span>';
            } else {
                adClassDebug = '<span>' + adClassName + '</span>';
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

    /* close button timer implementation */

    var close = document.getElementById('vungle-close');

    switch (VUNGLE_TIMER) {
        case 'NOTIMER':

            revealCloseButton();
            break;
        case 'TIMER':

            setTimeout(revealCloseButton, closeRevealDelay);

            document.addEventListener('click', function() {
                setTimeout(revealCloseButton, closeRevealInteractionDelay);
            });
            break;
    }
}

function revealCloseButton() {
    document.getElementById('vungle-close').className = '';
}

function callSDK(event) {
    return actionClicked(event);
}