//Tidy up button bars
function LocationWindow(title) {
	// var colors = require('/ui/common/Colors');
	// var _ = require('underscore')._;
	// var imageCache = require('CachedImageView').cache;
	
	var self = Ti.UI.createWindow({
		title : title,
		barColor : colors.titlebar,
		backgroundColor : 'white'
	});
	
	var findActionBtnBar = Titanium.UI.createButtonBar({
		labels:[L('loc_find_scene'), L('loc_find_friend')],
		backgroundColor:colors.button_col1
	});
	self.setRightNavButton(findActionBtnBar);

	var refreshBtn = Ti.UI.createButton({
		title : L('refresh_location'),
		backgroundColor : colors.button_col1,
		height : 33,
		width : 33
	});
	self.setLeftNavButton(refreshBtn);

	var mapView = Ti.Map.createView({
		top:0,
		width:Ti.Platform.displayCaps.platformWidth,		
		mapType: Titanium.Map.STANDARD_TYPE,
		animate:true,
		regionFit:true,
		userLocation:true
	});
	var self_view = Ti.UI.createView({
		backgroundColor : colors.bg,
		top : 0,
		height : self.height,
		width : self.width
	});
	self_view.add(mapView);
	self.add(self_view);

// helpers


// Events

	Ti.App.addEventListener('gps_UPDATE_location', function(e) {
		Ti.API.info('registering gps_UPDATE_location');
		mapView.setRegion({latitude:myGPS.latitude, longitude:myGPS.longitude, latitudeDelta:0.2, longitudeDelta:0.2});
	});
	
	refreshBtn.addEventListener('click', function(){
		Ti.App.fireEvent('gps_UPDATE_location');	
	});
	
	findActionBtnBar.addEventListener('click', function(e){
		switch (e.index) {
			case 0: //open find scene window
				var FindSceneWindowClass = require('/ui/location/FindSceneWindow');
				var findSceneWindow = new FindSceneWindowClass(null);
				findSceneWindow.containingTab = self.containingTab;
				
				var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
				var findFriendWindow = new FindFriendWindowClass(L('lfriend'), friend_array, true);
				findFriendWindow.containingTab = self.containingTab;
				findFriendWindow.isSecondary = true;

				findSceneWindow.secondaryWindow = findFriendWindow;
				self.containingTab.open(findSceneWindow);
				break;
			case 1: //open find friends window
				var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
				var findFriendWindow = new FindFriendWindowClass(L('lfriend'), friend_array, true);
				findFriendWindow.containingTab = self.containingTab;		

				var FindSceneWindowClass = require('/ui/location/FindSceneWindow');
				var findSceneWindow = new FindSceneWindowClass(null);
				findSceneWindow.containingTab = self.containingTab;
				findSceneWindow.isSecondary = true;
				
				findFriendWindow.secondaryWindow = findSceneWindow;		
				self.containingTab.open(findFriendWindow);
				break;
		}
	});

	return self;
};

module.exports = LocationWindow;
