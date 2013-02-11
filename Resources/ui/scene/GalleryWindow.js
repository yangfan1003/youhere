function GalleryWindow(title, multiple, full_photos_array, scroll_index) {
	// if (full_photos_array.length < 2) multiple = false;

	var self = Ti.UI.createWindow({
		backgroundColor:'black',
		title : title,
		barColor : colors.titlebar,
		tabBarHidden: true
	});
	var actInd = Titanium.UI.createActivityIndicator({
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		height:90,
		width:90,
		bottom:20
	});

	var fullImageView = Titanium.UI.createImageView({
		image: full_photos_array[scroll_index].original,
		width:Ti.Platform.displayCaps.platformWidth,
		height:Ti.Platform.displayCaps.platformHeight-55,
		top:0,
		center: (Ti.Platform.osname=='android')?null:true,
		canScale: true,
		enableZoomControls: true		
	});
	var scaledFullView = Titanium.UI.createScrollView({
	    contentWidth:'auto',
	    contentHeight:'auto',
	    width:Titanium.Platform.displayCaps.platformWidth,
	    height:Titanium.Platform.displayCaps.platformHeight-55,
	    showVerticalScrollIndicator:true,
	    showHorizontalScrollIndicator:true,
	    minZoomScale:0.5,
	    maxZoomScale:2,
	    zoomScale: 1,
	    horizontalBounce: true,
	    verticalBounce: true
	});	
	fullImageView.addEventListener('dblclick',function(e){
	    if (scaledFullView.zoomScale != 1) {
	    	scaledFullView.setZoomScale(1);
	    }
	    else
	    	scaledFullView.setZoomScale(1.5);
	});
	scaledFullView.add(fullImageView);
	self.add(scaledFullView);
	
	if (multiple) {
		// move scroll view left
		var left = Titanium.UI.createButton({
			image:'/images/icon_arrow_left.png',
			enabled:(scroll_index==0)?false:true
		});
		left.addEventListener('click', function(e)
		{
			if (scroll_index <= 1) {
				left.enabled = false;
			}
			if (scroll_index === 0){
				return; 
			}
			right.enabled = true;
			scroll_index--;
			actInd.show();
			imageCache.updateImageView("cache", full_photos_array[scroll_index].original, fullImageView, false, function(){
				actInd.hide();
				scaledFullView.setZoomScale(1);
			});
			
		});
		// move scroll view right
		var right = Titanium.UI.createButton({
			image:'/images/icon_arrow_right.png',
			enabled:(scroll_index >= full_photos_array.length - 1)?false:true
		});
		right.addEventListener('click', function(e)
		{
			if (scroll_index >= full_photos_array.length - 2) {
				right.enabled = false;				
			}
			if (scroll_index == full_photos_array.length - 1){
				return; 
			}
			left.enabled = true;
			scroll_index++;
			actInd.show();
			imageCache.updateImageView("cache", full_photos_array[scroll_index].original, fullImageView, false, function(){
				actInd.hide();
				scaledFullView.setZoomScale(1);
			});
		});
		var flexSpace = Titanium.UI.createButton({
			systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
		// set toolbar
		self.setToolbar([flexSpace,left,flexSpace,flexSpace,flexSpace,right,flexSpace]);
	}
	self.add(actInd);
	return self;
};

module.exports = GalleryWindow;
