function FindFriendWindow(title, input_array, show_toolbar, init_mode, region, array_refresh_function) {
	// init_mode: map == show map view,   list == show table view,   null == map
	var secondaryWindowOpened = false;

	var self = Ti.UI.createWindow({
		backgroundColor:colors.bg,
		title : title,
		barColor : colors.titlebar,
		tabBarHidden: true
	});

	var target_array = input_array;
	var target_region = (region)?region:{latitude:myGPS.latitude, longitude:myGPS.longitude, latitudeDelta:0.2, longitudeDelta:0.2};

	var findActionBtnBar = Titanium.UI.createButtonBar({
		labels:[L('loc_find_scene'), L('loc_find_friend')],
		backgroundColor:colors.button_col1
	});
	if (show_toolbar) self.setRightNavButton(findActionBtnBar);

	var friendTable = Ti.UI.createTableView({bottom:(show_toolbar)?50:0});
	friendTable.addEventListener('click', function(e){
		showUserProfile(e.row.userobj);
	});

	function showUserProfile(user) {
		var UserProfileClass = require('/ui/setting/SettingWindow');
		var userProfile = new UserProfileClass(user, false);
		if (self.isSecondary) self.visible = false;
		userProfile.containingTab = self.containingTab;
		if (show_toolbar) self.containingTab.secondaryWindowPressed = true;	
		self.containingTab.open(userProfile);
	}
	var friendMap = Ti.Map.createView({
		top:0,
		bottom:(show_toolbar)?50:0,
		width:Ti.Platform.displayCaps.platformWidth,		
		mapType: Titanium.Map.STANDARD_TYPE,
		region: target_region,
		animate:true,
		regionFit:true,
		userLocation:false,
	});

	function updateFriendMap() {
		// Ti.API.info('in updateFriendMap');
		if (target_array.length <= 0) { return; }
		friendMap.removeAllAnnotations();
		var newAnnotations = [];
		_(target_array).each(function(user){
			// Ti.API.info('processing user: ' + JSON.stringify(user));
			// var thumbImgView = Ti.UI.createImageView({image : (user.photo)?user.photo.urls.square_75:null, height : 32,width : 32,top : 0,left : 0});
			var small_thumbImgView = Ti.UI.createView({top:0,left:0});
			var small_avatar_imgView = Ti.UI.createImageView({image:(user.photo)?user.photo.urls.square_75:null, left:3, top:3, height:25, width:25,borderRadius:12});
			var small_bubble_imgView = Ti.UI.createImageView({left:0, top:0, height:32, width:32,
								backgroundColor:'transparent',
								borderColor:'transparent',
								backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
			var avatar_imgView = Ti.UI.createImageView({image:(user.photo)?user.photo.urls.square_75:null, left:8, top:6, height:38, width:38,borderRadius:16});
			var bubble_imgView = Ti.UI.createImageView({left:0, top:0, height:54, width:54,
								backgroundColor:'transparent',
								borderColor:'transparent',
								backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
			var thumbImgView = Ti.UI.createView({top:0,left:0});
			thumbImgView.add(avatar_imgView);
			thumbImgView.add(bubble_imgView);
			
			var lat1 = myGPS.latitude;
			var lon1 = myGPS.longitude;
			var lat2 = user.custom_fields.coordinates[0][1]; //place.latitude;
			var lon2 = user.custom_fields.coordinates[0][0]; //place.longitude;
	
			var R = 6371;
			// km
			var d = Math.round(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R);
			var distance_text = isNaN(d)?'0 km':d + ' km';
			var online_status = L('online');
			if (user.custom_fields.online == 0) {
				var last_seen_datetime = new Date(user.updated_at.replace(/-/g, '/').replace('T',' '));
				var now = new Date();
				var diff = now.getTime() - last_seen_datetime.getTime();
				// Ti.API.info('last seen : ' + diff + ' milliseconds ago');
				
				var days = Math.floor(diff / (24 * 60 * 60 * 1000));
				var hours = Math.floor(diff / (60*60*1000));
				var minutes = Math.floor(diff / (60*1000));
				if (days > 0) {
					online_status = days + L('days') + L('ago');
				}
				else if (hours > 0) {
					online_status = hours + L('hours') + L('ago');
				}
				else {
					online_status = minutes + L('minutes') + L('ago');
				}
			}
			
			var friendAnnotation = Ti.Map.createAnnotation({
				latitude:user.custom_fields.coordinates[0][1],
				longitude:user.custom_fields.coordinates[0][0],
				pincolor:Titanium.Map.ANNOTATION_GREEN,
				image: thumbImgView.toImage(),
				draggable: true,
				title:user.first_name,
				subtitle: distance_text + ' / ' + online_status,
				leftView: thumbImgView,
				rightButton:Titanium.UI.iPhone.SystemButton.DISCLOSURE,
				animate:false,
				userobj: user
			});
			newAnnotations.push(friendAnnotation);
		});
		// Ti.API.info(JSON.stringify(newAnnotations));
		if (newAnnotations.length > 0) {
			friendMap.setAnnotations(newAnnotations);
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
			friendMap.setRegion({latitude:newCenter.lat, longitude:newCenter.lon, latitudeDelta: delta+0.033, longitudeDelta: delta});
		}
	}

	function updateFriendTable() {
		var rows = [];
		// Ti.API.info('refreshing table');
		if (target_array.length < 0) { return; }
		_(target_array).each(function(user) {
			// Ti.API.info(JSON.stringify('user: ' + user));
			var row = Ti.UI.createTableViewRow({
				className : user.id,
				userobj : user,
				height : 80,
				hasChild : true
			});
			var rowView = Ti.UI.createView({
				backgroundColor : 'transparent',
				left : 0,
				height : 70
			});
	
			rowView.add(Ti.UI.createLabel({
				text : user.first_name,
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
				text : user.custom_fields.prov + ' ' + user.custom_fields.city,
				left : 70,
				font : {
					fontSize : 12
				},
				top:25,
				color: '777777'
			}));
			rowView.add(Ti.UI.createButton({
				height:15,
				width:30,
				top:25,
				left:135,
				title:ageString,
				font:{fontSize:12,fontWeight:'bold'},
				style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
				backgroundColor: (user.custom_fields.sex=='MALE')?'#70C7FF':'pink'
				}));			
			rowView.add(Ti.UI.createLabel({
				text : (show_toolbar||user.visited_at==null)?user.custom_fields.mood:user.visited_at.substring(0,7).replace('-', L('year_delimiter'))+L('month_delimiter')+user.visited_at.substring(8,10)+L('date_delimiter')+L('visited'),
				left : 70,
				font : {
					fontSize : 12
				},
				top: 45,
				color: '777777'
			}));
	
			var lat1 = myGPS.latitude;
			var lon1 = myGPS.longitude;
			var lat2 = user.custom_fields.coordinates[0][1]; //place.latitude;
			var lon2 = user.custom_fields.coordinates[0][0]; //place.longitude;
	
			var R = 6371;
			// km
			var d = Math.round(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R);
			
			rowView.add(Ti.UI.createLabel({
				text : isNaN(d)?'0 km':d + ' km',
				top : 25,
				left: 170,
				font : {
					fontSize : 14,
				},
				color: '777777'
			}));
			var online_status = L('online');
			if (user.custom_fields.online == 0) {
				var last_seen_datetime = new Date(user.updated_at.replace(/-/g, '/').replace('T',' '));
				var now = new Date();
				var diff = now.getTime() - last_seen_datetime.getTime();
				// Ti.API.info('last seen : ' + diff + ' milliseconds ago');
				
				var days = Math.floor(diff / (24 * 60 * 60 * 1000));
				var hours = Math.floor(diff / (60*60*1000));
				var minutes = Math.floor(diff / (60*1000));
				if (days > 0) {
					online_status = days + L('days') + L('ago');
				}
				else if (hours > 0) {
					online_status = hours + L('hours') + L('ago');
				}
				else {
					online_status = minutes + L('minutes') + L('ago');
				}
			}
			rowView.add(Ti.UI.createLabel({
				text : online_status,
				right: 20,
				font : {
					fontSize : 12
				},
				top:25,
				color: '777777'
			}));

			var imageUrl = (user.photo)?user.photo.urls.square_75:null;
			var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:8, top:6, height:52, width:52,borderRadius:24});
			var bubble_imgView = Ti.UI.createImageView({left:0, top:0, height:70, width:70,
								backgroundColor:'transparent',
								borderColor:'transparent',
								backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
			
			rowView.add(avatar_imgView);
			rowView.add(bubble_imgView);
	
			row.add(rowView);
			rows.push(row);
		});
		friendTable.setData(rows);
	}
	
	// two diff main views
	var findFriendMapView = Ti.UI.createView({
		backgroundColor : colors.bg,
		top : 0,
		height : self.height,
		width : self.width,
		visible: false
	});
	var findFriendTableView = Ti.UI.createView({
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
	var footerView = Ti.UI.createView({height:50,bottom:0,backgroundColor:'#444444'});
	var listViewButton = Ti.UI.createButton({
		height:24,
		width:120,
		left:20,
		title:L('list_friend_button'),
		visible: true,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	var mapViewButton = Ti.UI.createButton({
		height:24,
		width:120,
		left:20,
		visible: false,
		title:L('show_friend_map_button'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	var showLogButton = Ti.UI.createButton({
		height:24,
		width:120,
		right:20,
		title:L('filter_friend_button'),
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	footerView.add(listViewButton);
	footerView.add(mapViewButton);
	footerView.add(showLogButton);
	
	
	// UI
	findFriendTableView.add(friendTable);
	if (init_mode) {
		if (init_mode == 'list') {
			findFriendTableView.visible = true;
			listViewButton.visible = false;
		}
	}
	self.add(findFriendTableView);
	findFriendMapView.add(friendMap);
	findFriendMapView.visible = !findFriendTableView.visible;
	mapViewButton.visible = !listViewButton.visible;
	self.add(findFriendMapView);
	updateFriendMap();
	updateFriendTable();
	
	
	listViewButton.addEventListener('click', function(e)
	{
		// hide map view
		findFriendMapView.visible = false;
		findFriendTableView.visible = true;
		listViewButton.visible = false;
		mapViewButton.visible = true;
	});
	mapViewButton.addEventListener('click', function(e)
	{
		// hide table view
		findFriendTableView.visible = false;
		findFriendMapView.visible = true;
		listViewButton.visible = true;
		mapViewButton.visible = false;
	});
	friendMap.addEventListener('click',function(e){
		Ti.API.info('event: ' + JSON.stringify(e));
		if (e.clicksource == 'rightButton') {
			showUserProfile(e.annotation.userobj);
		}
	});

 	Ti.App.addEventListener('gps_UPDATE_findfriend', function(e) {
		Ti.API.info('registering gps_UPDATE_findfriend event handler');
		friendMap.setRegion({latitude:myGPS.latitude, longitude:myGPS.longitude, latitudeDelta:0.2, longitudeDelta:0.2});
		updateFriendTable();
		updateFriendMap();
	});
	
	if (array_refresh_function) {
		// Ti.API.info('given array_refresh_function');
		var refreshProgressView = new ProgressView({window: self});
		refreshProgressView.show({
			text:L('progress_wait_load')
		});
		array_refresh_function({}, function(e){
			target_array = e.array;
			updateFriendTable();
			updateFriendMap();
			refreshProgressView.hide();		
		});
	}

	findActionBtnBar.addEventListener('click', function(e){
		switch (e.index) {
			case 0: //open find scene window
				if (self.secondaryWindow) {
					self.title = L('lscene');
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
			case 1: //open find friends window
				if (self.secondaryWindow) {
					if (secondaryWindowOpened) {
						self.secondaryWindow.visible = false;
					}
				}
				self.title = L('lfriend');
				break;
		}
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

	if (show_toolbar) {
		self.add(footerView);
	}
	

	return self;
};

module.exports = FindFriendWindow;
