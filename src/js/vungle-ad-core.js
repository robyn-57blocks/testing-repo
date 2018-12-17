/* ----- Vungle Design Framework - JS ad core initialisation ----- */

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as MRAIDHelper } from './vungle-ad-mraid-helper.js';
import { default as AdPrivacy } from './vungle-ad-privacy.js';

var adcore = {
    init: async function(onEndcardStart) {

        await MRAIDHelper.checkMRAIDStatus();
        this.controller(onEndcardStart);

    },
    controller: function(onEndcardStart) {

        var vungleAd = document.getElementById('vungle-ad');
        window.vungleMRAID = MRAIDHelper;

        //check for either vungle or standard MRAID
        vungleMRAID.checkMRAIDStatus();

        var achievedReward;
        var gdprConsentRequired = false;
        var maxAdDuration = 45; //this will be a token value in the future

        var VungleAd = {};
        var minimumPercentageContainerSize = 45;

        VungleAd.adSizes = ['xs', 's', 'm', 'l', 'xl'];

        // @if NODE_ENV='prod' 
        VungleAd.tokens = window.vungle.mraidBridgeExt.getReplacementTokens();
        var isAdIncentivised = window.vungle.mraidExt.getIncentivized();
        // @endif

        // @if NODE_ENV='dev' 
        VungleAd.tokens = JSON.parse("{\"PRIVACY_BODY_TEXT\":\"Vungle, Inc. understands the importance of privacy. Vungle operates a mobile ad network (the 'Ad Network' or the 'Services') through which Vungle displays targeted, contextual ads.\",\"MAIN_VIDEO\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/E2B84F77F71188171435856769024_34f9e557a05.1.5.12373212277748154277.mp4\",\"CTA_BUTTON_URL\":\"https://www.microsoft.com/en-us/p/bingo-blitz-free-bingo-slots/9nblggh42r8p\",\"INCENTIVIZED_CLOSE_TEXT\":\"Close\",\"CTA_BUTTON_TEXT\":\"Download\",\"APP_ICON\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/1530006649347-amz-icon.jpg\",\"ACTION_TRACKING\":\"false\",\"VUNGLE_PRIVACY_URL\":\"https://vungle.com/privacy/\",\"APP_RATING\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/4-stars.svg\",\"PRIVACY_CLOSE_TEXT\":\"Read Vungle's Privacy Policy\",\"FONT_URL\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/cJZKeOuBrn4kERxqtaUH3SZ2oysoEQEeKwjgmXLRnTc.ttf\",\"CTA_BUTTON_BORDER\":\"transparent\",\"CTA_BUTTON_BACKGROUND\":\"#01b27a\",\"APP_NAME\":\"BINGO Blitz - Free Bingo + Slots\",\"CTA_BUTTON_TEXT_COLOR\":\"#fff\",\"PRIVACY_CONTINUE_TEXT\":\"Close\",\"INCENTIVIZED_BODY_TEXT\":\"Are you sure you want to skip this ad? You must finish watching to claim your reward.\",\"START_MUTED\":\"false\",\"APP_DESCRIPTION\":\"Playtika Holdings Corp\",\"POWERED_BY_VUNGLE\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/vungle.svg\",\"CREATIVE_VIEW_TYPE\":\"endcard\",\"INCENTIVIZED_CONTINUE_TEXT\":\"Continue\",\"VIDEO_PROGRESS_BAR\":\"true\",\"INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS\":\"3\",\"CLOSE_BUTTON_DELAY_SECONDS\":\"5\",\"INCENTIVIZED_TITLE_TEXT\":\"Close this ad?\"}");
        window.vungle = {   mraidExt:{  getIncentivized:function(){return true;},
                                        useCustomPrivacy:function(){return true;}}, 
                            mraidBridgeExt:{notifyTPAT:function(){return true;},
                                            notifyEventValuePairEvent:function(){return true;},
                                            consentAction:function(){return true}}, 
                            mraid:{ getConsentRequired:function(){return false;},
                                    getConsentTitleText:function(){return "Ad-Interaction Data Collection";}, 
                                    getConsentBodyText:function(){return "With permission, Vungle collects your ad-interaction data to serve relevant ads to you. Note: you’ll see ads independent of your selection, but they may not be as relevant. Do you consent to data tracking for more relevant ads?";}, 
                                    getConsentAcceptButtonText:function(){return "I consent";}, 
                                    getConsentDenyButtonText:function(){return "I do not consent";}}};

        var isAdIncentivised = window.vungle.mraidExt.getIncentivized();
        // @endif

        // overide tokens where applicable
        if (window.vungleSettings) {

            for (var key in window.vungleSettings) {
                if (window.vungleSettings.hasOwnProperty(key)) {

                    tokens[key] = window.vungleSettings[key];
                }
            }
        }

        window.callSDK = function(event) {
            if (!(window.vungle && window.vungle.mraidBridgeExt)) {
                // console log successful SDK call in dev mode
                console.log('%c Vungle SDK action ' + event, 'color: #008800');
                return;
            }

            // remove iframe to stop all sound
            if (document.getElementById('ad-content')) {
                document.getElementById('ad-content').remove();
            }

            ctaButtonClicked();

            // return actionClicked(event);
        };

        //attach CTA click on all elements with class mraid-cta
        var ctaElements = document.querySelectorAll('.mraid-cta');
        for (var i = 0; i < ctaElements.length; i++) {
            ctaElements[i].addEventListener('click', ctaButtonClicked, false);
        }

        var theme;

        // if (tokens) {
        //     theme = tokens.theme;
        // } else {
        //     console.error('No tokens supplied');
        // }

        // default privacy to true if not set
        // if (tokens && typeof tokens.privacy === 'undefined') {
        //     tokens.privacy = true;
        // }

        // init privacy if token says to do so
        // if (tokens && tokens.privacy === true) {
        //     AdPrivacy.init();
        // }

        //-------

        document.getElementById('ad-notification-modal-title-text').innerHTML = VungleAd.tokens.INCENTIVIZED_TITLE_TEXT;
        document.getElementById('ad-notification-modal-body-text').innerHTML = VungleAd.tokens.INCENTIVIZED_BODY_TEXT;
        document.getElementById('ad-notification-modal-continue').innerHTML = VungleAd.tokens.INCENTIVIZED_CONTINUE_TEXT;
        document.getElementById('ad-notification-modal-close').innerHTML = VungleAd.tokens.INCENTIVIZED_CLOSE_TEXT;

        document.ontouchmove = function(event) {
            event.preventDefault();
        };

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

        //Called when Ad loads
        renderVungleAdSizingClass();

        var fullscreenVideoElement = document.getElementById('vungle-fullscreen-video');

        switch (VungleAd.tokens.CREATIVE_VIEW_TYPE) {
            case "video_and_endcard":
                fullscreenVideoElement.src = tokens.video;
                fullscreenVideoElement.addEventListener('ended', function() {
                    fullscreenVideoElement.className = 'hide';
                    if (onEndcardStart) {
                        //run any code defined in main.js
                        onEndcardStart();
                    }
                });
                break;
            case "inline_video_endcard":
                fullscreenVideoElement.src = tokens.video;
                if (typeof fullscreenVideoElement.loop == 'boolean') { // loop supported
                    fullscreenVideoElement.loop = true;
                } else { // loop property not supported
                    fullscreenVideoElement.addEventListener('ended', function() {
                        this.currentTime = 0;
                        this.play();
                    }, false);
                }
                if (onEndcardStart) {
                    //run any code defined in main.js
                    onEndcardStart();
                }
                break;
            case "Endcard":
                if (onEndcardStart) {
                    //run any code defined in main.js
                    onEndcardStart();
                }
                fullscreenVideoElement.className = 'hide';
                break;
        }

        if (("getConsentRequired" in window.vungle.mraid)) {
            gdprConsentRequired = window.vungle.mraid.getConsentRequired();

            if (gdprConsentRequired) {
                revealGDPRNotificationView();
            } else {
                renderAdIFrame();
            }
        } else {
            renderAdIFrame();
        }

        function closeButtonTimer() {
            var closeButton = document.getElementById('vungle-close');
            var delaySeconds, incentivisedDelaySeconds;

            //if ad is incentivised/rewarded, show different close button delay token timer vs non-incentivised/non-rewarded
            if (isAdIncentivised) {
                delaySeconds = parseFloat(VungleAd.tokens.INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS);
                incentivisedDelaySeconds = (80 / 100) * maxAdDuration; //80% of max ad duration
                console.log('INCENTIVIZED - delay seconds: ' + delaySeconds);
                console.log('INCENTIVIZED - 80% max ad duration: ' + incentivisedDelaySeconds);

                //ENDCARD ONLY TEMPLATE
                if (delaySeconds == 0) {
                    revealCloseButton(0, incentivisedDelaySeconds);
                } else if (delaySeconds == 9999) {
                    revealCloseButton(maxAdDuration, maxAdDuration);
                } else {
                    revealCloseButton(delaySeconds, incentivisedDelaySeconds);
                }

                //INLINE VIDEO TEMPLATE

                //FULL SCREEN VIDEO TEMPLATE

            } else {
                delaySeconds = parseFloat(VungleAd.tokens.CLOSE_BUTTON_DELAY_SECONDS);
                console.log('NOT INCENTIVIZED - delay seconds: ' + delaySeconds);
                console.log('NOT INCENTIVIZED - max ad duration: ' + maxAdDuration);

                //ENDCARD ONLY TEMPLATE
                if (delaySeconds == 0) {
                    revealCloseButton(0, 0);
                } else if (delaySeconds == 9999) {
                    revealCloseButton(maxAdDuration, 0);
                } else {
                    revealCloseButton(delaySeconds, 0);
                }

                //INLINE VIDEO TEMPLATE

                //FULL SCREEN VIDEO TEMPLATE
            }
        }

        function renderAdIFrame() {

            // @if NODE_ENV='prod' 
            document.getElementById('endcard-view').innerHTML = '<iframe id="ad-content" src="ad.html" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"></iframe>';
            // @endif

            //start close button timer once iFrame has been loaded and is visible to user
            closeButtonTimer();

            //send postroll.view TPAT event once iFrame has loaded
            window.vungle.mraidBridgeExt.notifyTPAT("postroll.view");
        }

        function renderVungleAdSizingClass() {

            var vungleAdContainer = document.getElementById('dynamic');
            var longestSide = (Math.max(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));
            var shortestSide = (Math.min(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));

            if (typeof theme === 'undefined' || theme === null) {
                theme = 'dark';
            }


            var minimumContainerSize = (minimumPercentageContainerSize / 100 * longestSide);
            var adSizeSegmentLength = (longestSide - minimumContainerSize) / VungleAd.adSizes.length;
            var arrayCount = Math.floor((shortestSide - minimumContainerSize) / adSizeSegmentLength);

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

            var adClassName = adShape.concat(adSizeClass);

            //Append body tag with appropriate classnames
            document.body.className = adClassName + ' ' + theme + ' ' + AdHelper.getOS();

            VungleAd.shape = adShape;
            VungleAd.sizeClass = computedSize;
            VungleAd.theme = theme;
            VungleAd.os = AdHelper.getOS();

            // @if NODE_ENV='dev' 
            /*  
                Debug mode: Displays the Vungle boilerplate classes to help you
                identify each classname if you wish to make additional stylistic changes
            */

            if (window.vungleDebugMode === true) {
                var adClassDebug;
                if (adClassName.indexOf('oob') >= 0) {
                    adClassDebug = '<p><span class="title">Out of Bounds</span>\
                                <span>Pixel Density: <b>' + window.devicePixelRatio + '</b></span>\
                                <span>Longest Side: <b>' + longestSide + 'px</b></span>\
                                <span>Shortest Side: <b>' + shortestSide + 'px</b></span>\
                                <span>Minimum Container Size: <b>' + minimumContainerSize + 'px</b></span>\
                                </p>';
                } else {
                    adClassDebug = '<p><span class="title">' + adClassName + '</span>\
                                <span>Pixel Density: <b>' + window.devicePixelRatio + '</b></span>\
                                <span>Longest Side: <b>' + longestSide + 'px</b></span>\
                                <span>Shortest Side: <b>' + shortestSide + 'px</b></span>\
                                <span>Minimum Container Size: <b>' + minimumContainerSize + 'px</b></span>\
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
            // @endif

        }

        function revealAdNotificationModal() {
            var adModal = document.getElementById('ad-notification-modal');
            var adModalContinue = document.getElementById('ad-notification-modal-continue');
            var adModalClose = document.getElementById('ad-notification-modal-close');
            var closeButton = document.getElementById('vungle-close');
            var privacyIcon = document.getElementById('privacy-icon');

            adModal.className = '';
            hideCloseButton();
            hidePrivacyButton();

            adModalContinue.onclick = function() {
                AdHelper.addClass(adModal, 'hide');
                AdHelper.removeClass(closeButton, 'hide');
                AdHelper.removeClass(privacyIcon, 'hide');
            }
            adModalClose.onclick = function() {
                vungleMRAID.close();
            }
        }

        function revealGDPRNotificationView() {

            var gdprView = document.getElementById('gdpr-notification-view');

            var gdprViewConsentButton = document.getElementById('gdpr-notification-consent');
            var gdprViewDoNotConsentButton = document.getElementById('gdpr-notification-no-consent');

            document.getElementById('gdpr-notification-title-text').innerHTML = window.vungle.mraid.getConsentTitleText();
            document.getElementById('gdpr-notification-body-text').innerHTML = window.vungle.mraid.getConsentBodyText();
            document.getElementById('gdpr-notification-consent').innerHTML = window.vungle.mraid.getConsentAcceptButtonText();
            document.getElementById('gdpr-notification-no-consent').innerHTML = window.vungle.mraid.getConsentDenyButtonText();

            AdHelper.removeClass(gdprView, 'hide');

            gdprViewConsentButton.onclick = function() {
                window.vungle.mraidBridgeExt.consentAction("opted_in");
                renderAdIFrame();
                AdHelper.addClass(gdprView, 'hide');
            }

            gdprViewDoNotConsentButton.onclick = function() {
                window.vungle.mraidBridgeExt.consentAction("opted_out");
                renderAdIFrame();
                AdHelper.addClass(gdprView, 'hide');
            }
        }

        function revealCloseButton(showCloseButtonTime = 0, closeButtonIncentivisedTime = 0) {
            var closeButton = document.getElementById('vungle-close');

            showCloseButtonTime = showCloseButtonTime * 1000;
            closeButtonIncentivisedTime = closeButtonIncentivisedTime * 1000;

            if (isAdIncentivised) {
                setTimeout(function() {
                    achievedReward = true;
                    console.log('NOTIFY - successful view ad');

                    window.vungle.mraidBridgeExt.notifySuccessfulViewAd();
                    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoLength", 10);
                    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", 9);

                }, closeButtonIncentivisedTime);
            }

            setTimeout(function() {
                closeButton.className = '';
                closeButton.onclick = function() {

                    var onClickTimeStamp = new Date();

                    if (isAdIncentivised) {
                        if (achievedReward) {
                            vungleMRAID.close();
                        } else {
                            revealAdNotificationModal();
                        }
                    } else {
                        vungleMRAID.close();
                    }
                };
            }, showCloseButtonTime);
        }

        function revealPrivacyButton() {
            var privacyContainer = document.getElementById('privacy-container');
            AdHelper.removeClass(privacyContainer, 'hide');
        }

        function hideCloseButton() {
            var closeButton = document.getElementById('vungle-close');
            AdHelper.addClass(closeButton, 'hide');
        }

        function hidePrivacyButton() {
            var privacyIcon = document.getElementById('privacy-icon');
            AdHelper.addClass(privacyIcon, 'hide');
        }

        function ctaButtonClicked() {
            //send postroll.click and clickUrl TPAT events when CTA is clicked for campaign level tracking,
            //and postroll.click and download events for report_ad
            window.vungle.mraidBridgeExt.notifyTPAT("postroll.click");
            window.vungle.mraidBridgeExt.notifyTPAT("clickUrl");
            window.vungle.mraidBridgeExt.notifyEventValuePairEvent("postroll.click", 1);
            window.vungle.mraidBridgeExt.notifyEventValuePairEvent("download", 1);

            vungleMRAID.open(VungleAd.tokens.CTA_BUTTON_URL);
            vungleMRAID.close();
            // MRAIDHelper.open(VungleAd.tokens.CTA_BUTTON_URL);
            // window.vungle.mraid.open('http://www.apple.com')

        }
    }
};

export default adcore;