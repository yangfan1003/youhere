function GeolocationWindow(coordinates, target_region, show_send_button, callback) {
	var self = Ti.UI.createWindow({
		backgroundColor:colors.bg,
		title : L('geolocation_info'),
		barColor : colors.titlebar,
		tabBarHidden: true
	});
	
	if (show_send_button) {
		var send = Ti.UI.createButton({systemButton: Ti.UI.iPhone.SystemButton.ACTION});
		self.setRightNavButton(send);
	}
	
	send.addEventListener('click', function(e){
		callback();
		self.close();
	})
	
	var mapView = Ti.Map.createView({
		top:0,
		bottom:0,
		width:Ti.Platform.displayCaps.platformWidth,	
		mapType: Titanium.Map.STANDARD_TYPE,
		region: target_region,
		animate:true,
		regionFit:true,
		userLocation:false,
		annotations: [{
				latitude: coordinates.latitude,
				longitude: coordinates.longitude,
				pincolor:Titanium.Map.ANNOTATION_RED,
				draggable: false,
				animate:false,
		}]
	});


	self.add(mapView);
	
	return self;
};

module.exports = GeolocationWindow;
