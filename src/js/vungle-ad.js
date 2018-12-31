/* ----- Vungle Design Framework - Ad ----- */

export default {

    init: function() {
        var VungleAd = {};

        this.adSizes = ['xs', 's', 'm', 'l', 'xl'];

        // @if NODE_ENV='prod' 
        this.tokens = window.vungle.mraidBridgeExt.getReplacementTokens();
        // @endif

        // @if NODE_ENV='dev' 
        this.tokens = JSON.parse("{\"PRIVACY_BODY_TEXT\":\"Vungle, Inc. understands the importance of privacy. Vungle operates a mobile ad network (the 'Ad Network' or the 'Services') through which Vungle displays targeted, contextual ads.\",\"MAIN_VIDEO\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/E2B84F77F71188171435856769024_34f9e557a05.1.5.12373212277748154277.mp4\",\"CTA_BUTTON_URL\":\"https://www.microsoft.com/en-us/p/bingo-blitz-free-bingo-slots/9nblggh42r8p\",\"INCENTIVIZED_CLOSE_TEXT\":\"Close\",\"CTA_BUTTON_TEXT\":\"Download\",\"APP_ICON\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/1530006649347-amz-icon.jpg\",\"ACTION_TRACKING\":\"false\",\"VUNGLE_PRIVACY_URL\":\"https://vungle.com/privacy/\",\"APP_RATING\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/4-stars.svg\",\"PRIVACY_CLOSE_TEXT\":\"Read Vungle's Privacy Policy\",\"FONT_URL\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/cJZKeOuBrn4kERxqtaUH3SZ2oysoEQEeKwjgmXLRnTc.ttf\",\"CTA_BUTTON_BORDER\":\"transparent\",\"CTA_BUTTON_BACKGROUND\":\"#01b27a\",\"APP_NAME\":\"BINGO Blitz - Free Bingo + Slots\",\"CTA_BUTTON_TEXT_COLOR\":\"#fff\",\"PRIVACY_CONTINUE_TEXT\":\"Close\",\"INCENTIVIZED_BODY_TEXT\":\"Are you sure you want to skip this ad? You must finish watching to claim your reward.\",\"START_MUTED\":\"false\",\"APP_DESCRIPTION\":\"Playtika Holdings Corp\",\"POWERED_BY_VUNGLE\":\"/var/mobile/Containers/Data/Application/9C037305-5FBF-46BE-BCD5-31F0BC7B1F21/Library/Caches/com.vungle.ads/91904af6c89397f7822d169463c283b45bd6ee03/vungle.svg\",\"CREATIVE_VIEW_TYPE\":\"endcard\",\"INCENTIVIZED_CONTINUE_TEXT\":\"Continue\",\"VIDEO_PROGRESS_BAR\":\"true\",\"INCENTIVIZED_CLOSE_BUTTON_DELAY_SECONDS\":\"3\",\"CLOSE_BUTTON_DELAY_SECONDS\":\"5\",\"INCENTIVIZED_TITLE_TEXT\":\"Close this ad?\"}");
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

        // @endif
    },

    isAdIncentivised: function() {
        return window.vungle.mraidExt.getIncentivized();
    }
};