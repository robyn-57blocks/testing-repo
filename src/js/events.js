import { default as SDKHelper } from './vungle-ad-sdk-helper.js';

export const tpats = {
  ctaClick: "download.ctaClick",
  fullScreenClick: "download.fullScreenClick",
  asoiInteraction: "download.ASOIInteraction",
  asoiComplete: "download.ASOIComplete",
  muteClick: "muteButtonClick",
  endcardClick: "playableEndcardClick",
  closeButtonClick: "closeButtonClick",
  nearCloseButtonClick: "nearCloseButtonClick",
  privacyButtonClick: "privacyButtonClick"
}

export const fireTpat = tpat => {

  const clickEnhancementTPATEvents = [
    tpats.closeButtonClick,
    tpats.nearCloseButtonClick,
    tpats.ctaClick,
    tpats.fullScreenClick,
    tpats.asoiComplete,
    tpats.asoiInteraction,
    tpats.muteClick,
    tpats.endcardClick,
    tpats.privacyButtonClick
  ];

  const os = SDKHelper.mraidExt().getOS();
  const sdkSupportsModernAndUnknownTpats = os.toLowerCase() === "ios";

  // safety check to make sure we don't accidentally break android. Andriod at time of writing crashes when sent an unexpected TPAT, and windows silently fails
  const supportedTpats = Object.values(tpats);
  const tpatIsUnknown = !supportedTpats.includes(tpat);
  const tpatIsModern = clickEnhancementTPATEvents.includes(tpat);

  if (!sdkSupportsModernAndUnknownTpats && (tpatIsModern || tpatIsUnknown)) {
    return;
  }
    window.vungle.mraidBridgeExt.notifyTPAT(tpat);
}
