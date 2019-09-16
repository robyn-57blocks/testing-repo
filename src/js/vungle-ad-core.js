/* ----- Vungle Design Framework - JS ad core initialisation ----- */

import { default as AdHelper } from './vungle-ad-helpers.js';
import { default as MRAIDHelper } from './vungle-ad-mraid-helper.js';
import { default as AdPrivacy } from './vungle-ad-privacy.js';
import { default as AdClose } from './vungle-ad-close.js';
import { default as VungleAd } from './vungle-ad.js';
import { default as AdVideoPlayer } from './vungle-ad-video-player.js';
import { default as AdVideoCTA } from './vungle-ad-video-cta.js';
import { default as EventController } from './vungle-ad-event-controller.js';
import { default as PostMessenger } from './vungle-ad-post-messenger.js';
import { default as DataStore } from './vungle-ad-post-messenger.js';
import { default as ASOIController } from './vungle-ad-asoi-controller.js';

var adcore = {
    init: function(onEndcardStart) {

        MRAIDHelper.checkMRAIDStatus().then(() => {
            this.controller(onEndcardStart);
        })

    },
    controller: function(onEndcardStart) {

        var vungleAd = document.getElementById('vungle-ad');
        var fullscreenVideoElem = document.getElementById('fullscreen-video');
        var endcardView = document.getElementById('endcard-view');
        window.vungleMRAID = MRAIDHelper;

        //check for either vungle or standard MRAID
        vungleMRAID.checkMRAIDStatus();

        var achievedReward, isStoreViewPrepared, mraidVersion, successfulViewTimeout, videoCloseButtonTimeout;
        var blockCtaEvent = false;
        var dynamicElement = null;
        var placementType = null; //["fullscreen", "Unknown", "flexview", "flexfeed", "mrec"]
        var creativeViewType = null;
        var storeViewTypes = ["unknown", "fullscreen"];
        var gdprConsentRequired = false;

        var defaultEndcardOnlyDurationSeconds = 30; //30 seconds
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

        function presentAd() {
            if (VungleAd.tokens.hasOwnProperty("CREATIVE_VIEW_TYPE")) {
                creativeViewType = VungleAd.tokens.CREATIVE_VIEW_TYPE.trim().toLowerCase();
            }

            if (typeof window.vungle.mraid.addEventListener !== 'undefined') {
                window.vungle.mraid.addEventListener('viewableChange', function() {
                    console.log(window.vungle.mraid.isViewable());
                    onAdViewableChange();
                })
            }

            switch (creativeViewType) {
                case "video_and_endcard":
                    if (onEndcardStart) {
                        //run any code defined in main.js
                        onEndcardStart();
                    }
                    renderAdFullscreenVideo();
                    break;
                case "inline_video_endcard":
                    if (onEndcardStart) {
                        //run any code defined in main.js
                        onEndcardStart();
                    }
                    break;
                case "endcard":
                    if (onEndcardStart) {
                        //run any code defined in main.js
                        onEndcardStart();
                    }
                    renderAdIFrame();
                    break;
                case undefined:
                    //default to endcard only
                    if (onEndcardStart) {
                        //run any code defined in main.js
                        onEndcardStart();
                    }
                    renderAdIFrame();
                    break;
                default:
                    //default to endcard only
                    if (onEndcardStart) {
                        //run any code defined in main.js
                        onEndcardStart();
                    }
                    renderAdIFrame();
            }
        }

        if (("getConsentRequired" in window.vungle.mraid)) {
            gdprConsentRequired = window.vungle.mraid.getConsentRequired();

            if (gdprConsentRequired) {
                revealGDPRNotificationView();
            } else {
                presentAd();
            }
        } else {
            presentAd();
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




        function videoCloseButtonTimer() {

            window.removeEventListener('vungle-fullscreen-video-ready', videoCloseButtonTimer);
            var videoCloseButtonDelay, rewardedAdDuration;

            if (VungleAd.isAdIncentivised()) {
                videoCloseButtonDelay = parseFloat(VungleAd.tokens.INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS);
                console.log('INCENTIVISED - video close icon delay:' + videoCloseButtonDelay);
            } else {
                videoCloseButtonDelay = parseFloat(VungleAd.tokens.CLOSE_BUTTON_DELAY_SECONDS);
                console.log('NON-INCENTIVISED - video close icon delay:' + videoCloseButtonDelay);
            }
            revealVideoCloseButton(videoCloseButtonDelay);
        }

        function endcardCloseButtonTimer() {
            var delaySeconds = 0;
            var rewardedAdDuration;

            rewardedAdDuration = (80 / 100) * getMaxAdDuration(); //80% of max ad duration

            //video+endcard uses ec_.... token rather than close button delay

            if (creativeViewType === "video_and_endcard") {

                if (VungleAd.tokens.hasOwnProperty("EC_CLOSE_BUTTON_DELAY_SECONDS")) {
                    delaySeconds = parseFloat(VungleAd.tokens.EC_CLOSE_BUTTON_DELAY_SECONDS);
                    console.log('VIDEO + ENDCARD - Close delay: ' + delaySeconds);
                }
                revealEndcardCloseButton(delaySeconds, rewardedAdDuration);

            } else {

                if (VungleAd.isAdIncentivised()) {
                    delaySeconds = parseFloat(VungleAd.tokens.INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS);
                    console.log('ENDCARD INCENTIVISED - Close delay: ' + delaySeconds);
                } else {
                    delaySeconds = parseFloat(VungleAd.tokens.CLOSE_BUTTON_DELAY_SECONDS);
                    console.log('ENDCARD NON-INCENTIVISED - Close delay: ' + delaySeconds);
                }

                if (delaySeconds == 0) {
                    revealEndcardCloseButton(0, rewardedAdDuration);
                    successfulViewEventTimer(rewardedAdDuration);
                    console.log('ENDCARD SUCCESSFUL VIEW - ' + rewardedAdDuration);
                } else if (delaySeconds == 9999) {
                    revealEndcardCloseButton(getMaxAdDuration());
                    successfulViewEventTimer(getMaxAdDuration());
                    console.log('ENDCARD SUCCESSFUL VIEW - ' + getMaxAdDuration());
                } else {
                    if (rewardedAdDuration >= delaySeconds) {
                        revealEndcardCloseButton(delaySeconds, rewardedAdDuration);
                    } else {
                        revealEndcardCloseButton(rewardedAdDuration, rewardedAdDuration);
                    }
                    successfulViewEventTimer(rewardedAdDuration);
                    console.log('ENDCARD SUCCESSFUL VIEW - ' + rewardedAdDuration);
                }
            }
        }

        function successfulViewEventTimer(eventTimer = 0) {

            if (creativeViewType === "video_and_endcard") {
                achievedReward = true;
                console.log('%cVIDEO TIMER SUCCESSFUL VIEW - complete', 'color: #C42207');
                window.removeEventListener('vungle-fullscreen-video-successful-view', successfulViewEventTimer);
                window.vungle.mraidBridgeExt.notifySuccessfulViewAd();

            } else {
                eventTimer = eventTimer * 1000; //convert to milliseconds

                successfulViewTimeout = setTimeout(function() {
                    achievedReward = true;
                    AdClose.endEndcardCloseButtonRewardTimer();

                    console.log('TIMER SUCCESSFUL VIEW - complete');

                    window.vungle.mraidBridgeExt.notifySuccessfulViewAd();
                    window.vungle.mraidBridgeExt.notifyEventValuePairEvent("videoViewed", 9);
                }, eventTimer);
            }
        }

        function renderAdFullscreenVideo() {
            AdVideoCTA.initCTAListener({
                showCTA: AdHelper.isValid(VungleAd.tokens.VIDEO_SHOW_CTA) ? VungleAd.tokens.VIDEO_SHOW_CTA : null,
                fullscreen: AdHelper.isValid(VungleAd.tokens.FULL_CTA) ? VungleAd.tokens.FULL_CTA : null,
                delay: AdHelper.isValid(VungleAd.tokens.DOWNLOAD_BUTTON_DELAY_SECONDS) ? VungleAd.tokens.DOWNLOAD_BUTTON_DELAY_SECONDS : 0,
            });

            window.addEventListener('vungle-fullscreen-video-ready', videoCloseButtonTimer);
            window.addEventListener('vungle-fullscreen-video-successful-view', successfulViewEventTimer);

            AdVideoPlayer.initVideo(VungleAd.tokens.MAIN_VIDEO, VungleAd.tokens.START_MUTED);
            fullscreenVideoElem.addEventListener('ended', onVideoPlayComplete, false);
        }

        function onVideoPlayComplete() {
            //Trigger TPAT event for video close
            window.vungle.mraidBridgeExt.notifyTPAT("video.close");
            window.vungle.mraidBridgeExt.notifyEventValuePairEvent("video.close", 1);

            AdVideoPlayer.hideVideoView();
            AdVideoPlayer.endVideoAttributionListeners();
            AdClose.hideVideoCloseButtonTimer();
            clearTimeout(videoCloseButtonTimeout);
            renderAdIFrame();
        }

        function renderAdIFrame() {
            document.getElementById('endcard-view').innerHTML = '<iframe id="ad-content" src="ad.html" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"></iframe>';
            EventController.sendEvent('vungle-ad-iframe-reload');
            AdHelper.removeClass(document.getElementById('endcard-view'), 'inactive');
            PostMessenger.init(); // Iframe Communication
            ASOIController.init();
            //send postroll.view TPAT event once iFrame has loaded
            window.vungle.mraidBridgeExt.notifyTPAT("postroll.view");

            switch (creativeViewType) {
                case "video_and_endcard":
                    endcardCloseButtonTimer();
                    break;
                case "inline_video_endcard":

                    break;
                case "endcard":
                    endcardCloseButtonTimer();
                    endcardOnlyVideoAttribution();
                    break;
                case undefined:
                    //default to endcard only
                    endcardCloseButtonTimer();
                    endcardOnlyVideoAttribution();
                    break;
                default:
                    //default to endcard only
                    endcardCloseButtonTimer();
                    endcardOnlyVideoAttribution();
            }
        }

        function onAdViewableChange() {
            // Pause and Resume
            var isViewable = MRAIDHelper.isViewable();
            EventController.sendEvent('vungle-ad-viewable-change', isViewable)
            if (isViewable) {
                AdVideoPlayer.playVideo()
            } else {
                AdVideoPlayer.pauseVideo()
            }
        }


        function endcardOnlyVideoAttribution() {
            //Used to ensure endcard only (short-form) creatives are served successfully
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
            var privacyIcon = document.getElementById('privacy-icon');

            AdHelper.removeClass(adModal, 'hide');

            if (creativeViewType === "video_and_endcard") {
                AdClose.hideVideoCloseButtonTimer();
                AdVideoPlayer.pauseVideo();
            } else {
                AdClose.hideEndcardCloseButtonTimer();
            }
            hidePrivacyButton();

            adModalContinue.onclick = function() {
                AdHelper.addClass(adModal, 'hide');
                if (creativeViewType === "video_and_endcard") {
                    AdClose.showVideoCloseButtonTimer();
                    AdVideoPlayer.playVideo();
                } else {
                    AdClose.showEndcardCloseButtonTimer();
                    AdHelper.removeClass(privacyIcon, 'hide');
                }
                revealPrivacyButton();
            }

            adModalClose.onclick = function() {
                if (creativeViewType === "video_and_endcard") {
                    AdHelper.addClass(adModal, 'hide');
                    revealPrivacyButton();
                    onVideoPlayComplete();
                } else {
                    vungleMRAID.close();
                }
            }
        }

        function revealGDPRNotificationView() {
            var gdprView = document.getElementById('gdpr-notification-view');
            var gdprBtns = document.querySelectorAll('#gdpr-notification-view button');

            document.getElementById('gdpr-notification-title-text').innerHTML = window.vungle.mraid.getConsentTitleText();
            document.getElementById('gdpr-notification-body-text').innerHTML = window.vungle.mraid.getConsentBodyText();
            document.getElementById('gdpr-notification-consent').innerHTML = window.vungle.mraid.getConsentAcceptButtonText();
            document.getElementById('gdpr-notification-no-consent').innerHTML = window.vungle.mraid.getConsentDenyButtonText();

            AdHelper.removeClass(gdprView, 'hide');

            for(var i=0; i<gdprBtns.length; i++) {
              gdprBtns[i].addEventListener('click', function() {
                  this.id === 'gdpr-notification-consent' ? window.vungle.mraidBridgeExt.consentAction('opted_in') : window.vungle.mraidBridgeExt.consentAction('opted_out');
                  presentAd();
                  AdHelper.addClass(gdprView, 'hide');
              });
            }
        }

        function revealVideoCloseButton(showVideoCloseButtonTime = 0) {
            console.log('VIDEO TIMER CLOSE ICON - begin');
            var closeButton = document.getElementById('vungle-fullscreen-video-close-icon-container');

            AdClose.initVideoCloseButtonTimer();

            var showVideoCloseButtonTimeMs = showVideoCloseButtonTime * 1000;

            videoCloseButtonTimeout = setTimeout(function() {
                console.log('VIDEO TIMER CLOSE ICON - complete');
                AdHelper.addClass(closeButton, 'end');

                closeButton.onclick = function() {
                    if (VungleAd.isAdIncentivised()) {
                        console.log('VIDEO TIMER CLOSE ICON - incentivised');
                        if (achievedReward) {
                            fullscreenVideoElem.removeEventListener('ended', onVideoPlayComplete, false);

                            onVideoPlayComplete();
                        } else {
                            revealAdNotificationModal();
                        }
                    } else {
                        console.log('VIDEO TIMER CLOSE ICON - non-incentivised');
                        fullscreenVideoElem.removeEventListener('ended', onVideoPlayComplete, false);

                        onVideoPlayComplete();
                    }
                };

            }, showVideoCloseButtonTimeMs);
        }

        function revealEndcardCloseButton(showCloseButtonTime = 0, rewardedAdDuration) {
            console.log('TIMER CLOSE ICON - begin');
            var closeButton = document.getElementById('vungle-endcard-close');

            if (typeof rewardedAdDuration === 'undefined')
                rewardedAdDuration = showCloseButtonTime;

            var showCloseButtonTimeMilliSeconds = showCloseButtonTime * 1000;

            //if video+endcard use EC token and avoid rewarded dialogue box timer should run down to 0 and then display close button

            if (creativeViewType === "video_and_endcard") {

                AdClose.initEndcardCloseButtonTimer({
                    time: showCloseButtonTime,
                    rewarded: false
                });

                setTimeout(function() {
                    AdClose.endEndcardCloseButtonTimer();
                    closeButton.onclick = function() {
                        vungleMRAID.close();
                        console.log(close);
                    };
                }, showCloseButtonTimeMilliSeconds);

            } else {

                AdClose.initEndcardCloseButtonTimer({
                    time: VungleAd.isAdIncentivised() ? rewardedAdDuration : showCloseButtonTime,
                    rewarded: VungleAd.isAdIncentivised()
                });

                setTimeout(function() {
                    AdClose.endEndcardCloseButtonTimer();
                    // AdClose.endEndcardCloseButtonTimer(VungleAd.isAdIncentivised(),rewardedAdDuration === null, showCloseButtonTimeMilliSeconds === 0);

                    closeButton.onclick = function() {
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
        }

        function revealPrivacyButton() {
            var privacyIcon = document.getElementById('privacy-icon');
            AdHelper.removeClass(privacyIcon, 'hide');
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
