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
import { default as ChildInstructions } from './vungle-ad-child-instructions.js';
import { default as EndcardOnlyAttribution } from './vungle-ad-endcard-only-attribution.js';
import { default as SDKHelper } from './vungle-ad-sdk-helper.js';

var adcore = {
    init: function(onEndcardStart) {

        MRAIDHelper.checkMRAIDStatus().then(() => {
            this.controller(onEndcardStart);
        });

        window.addEventListener('vungle-pause', AdHelper.pauseMedia);
        window.addEventListener('vungle-resume', AdHelper.resumeMedia);

    },
    controller: function(onEndcardStart) {

        var vungleAdContainer = document.getElementById('dynamic');
        var vungleAd = document.getElementById('vungle-ad');
        var fullscreenVideoElem = document.getElementById('fullscreen-video');
        var endcardView = document.getElementById('endcard-view');
        var videoMuteButton = document.getElementById('video-mute');
        var videoCTAButton = document.getElementById('video-cta');
        window.vungleMRAID = MRAIDHelper;

        //check for either vungle or standard MRAID
        vungleMRAID.checkMRAIDStatus();

        var achievedReward, isStoreViewPrepared, mraidVersion, successfulViewTimeout, videoCloseButtonTimeout;
        var blockCtaEvent = false;
        var ctaAlreadyClicked = false;
        var dynamicElement = null;
        var placementType = null; //["fullscreen", "Unknown", "flexview", "flexfeed", "mrec"]
        var creativeViewType = null;
        var storeViewTypes = ["unknown", "fullscreen"];
        var gdprConsentRequired = false;

        var delaySeconds = 0;
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

        AdPrivacy.init(VungleAd.tokens.VUNGLE_PRIVACY_URL, VungleAd.tokens.VUNGLE_PRIVACY_LOGO);

        document.getElementById('ad-notification-modal-title-text').innerHTML = VungleAd.tokens.INCENTIVIZED_TITLE_TEXT;
        document.getElementById('ad-notification-modal-body-text').innerHTML = VungleAd.tokens.INCENTIVIZED_BODY_TEXT;
        document.getElementById('ad-notification-modal-continue').innerHTML = VungleAd.tokens.INCENTIVIZED_CONTINUE_TEXT;
        document.getElementById('ad-notification-modal-close').innerHTML = VungleAd.tokens.INCENTIVIZED_CLOSE_TEXT;

        document.ontouchmove = function(event) {
            event.preventDefault();
        };

        document.body.className = AdHelper.deviceOS();

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
                videoCloseButtonDelay = VungleAd.tokens.INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS;
            } else {
                videoCloseButtonDelay = VungleAd.tokens.CLOSE_BUTTON_DELAY_SECONDS;
            }
            if (videoCloseButtonDelay === '9999' || videoCloseButtonDelay > AdHelper.getVideoDuration()) {
                videoCloseButtonDelay = AdHelper.getVideoDuration()+0.5;
            }
            revealVideoCloseButton(parseFloat(videoCloseButtonDelay));
        }

        function endcardCloseButtonTimer() {
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

            AdVideoPlayer.initVideo(VungleAd.tokens.MAIN_VIDEO, VungleAd.tokens.START_MUTED, VungleAd.tokens.VIDEO_PROGRESS_BAR);
            fullscreenVideoElem.addEventListener('ended', onVideoPlayComplete, false);
        }

        function onVideoPlayComplete() {
            var videoCloseBtnContainer = document.getElementById('vungle-fullscreen-video-close-icon-container');
            //Trigger TPAT event for video close
            window.vungle.mraidBridgeExt.notifyTPAT("video.close");
            window.vungle.mraidBridgeExt.notifyEventValuePairEvent("video.close", 1);

            AdVideoPlayer.hideVideoView();
            AdVideoPlayer.endVideoAttributionListeners();
            AdClose.hideCloseButtonTimer(videoCloseBtnContainer);
            clearTimeout(videoCloseButtonTimeout);
            renderAdIFrame();
        }

        function renderAdIFrame() {
            endcardView.innerHTML = '<iframe id="ad-content" src="ad.html" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"></iframe>';
            EventController.sendEvent('vungle-ad-iframe-reload');

            AdHelper.removeClass(document.getElementById('endcard-view'), 'inactive');
            AdHelper.addClass(endcardView, 'active');

            AdHelper.addClass(videoMuteButton, 'hide');

            AdHelper.addClass(videoCTAButton, 'hide');

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

            //Initialise post messenger, then prepare and send iFrame creative an init event containing useful attributes about the ad
            var messageObject = {
                tokens: VungleAd.tokens,
                closeDelay: delaySeconds,
                rewardedAd: VungleAd.isAdIncentivised()
            };

            PostMessenger.init();
            PostMessenger.sendMessage('ad-event-init', messageObject);
        }

        function onAdViewableChange() {
            // Pause and Resume
            var isViewable = MRAIDHelper.isViewable();
            EventController.sendEvent('vungle-ad-viewable-change', isViewable)
            if (isViewable && AdHelper.checkPauseResumeOverlays()) {
                //check if fullscreen video is present
                if (AdVideoPlayer.isVideoPlayerVisible()) {
                    AdVideoPlayer.playVideo();
                }
                EventController.sendEvent('vungle-resume');
            } else {
                AdVideoPlayer.pauseVideo();
                EventController.sendEvent('vungle-pause');
            }

            if (creativeViewType === "endcard") {
                if (isViewable && AdHelper.checkPauseResumeOverlays()) {
                    EndcardOnlyAttribution.resumeTimer();
                } else {
                    EndcardOnlyAttribution.pauseTimer();
                }
            }
        }

        function endcardOnlyVideoAttribution() {
            //Used to ensure endcard only (short-form) creatives are served successfully
            EndcardOnlyAttribution.startTimer();
        }

        function revealAdNotificationModal() {
            var adModal = document.getElementById('ad-notification-modal');
            var adModalContinue = document.getElementById('ad-notification-modal-continue');
            var adModalClose = document.getElementById('ad-notification-modal-close');
            var privacyIcon = document.getElementById('privacy-icon');
            var videoCloseBtnContainer = document.getElementById('vungle-fullscreen-video-close-icon-container');
            var closeBtnContainer = document.getElementById('vungle-endcard-close-icon-container');

            AdHelper.removeClass(adModal, 'hide');
            AdHelper.addClass(adModal, 'show');

            if (creativeViewType === "video_and_endcard") {
                AdClose.hideCloseButtonTimer(videoCloseBtnContainer);
                AdVideoPlayer.pauseVideo();
            } else {
                AdClose.hideCloseButtonTimer(closeBtnContainer);
                EndcardOnlyAttribution.pauseTimer();
            }
            hidePrivacyButton();

            adModalContinue.onclick = function() {
                AdHelper.addClass(adModal, 'hide');
                AdHelper.removeClass(adModal, 'show');
                if (creativeViewType === "video_and_endcard") {
                    AdClose.showCloseButtonTimer(videoCloseBtnContainer);
                    AdVideoPlayer.playVideo();
                } else {
                    AdClose.showCloseButtonTimer(closeBtnContainer);
                    AdHelper.removeClass(privacyIcon, 'hide');
                    EndcardOnlyAttribution.resumeTimer();
                }
                revealPrivacyButton();
            }

            adModalClose.onclick = function() {
                if (creativeViewType === "video_and_endcard") {
                    AdHelper.addClass(adModal, 'hide');
                    AdHelper.removeClass(adModal, 'show');
                    revealPrivacyButton();
                    onVideoPlayComplete();
                } else {
                    EndcardOnlyAttribution.clearTimer();
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
            AdHelper.addClass(gdprView, 'show');

            for(var i=0; i<gdprBtns.length; i++) {
                gdprBtns[i].addEventListener('click', function() {
                    this.id === 'gdpr-notification-consent' ? window.vungle.mraidBridgeExt.consentAction('opted_in') : window.vungle.mraidBridgeExt.consentAction('opted_out');
                    presentAd();
                    AdHelper.addClass(gdprView, 'hide');
                    AdHelper.removeClass(gdprView, 'show');
                });
            }
        }

        function revealVideoCloseButton(showVideoCloseButtonTime = 0) {
            var videoCloseBtnContainer = document.getElementById('vungle-fullscreen-video-close-icon-container');
            var showCloseButtonTimeMilliSeconds = showVideoCloseButtonTime * 1000;
            var timerCountdown = document.getElementById('vungle-video-timer-countdown');
            var endcardCloseBtnContainer = document.getElementById('vungle-endcard-close-icon-container');

            if (VungleAd.tokens.SHOW_VIDEO_CLOSE_BUTTON_COUNTDOWN === 'false' || showVideoCloseButtonTime === 0) {
                AdHelper.addClass(timerCountdown, 'hide');
            }
            AdClose.initCloseButtonTimer({
                time: showVideoCloseButtonTime,
                rewarded: VungleAd.isAdIncentivised(),
                closeBtn: videoCloseBtnContainer,
                timer: timerCountdown
            });

            var showVideoCloseButtonTimeMs = showVideoCloseButtonTime * 1000;

            videoCloseButtonTimeout = setTimeout(function() {

                EventController.sendEvent('ad-event-close-button-reveal')
                AdClose.endCloseButtonTimer(videoCloseBtnContainer);

                videoCloseBtnContainer.onclick = function() {
                    if (VungleAd.isAdIncentivised()) {
                        if (achievedReward) {
                            fullscreenVideoElem.removeEventListener('ended', onVideoPlayComplete, false);

                            onVideoPlayComplete();
                        } else {
                            revealAdNotificationModal();
                        }
                    } else {
                        fullscreenVideoElem.removeEventListener('ended', onVideoPlayComplete, false);

                        onVideoPlayComplete();
                    }
                };

            }, showVideoCloseButtonTimeMs);
        }

        function revealEndcardCloseButton(showCloseButtonTime = 0, rewardedAdDuration) {
            var closeButton = document.getElementById('vungle-endcard-close');
            var closeBtnContainer = document.getElementById('vungle-endcard-close-icon-container');
            var timerCountdown = document.getElementById('vungle-endcard-timer-countdown');
            var videoCloseBtnContainer = document.getElementById('vungle-fullscreen-video-close-icon-container');

            if (typeof rewardedAdDuration === 'undefined')
                rewardedAdDuration = showCloseButtonTime;

            var showCloseButtonTimeMilliSeconds = showCloseButtonTime * 1000;

            //if video+endcard use EC token and avoid rewarded dialogue box timer should run down to 0 and then display close button
            if (creativeViewType === "video_and_endcard") {
                if (VungleAd.tokens.SHOW_EC_CLOSE_BUTTON_COUNTDOWN === 'false' || showCloseButtonTime === 0) {
                    AdHelper.addClass(timerCountdown, 'hide');
                }

                AdClose.initCloseButtonTimer({
                    time: showCloseButtonTime,
                    rewarded: VungleAd.isAdIncentivised(),
                    closeBtn: closeBtnContainer,
                    timer: timerCountdown
                });

                setTimeout(function() {
                    EventController.sendEvent('ad-event-close-button-reveal')
                    AdClose.endCloseButtonTimer(closeBtnContainer);
                    closeButton.onclick = function() {
                        vungleMRAID.close();
                    };
                }, showCloseButtonTimeMilliSeconds);

            } else {
                var closeBtnDelay = VungleAd.isAdIncentivised() ? VungleAd.tokens.INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS : VungleAd.tokens.CLOSE_BUTTON_DELAY_SECONDS;

                if (VungleAd.tokens.SHOW_CLOSE_BUTTON_COUNTDOWN === 'false' || closeBtnDelay === '0') {
                    AdHelper.addClass(timerCountdown, 'hide');
                }

                AdClose.initCloseButtonTimer({
                    time: VungleAd.isAdIncentivised() ? rewardedAdDuration : showCloseButtonTime,
                    rewarded: VungleAd.isAdIncentivised(),
                    closeBtn: closeBtnContainer,
                    timer: timerCountdown
                });

                setTimeout(function() {
                    EventController.sendEvent('ad-event-close-button-reveal')
                    AdClose.endCloseButtonTimer(closeBtnContainer);

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
            //if CTA has not been previously clicked, send postroll.click and clickUrl TPAT events
            if (!ctaAlreadyClicked) {
                window.vungle.mraidBridgeExt.notifyTPAT("postroll.click");
                window.vungle.mraidBridgeExt.notifyTPAT("clickUrl");
                ctaAlreadyClicked = true;
            }

            //send postroll.click and download events for report_ad
            if (AdHelper.deviceOS() === "windows") {
                SDKHelper.mraidBridgeExt().notifyUserInteraction("event", "postroll.click");
                SDKHelper.mraidBridgeExt().notifyUserInteraction("event", "download");
            } else {
                SDKHelper.mraidBridgeExt().notifyEventValuePairEvent("postroll.click", 1);
                SDKHelper.mraidBridgeExt().notifyEventValuePairEvent("download", 1);
            }

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
