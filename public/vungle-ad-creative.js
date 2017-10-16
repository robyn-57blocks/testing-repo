/* ----- Vungle Design Framework - JS ad specific methods ----- */

var vungleAd = document.getElementById('vungle-ad');
var videoContainer = document.getElementById('video-container');
var videoHolder = document.getElementById('video-holder');
var vungleVideo = document.getElementById('vungle-video');
var appInfoContainer = document.getElementById('app-info-container');
var carouselContainer = document.getElementById('carousel-container');
var cardContent = document.getElementById('card-content');
var vungleCta = document.getElementById('app-info-container-cta');
var vungleFooter = document.getElementById('vungle-footer');
var mainCard = document.getElementById('main-card');
var starRating = document.getElementById('star-rating');

var appTitleElements = document.getElementsByClassName('app-title');
var verticalAlignElements = document.getElementsByClassName('vertical-align');

vungleVideo.addEventListener('loadedmetadata', function(e){
	vungleVideo = vungleVideoType(vungleVideo.videoWidth, vungleVideo.videoHeight);
	addClass(videoContainer, vungleVideo.classname);
	resizeContainers();
	resizeVideo(videoContainer, videoHolder, videoContainer);
});

function resizeContainers() {

	videoContainer.style.height = '';
	videoContainer.style.width = '';
	appInfoContainer.style.height = '';
	appInfoContainer.style.width = '';
	carouselContainer.style.height = '';
	starRating.style.display = '';
	
	resizeVideo(videoContainer, videoHolder, videoContainer);
	
	addClass(vungleVideo, 'corner-radius');
	
	if (hasClass(document.body, 'portrait') || hasClass(document.body, 'square')) {
		//PORTRAIT
		if (videoHolder.offsetHeight >= videoContainer.offsetHeight) {
			videoContainer.style.height = '';
		} else {
			videoContainer.style.height = videoHolder.offsetHeight+'px';
			removeClass(vungleVideo, 'corner-radius');
		}

		appInfoContainer.style.height = (window.innerHeight-videoContainer.offsetHeight-vungleFooter.offsetHeight)+"px";
		appInfoContainer.style.marginBottom = vungleFooter.offsetHeight+"px";

	} else {
		//LANDSCAPE		
		if (videoHolder.offsetWidth >= videoContainer.offsetWidth) {
			videoContainer.style.width = '';
			removeClass(vungleVideo, 'corner-radius');
		} else {
			videoContainer.style.width = videoHolder.offsetWidth+'px';
			
		}
		appInfoContainer.style.width = (window.innerWidth-videoContainer.offsetWidth)+"px";
		appInfoContainer.style.marginBottom = vungleFooter.offsetHeight+"px";
		appInfoContainer.style.height = (window.innerHeight-vungleFooter.offsetHeight)+"px";
	}
	
	carouselContainer.style.height = (appInfoContainer.offsetHeight-vungleCta.offsetHeight)+'px';
	vungleFooter.style.width = appInfoContainer.offsetWidth+'px';
	
	var cardContentStyle = getComputedStyle(cardContent);
	cardContentHeight = cardContent.clientHeight;
	cardContentHeight -= parseFloat(cardContentStyle.paddingTop) + parseFloat(cardContentStyle.paddingBottom);
	
	if (cardContentHeight < mainCard.clientHeight) {
		starRating.style.display = 'none';
	}
	
	if (verticalAlignElements) {
		for (var i = 0; i < verticalAlignElements.length; i++) {
			var padding = parseFloat(getComputedStyle(verticalAlignElements[i].parentElement).paddingTop);
			
			if (verticalAlignElements[i].scrollHeight <= verticalAlignElements[i].parentElement.offsetHeight) {
				verticalAlignElements[i].style.marginTop = ((verticalAlignElements[i].parentElement.offsetHeight/2)-(verticalAlignElements[i].offsetHeight/2)-padding)+'px';
			} else {
				verticalAlignElements[i].style.marginTop = '';
			}
		}
	}
	
	//Ensure app title doesn't overflow
	if (appTitleElements) {
		for (var i = 0; i < appTitleElements.length; i++) {
			appTitleElements[i].style.width = '';
			appTitleElements[i].style.width = appTitleElements[i].offsetWidth+'px';
		}
	}
}

window.onload = function() {
    initVungleAd();
    resizeContainers();
    
    var carousel = new Slider('#carousel', '.z-slide-item', {
		'current': 0,
		'duration': 1,
		'minPercentToSlide': null,
		'autoplay': false,
		'direction': 'left',
		'interval': 5
	});
};

window.addEventListener('resize', function(event){
	vungleAd.style.opacity = 0;
	
	if (this.resizeTimer) {
		clearTimeout(this.resizeTimer);
	}
	this.resizeTimer = setTimeout(function(){
	    initVungleAd();
		resizeContainers();
		vungleAd.style.opacity = 1;
	}, 200);
});

document.ontouchmove = function(event){
	//disable scrolling on document, except for tab container contents
	appInfoContainer.ontouchmove = function (event) {
	    event.elementIsEnabled = true;
	};
	
	if (!event.elementIsEnabled) {					
        event.preventDefault();
    }
}