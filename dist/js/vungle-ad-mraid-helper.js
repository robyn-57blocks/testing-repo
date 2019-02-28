export default {
        getAdState: getAdState,
        getCurrentPosition: getCurrentPosition,
        getDefaultPosition: getDefaultPosition,
        getExpandProperties: getExpandProperties,
        getMaxSize: getMaxSize,
        getPlacementType: getPlacementType,
        getResizeProperties: getResizeProperties,
        getScreenSize: getScreenSize,
        getState: getState,
        getVersion: getVersion,
        setExpandProperties: setExpandProperties,
        setResizeProperties: setResizeProperties,
        mraidReady: mraidReady,
        open: open,
        checkMRAIDStatus: checkMRAIDStatus,
        close: close,
        expand: expand,
        isViewable: isViewable,
        playVideo: playVideo,
        resize: resize,
        supports: supports,
        storePicture: storePicture,
        useCustomClose: useCustomClose,
        getMRAID: getMRAID
};

    window.vungle = window.vungle || {};
    var mraid = null;
    var adState = false;
    var isPublished = false;

    function getMRAID() {
        if (!mraid) {
            mraid = window.vungle.mraid ? window.vungle.mraid : window.mraid;
        }
        return mraid;
    };

    async function checkMRAIDStatus() {
        return new Promise(function(resolve, reject) {
            if (getMRAID() && getMRAID().getState() === "loading") {
                var i = 0;
                var interval = setInterval(function(){
                    if (getMRAID().getState() === "default") {
                        clearInterval(interval);
                        mraidReady();
                        resolve();
                    } else {
                        i+=10;
                    }
                }, 10);
            } else {
                mraidReady();
                resolve();
            }
        });
    };

    function mraidReady() {


        adState = true;
        // getMRAID().addEventListener("viewableChange", onAdViewableChange.bind(this));
    };

    function onAdViewableChange() {
        //Is toggled if publisher app goes into background and then resumed
        var videoElement = document.getElementsByTagName("video")[0];

        if (videoElement) {
            if (getMRAID().isViewable()) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        }

        if (getMRAID().isViewable() && !isPublished) {
            eventDispatcher.publish("event.endcardView");
            isPublished = true;
        }
    };

    function isViewable() {
        return getMRAID().isViewable();
    };

    function asyncLoadJavaScript(url, callback) {
        var scriptTag = document.createElement("script");

        scriptTag.type = "text/javascript";
        scriptTag.src = url;

        if (scriptTag.readyState) {
            scriptTag.onreadystatechange = function () {
                if (scriptTag.readyState === "loaded" || scriptTag.readyState === "completed") {
                    scriptTag.onreadystatechange = null;
                    callback && callback();
                }
            };
        }
        else {
            scriptTag.onload = function () {
                callback && callback();
            };
        }

        document.getElementsByTagName("head")[0].appendChild(scriptTag);
    };

    function getAdState() {
        return adState;
    };

    function open(url) {
        getMRAID().open(url);
    };

    function close() {
        getMRAID().close();
    };

    function getExpandProperties() {
        return getMRAID().getExpandProperties();
    };

    function getDefaultPosition() {
        return getMRAID().getDefaultPosition();
    };

    function getCurrentPosition() {
        return getMRAID().getCurrentPosition();
    };

    function getMaxSize() {
        return getMRAID().getMaxSize();
    };

    function getPlacementType() {
        return getMRAID().getPlacementType();
    };

    function getResizeProperties() {
        return getMRAID().getResizeProperties();
    };

    function getScreenSize() {
        return getMRAID().getScreenSize();
    };

    function getVersion() {
        return getMRAID().getVersion();
    };

    function playVideo() {
        return getMRAID().playVideo();
    };

    function resize() {
        return getMRAID().resize();
    };

    function setExpandProperties(properties) {
        getMRAID().setExpandProperties(properties);
    };

    function setResizeProperties(properties) {
        getMRAID().setResizeProperties(properties);
    };

    function storePicture(uri) {
        getMRAID().storePicture(uri);
    };

    function supports(feature) {
        return getMRAID().supports(feature);
    };

    function useCustomClose(flag) {
        getMRAID().useCustomClose(flag);
    };

    function createCalendarEvent() {
    //TODO: needs to implement!!!!!
    };

    function expand(url) {
        getMRAID().expand(url);
    };

    function getState() {
        getMRAID().getState();
    };