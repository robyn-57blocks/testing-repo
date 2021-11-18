import { default as VungleAd } from './vungle-ad.js'

const isUsingPreStoreKitOverlayAutoShowTokens = () => {
    const validTokenValues = ["adv_pref", "fsc_on", "fsc_off"];
    return !validTokenValues.includes(VungleAd.tokens.FULL_CTA_OPTION);
}


const isAutoOpenStoreKitOverlayOnVideoEnabled = () => {

    const publisherSetting = VungleAd.tokens.FULL_CTA_OPTION;
    const advertiserAutoShowSetting = VungleAd.tokens.SKOVERLAY_AUTO;

    return (publisherSetting === "adv_pref" && advertiserAutoShowSetting === "true");
}

const isFullScreenClickOnVideoEnabled = () => {

    if (isUsingPreStoreKitOverlayAutoShowTokens()) {
        return VungleAd.tokens.FULL_CTA === "true"
    }

    if (isAutoOpenStoreKitOverlayOnVideoEnabled()) {
        return false; 
    } 

    const publisherSetting = VungleAd.tokens.FULL_CTA_OPTION;
    const advertiserAutoShowSetting = VungleAd.tokens.SKOVERLAY_AUTO;
    const advertiserFullScreenSetting = VungleAd.tokens.FULL_CTA;

    const publisherAllowsFullScreen = publisherSetting === "adv_pref" || publisherSetting === "fsc_on"
    const advertiserAllowsFullScreen = advertiserAutoShowSetting === "true" || advertiserFullScreenSetting === "true"

    return publisherAllowsFullScreen && advertiserAllowsFullScreen
}

const isCtaOnlyOnVideoEnabled = () => {
    return !isAutoOpenStoreKitOverlayOnVideoEnabled() && !isFullScreenClickOnVideoEnabled()
}

const callOpenStoreKitOverlay = () => window.callSDK("download", "video-storekitoverlay-autoopen")
const openStoreKitOverlayInFiveSeconds = () => setTimeout(() => callOpenStoreKitOverlay(), 5000);

export {
    isAutoOpenStoreKitOverlayOnVideoEnabled,
    isFullScreenClickOnVideoEnabled,
    isCtaOnlyOnVideoEnabled,
    openStoreKitOverlayInFiveSeconds,
    isUsingPreStoreKitOverlayAutoShowTokens,
}
