function FindSceneWindow(single_scene_place) {
	var secondaryWindowOpened = false;
	
	var self = Ti.UI.createWindow({
		backgroundColor:colors.bg,
		title : L('lscene'),
		barColor : colors.titlebar,
		tabBarHidden: true
	});

	var findActionBtnBar = Titanium.UI.createButtonBar({
		labels:[L('loc_find_scene'), L('loc_find_friend')],
		backgroundColor:colors.button_col1
	});
	self.setRightNavButton(findActionBtnBar);

	Ti.API.info('single scene place: ' + JSON.stringify(single_scene_place));
	
	var found_scene_array = null;
	var target_region = null;

	if (single_scene_place == null) {
		found_scene_array = scene_array;
		target_region = {latitude:myGPS.latitude, longitude:myGPS.longitude, latitudeDelta:0.2, longitudeDelta:0.2};
	}
	else {
		found_scene_array = [single_scene_place];
		target_region = {latitude:single_scene_place.lat, longitude:myGPS.lng, latitudeDelta:0.0005, longitudeDelta:0.0005};
	}

	var sceneTable = Ti.UI.createTableView({bottom:50});
	sceneTable.addEventListener('click', function(e){
		search_resultsDetail(e.row.placeobj);
	});

	function search_resultsDetail(place) {
		var DetailPlaceWindowClass = require('/ui/scene/DetailSceneWindow');
		var clickedPlace = new DetailPlaceWindowClass(place);
		if (self.isSecondary) self.visible = false;
		clickedPlace.containingTab = self.containingTab;
		self.containingTab.secondaryWindowPressed = true;	
		self.containingTab.open(clickedPlace);
	}
	var sceneMap = Ti.Map.createView({
		top:0,
		width:Ti.Platform.displayCaps.platformWidth,		
		mapType: Titanium.Map.STANDARD_TYPE,
		region: {},
		animate:true,
		regionFit:true,
		userLocation:false,
		bottom: 50
	});

	function updateSceneMap() {
		Ti.API.info('in updateSceneMap');
		if (found_scene_array.length <= 0) { return; }
		sceneMap.removeAllAnnotations();
		var newAnnotations = [];
		_(found_scene_array).each(function(place){
			var thumbImgView = Ti.UI.createImageView({image : place.photo.urls.square_75,height : 32,width : 32,top : 0,left : 0});
			// var pinImgView = Ti.UI.createImageView({image : '/images/scene_pin.png',height : 32,width : 32,top : 0,left : 0});
			var sceneAnnotation = Ti.Map.createAnnotation({
				latitude:place.latitude,
				longitude:place.longitude,
				// pincolor:Titanium.Map.ANNOTATION_PURPLE,
				image: '/images/scene_pin.png',
				title:place.name,
				subtitle:L('scene_type_heading') + ': ' + place.tags[0],
				leftView: thumbImgView,
				rightButton:Titanium.UI.iPhone.SystemButton.DISCLOSURE,
				animate:false,
				placeobj: place
			});
			Ti.API.info('adding ' + place.name + ' to annotation array @ location: ' + place.latitude + '/' + place.longitude);
			newAnnotations.push(sceneAnnotation);
		});
		// Ti.API.info(JSON.stringify(newAnnotations));
		if (newAnnotations.length > 0) {
			sceneMap.setAnnotations(newAnnotations);			
			var delta = 0.02; 
			var minLat = maxLat = newAnnotations[0].latitude; 
			var minLon = maxLon = newAnnotations[0].longitude;
			for (var i=0; i<newAnnotations.length-1; i++) {
				minLat = Math.min(newAnnotations[i+1].latitude, minLat);
				maxLat = Math.max(newAnnotations[i+1].latitude, maxLat);
				minLon = Math.min(newAnnotations[i+1].longitude, minLon);
				maxLon = Math.max(newAnnotations[i+1].longitude, maxLon);
			}
			var deltaLat = maxLat - minLat;
			var deltaLon = maxLon - minLon;
			
			delta = Math.max(deltaLat, deltaLon);
			delta = delta * 0.95;
			var newCenter = {};
			newCenter.lat = maxLat - parseFloat((maxLat - minLat)/2);
			newCenter.lon = maxLon - parseFloat((maxLon - minLon)/2);
			sceneMap.setRegion({latitude:newCenter.lat, longitude:newCenter.lon, latitudeDelta: delta+0.033, longitudeDelta: delta});
		}
	}

	function updateSceneTable() {
		var rows = [];
		Ti.API.info('refreshing table');
		if (found_scene_array.length <= 0) { return; }
		_(found_scene_array).each(function(place) {
			// Ti.API.info(JSON.stringify(place));
			var row = Ti.UI.createTableViewRow({
				className : place.id,
				placeobj : place,
				height : 70,
				hasChild : true
			});
			var rowView = Ti.UI.createView({
				backgroundColor : 'transparent',
				left : 0,
				height : 70
			});
	
			rowView.add(Ti.UI.createLabel({
				text : place.name,
				left : 70,
				top: 3,
				width : 200,
				color: 'black',
				textAlign : 'left',
				font : {
					fontSize : 16
				}
			}));
			rowView.add(Ti.UI.createLabel({
				text : L('scene_area_heading') + ': ' + place.state + ' ' + place.city,
				left : 70,
				font : {
					fontSize : 12
				},
				bottom: 10,
				color: '777777'
			}));
			rowView.add(Ti.UI.createLabel({
				text : L('scene_type_heading') + ': ' + place.tags[0],
				left : 70,
				font : {
					fontSize : 12
				},
				top: 30,
				color: '777777'
			}));
	
			// Ti.API.info('myGPS: ' + JSON.stringify(myGPS));
			// Ti.API.info('place: ' + JSON.stringify(place));
			var lat1 = myGPS.latitude;
			var lon1 = myGPS.longitude;
			var lat2 = place.latitude;
			var lon2 = place.longitude;
	
			var R = 6371;
			// km
			var d = Math.round(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R);
			
			rowView.add(Ti.UI.createLabel({
				text : isNaN(d)?'0 km':d + ' km',
				top : 30,
				right : 20,
				font : {
					fontSize : 14,
				},
				color: '777777'
			}));
	
			var imageUrl = place.photo.urls.square_75;
			rowView.add(Ti.UI.createImageView({
				image : imageUrl,
				height : 65,
				width : 65,
				top : 2,
				left : 4
			}));
	
			row.add(rowView);
			rows.push(row);
		});
		sceneTable.setData(rows);
	}
	
	// two diff main views
	var findSceneMapView = Ti.UI.createView({
		backgroundColor : colors.bg,
		top : 0,
		height : self.height,
		width : self.width,
		visible: false
	});
	var findSceneTableView = Ti.UI.createView({
		backgroundColor : colors.bg,
		top : 0,
		height : self.height,
		width : self.width,
		visible: false
	});
	var findLogView = Ti.UI.createView({
		backgroundColor : colors.bg,
		top : 0,
		height : self.height,
		width : self.width,
		visible: false
	});
	
	
	// UI
	findSceneTableView.add(sceneTable);
	findSceneTableView.visible = false;
	self.add(findSceneTableView);
	findSceneMapView.add(sceneMap);
	findSceneMapView.visible = true;
	self.add(findSceneMapView);
	updateSceneMap();
	updateSceneTable();
	
	
	sceneMap.addEventListener('click',function(e){
		Ti.API.info('event: ' + JSON.stringify(e));
		if (e.clicksource == 'rightButton') {
			search_resultsDetail(e.annotation.placeobj);
		}
	});
	if (single_scene_place != null) {
		Ti.API.info('registering gps_UPDATE_findscene event handler');
	 	Ti.App.addEventListener('gps_UPDATE_findscene', function(e) {
			sceneMap.setRegion({latitude:myGPS.latitude, longitude:myGPS.longitude, latitudeDelta:0.2, longitudeDelta:0.2});
			updateSceneTable();
			updateSceneMap();
		});
	}

	findActionBtnBar.addEventListener('click', function(e){
		switch (e.index) {
			case 0: //open find scene window
				if (self.secondaryWindow) {
					if (secondaryWindowOpened) {
						self.secondaryWindow.visible = false;
					}
				}
				self.title = L('lscene');
				break;
			case 1: //open find friends window
				if (self.secondaryWindow) {
					self.title = L('lfriend');
					if (secondaryWindowOpened) {
						self.secondaryWindow.visible = true;
					}
					else {
						self.secondaryWindow.top = 40;
						self.secondaryWindow.bottom = 0;
						secondaryWindowOpened = true;
						self.secondaryWindow.open();
					}
				}
				break;
		}
	});
	
	self.addEventListener('close', function(e){
		if (self.secondaryWindow) {
			self.secondaryWindow.close();
		}
	});

	var footerView = Ti.UI.createView({height:50,bottom:0,backgroundColor:'#444444'});
	var listViewButton = Ti.UI.createButton({
		height:24,
		width:120,
		left:20,
		title:L('list_scene_button'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	var mapViewButton = Ti.UI.createButton({
		height:24,
		width:120,
		left:20,
		visible: false,
		title:L('show_scene_map_button'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	var showLogButton = Ti.UI.createButton({
		height:24,
		width:120,
		right:20,
		title:L('list_log_button'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	footerView.add(listViewButton);
	footerView.add(mapViewButton);
	footerView.add(showLogButton);
	self.add(footerView);
	
	listViewButton.addEventListener('click', function(e)
	{
		// hide map view
		findSceneMapView.visible = false;
		findSceneTableView.visible = true;
		listViewButton.visible = false;
		mapViewButton.visible = true;
	});
	mapViewButton.addEventListener('click', function(e)
	{
		// hide table view
		findSceneTableView.visible = false;
		findSceneMapView.visible = true;
		listViewButton.visible = true;
		mapViewButton.visible = false;
	});

	self.addEventListener('close', function(e){
		if (self.secondaryWindow) {
			self.secondaryWindow.close();
		}
	});

	self.addEventListener('focus', function(e){
		if (self.containingTab.secondaryWindowPressed) {
			self.secondaryWindow.visible = true;
			self.containingTab.secondaryWindowPressed = null;
		}
			
	});

	return self;
};

module.exports = FindSceneWindow;
