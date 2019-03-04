/* ----- Vungle Design Framework - JS ad core initialisation ----- */

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as MRAIDHelper } from './vungle-ad-mraid-helper.js';
import { default as AdPrivacy } from './vungle-ad-privacy.js';
import { default as AdClose } from './vungle-ad-close.js';
import { default as VungleAd } from './vungle-ad.js';

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

        var achievedReward, isStoreViewPrepared, mraidVersion;
        var blockCtaEvent = false;
        var dynamicElement = null;
        var placementType = null; //["fullscreen", "Unknown", "flexview", "flexfeed", "mrec"]
        var storeViewTypes = ["unknown", "fullscreen"];
        var gdprConsentRequired = false;

        var defaultEndcardOnlyDurationSeconds = 25; //25 seconds
        var minimumPercentageContainerSize = 45;

        VungleAd.init();

        var appStoreId = AdHelper.getApiIdFromUrl(VungleAd.tokens.CTA_BUTTON_URL);
        placementType = window.vungle.mraid.getPlacementType().trim().toLowerCase();

        if ("getMraidVersion" in window.vungle.mraidExt) {
            mraidVersion = window.vungle.mraidExt.getMraidVersion();
        }

        var operatingSystem = window.vungle.mraidExt.getOS().trim();

        window.callSDK = function(event) {
            if (!(window.vungle && window.vungle.mraidBridgeExt)) {
                // console log successful SDK call in dev mode
                console.log('%c Vungle SDK action ' + event, 'color: #008800');
                return;
            }

            if (!blockCtaEvent) {
                ctaButtonClicked();
            }
        };

        //attach CTA click on all elements with class mraid-cta
        var ctaElements = document.querySelectorAll('.mraid-cta');
        for (var i = 0; i < ctaElements.length; i++) {
            ctaElements[i].addEventListener('click', ctaButtonClicked, false);
        }

        AdPrivacy.init();

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

        function getDynamicElement() {
            if (!dynamicElement) {
                dynamicElement = document.querySelector("#dynamic");
            }
            return dynamicElement;
        }

        getDynamicElement().addEventListener("vungle.events.preparestore.finished", onNotifyPresentStoreViewFinished);
        getDynamicElement().addEventListener("vungle.events.preparestore.success", onNotifyPrepareStoreViewSuccess);

        function prepareStoreView() {
            window.vungle.mraidExt.prepareStoreView(appStoreId);
        }

        function onNotifyPrepareStoreViewSuccess() {
            isStoreViewPrepared = true;
        }

        function onNotifyPresentStoreViewFinished() {
            // In-app store view is supported only on iOS. We should trigger this.prepareStoreView() only for iOS.
            isStoreViewPrepared = false;
            if (operatingSystem === "ios" && storeViewTypes.indexOf(placementType) !== -1) {
                prepareStoreView();
            }
        }

        if (mraidVersion) {
            onNotifyPresentStoreViewFinished();
        }

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

        function getMaxAdDuration() {
            if (!VungleAd.tokens.hasOwnProperty("ENDCARD_ONLY_DURATION_SECONDS")) {
                //use hardcoded value
                return defaultEndcardOnlyDurationSeconds;
            } else {
                //use token value
                return parseFloat(VungleAd.tokens.ENDCARD_ONLY_DURATION_SECONDS);
            }
        }

        function closeButtonTimer() {
            // var closeButton = document.getElementById('vungle-close');
            var delaySeconds, rewardedAdDuration;

            rewardedAdDuration = (80 / 100) * getMaxAdDuration(); //80% of max ad duration

            if (VungleAd.isAdIncentivised()) {
                delaySeconds = parseFloat(VungleAd.tokens.INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS);
                console.log('INCENTIVISED - close icon delay:' + delaySeconds);
            } else {
                delaySeconds = parseFloat(VungleAd.tokens.CLOSE_BUTTON_DELAY_SECONDS);
                console.log('NON-INCENTIVISED - close icon delay:' + delaySeconds);
            }

            delaySeconds = 3;

            //ENDCARD ONLY TEMPLATE
            if (delaySeconds == 0) {
                revealCloseButton(0,rewardedAdDuration);
                successfulViewEventTimer(rewardedAdDuration);
                console.log('SUCCESSFUL VIEW - ' + rewardedAdDuration);
            } else if (delaySeconds == 9999) {
                revealCloseButton(getMaxAdDuration());
                successfulViewEventTimer(getMaxAdDuration());
                console.log('SUCCESSFUL VIEW - ' + getMaxAdDuration());
            } else {
                revealCloseButton(delaySeconds,rewardedAdDuration);
                successfulViewEventTimer(rewardedAdDuration);
                console.log('SUCCESSFUL VIEW - ' + rewardedAdDuration);
            }

            //INLINE VIDEO TEMPLATE
            
            //FULL SCREEN VIDEO TEMPLATE    
        }

        function successfulViewEventTimer(eventTimer) {
            console.log('TIMER SUCCESSFUL VIEW - begin');
            eventTimer = eventTimer * 1000; //convert to milliseconds

            setTimeout(function() {
                achievedReward = true;
                AdClose.endRewardTimer();

                console.log('TIMER SUCCESSFUL VIEW - complete');

                window.vungle.mraidBridgeExt.notifySuccessfulViewAd();
                window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", 9);
            }, eventTimer);
        }

        function renderAdIFrame() {
            document.getElementById('endcard-view').innerHTML = '<iframe id="ad-content" src="ad.html" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"></iframe>';

            //start close button timer once iFrame has been loaded and is visible to user
            closeButtonTimer();

            //send postroll.view TPAT event once iFrame has loaded
            window.vungle.mraidBridgeExt.notifyTPAT("postroll.view");

            //ENDCARD ONLY TEMPLATE
            window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoLength", 10);
            window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", 0);
            window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", 1);
        }

        function renderVungleAdSizingClass() {

            var vungleAdContainer = document.getElementById('dynamic');
            var longestSide = (Math.max(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));
            var shortestSide = (Math.min(vungleAdContainer.offsetHeight, vungleAdContainer.offsetWidth));

            var theme;
            if (typeof theme === 'undefined' || theme === null) {
                theme = 'light';
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

        function revealCloseButton(showCloseButtonTime = 0, rewardedAdDuration) {
            console.log('TIMER CLOSE ICON - begin');
            var closeButton = document.getElementById('vungle-close');

            if(typeof rewardedAdDuration === 'undefined')
                rewardedAdDuration = showCloseButtonTime;

            AdClose.initTimer({
                time: VungleAd.isAdIncentivised() ? rewardedAdDuration : showCloseButtonTime,
                rewarded: VungleAd.isAdIncentivised()
            })

            var showCloseButtonTimeMilliSeconds = showCloseButtonTime * 1000;


            setTimeout(function() {
                console.log('TIMER CLOSE ICON - complete');
                closeButton.className = '';

                AdClose.endCloseTimer(VungleAd.isAdIncentivised());

                closeButton.onclick = function() {

                    var onClickTimeStamp = new Date();

                    if (VungleAd.isAdIncentivised()) {
                        console.log('TIMER CLOSE ICON - incentivised');
                        if (achievedReward) {
                            vungleMRAID.close();
                        } else {
                            revealAdNotificationModal();
                        }
                    } else {
                        console.log('TIMER CLOSE ICON - non-incentivised');
                        vungleMRAID.close();
                    }
                };
            }, showCloseButtonTimeMilliSeconds);
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

            // 6.3.2 Hack - IOS-2140
            if (!mraidVersion && operatingSystem === "ios" && appStoreId && isStoreViewPrepared) {
                //Block future CTA events on 6.3.2 to avoid StoreKit bug
                blockCtaEvent = true;
            }

            if (operatingSystem === "ios" && appStoreId && isStoreViewPrepared) {
                window.vungle.mraidExt.presentStoreView(appStoreId);
            } else {
                vungleMRAID.open(VungleAd.tokens.CTA_BUTTON_URL);
            }
        }
    }
};

export default adcore;