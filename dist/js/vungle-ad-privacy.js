export default {

    init: function() {
        
        var privacyTimer, privacySubTimer;

        var prefix = ''; // stop clashes
        var privacyUrl = 'http://vungle.com/privacy/';
        var privacyDuration = 2000;
        var privacySubDuration = 1000;
        var privacySubHideDuration = 500;
        var privacyIcon = document.getElementById(prefix + 'privacy-icon');

        // add click events
        document.getElementById(prefix + 'privacy-icon').addEventListener("click", privacyExtend);
        document.getElementById(prefix + 'privacy-back-button-container').addEventListener("click", hideIframe);

        function addClass(el, className) {

            if (!(el instanceof HTMLDivElement)) {
                el = document.getElementById(el);
            }

            if (el.classList) {
                el.classList.add(className);
            } else if (!hasClass(el, className)) {
                el.className += " " + className;
            }
        }

        function hasClass(el, className) {

            if (el.classList) {
                return el.classList.contains(className);
            } else {
                return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
            }
        }

        function removeClass(el, className) {

            if (!(el instanceof HTMLDivElement)) {
                el = document.getElementById(el);
            }

            if (el.classList) {
                el.classList.remove(className);
            } else if (hasClass(el, className)) {
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
                el.className = el.className.replace(reg, ' ');
            }
        }

        function hideIframe() {

            var loadingPage = document.getElementById(prefix + 'privacy-page-loading');

            removeClass(loadingPage, 'loaded');

            document.getElementById(prefix + 'privacy-page-wrapper').style.display = "none";
            document.getElementById(prefix + 'privacy-back-button-container').style.display = "none";
        }

        function showIFrame() {

            var loadingPage = document.getElementById(prefix + 'privacy-page-loading');
            var privacyPg = document.getElementById(prefix + 'privacy-page');

            document.getElementById(prefix + 'privacy-page-wrapper').style.display = "initial";
            document.getElementById(prefix + 'privacy-back-button-container').style.display = "initial";

            removeClass(loadingPage, 'loaded');
            addClass(loadingPage, 'loading');

            privacyPg.onload = function() {
                removeClass(loadingPage, 'loading');
                addClass(loadingPage, 'loaded');
            };

            privacyPg.src = privacyUrl;
        }

        function hidePrivacyIcon() {

            removeClass(privacyIcon, 'privacy-extended');

            privacySubTimer = setTimeout(function() {
                removeClass(privacyIcon, 'privacy-reverse');
            }, privacySubHideDuration);
        }

        function privacyExtend() {

            if (hasClass(privacyIcon, 'privacy-extended')) {
                showIFrame();
                hidePrivacyIcon();
                return;
            }

            addClass(privacyIcon, 'privacy-extended');

            clearTimeout(privacyTimer);

            privacyTimer = setTimeout(function() {
                hidePrivacyIcon();
            }, privacyDuration);

            privacySubTimer = setTimeout(function() {
                addClass(privacyIcon, 'privacy-reverse');
            }, privacySubDuration);
        }
    }
};