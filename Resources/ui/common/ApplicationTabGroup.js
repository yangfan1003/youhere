function ApplicationTabGroup() {
	//create module instance
	
	var self = Ti.UI.createTabGroup();
	var scene = require('/ui/scene/SceneWindow');
	var location = require('/ui/location/LocationWindow');
	var settings = require('/ui/setting/SettingWindow'); 
	var log = require('/ui/logs/LogsWindow'); 
	var feed = require('/ui/chat/ChatGroupWindow');
	//create app tabs
	
	var win1 = new scene(L('scene')),
		win2 = new log(userMe, true),
		win3 = new location(L('loc')),
		win4 = new feed(L('feed')),
		win5 = new settings(userMe, true);
	
	var tab1 = Ti.UI.createTab({ 
		title: L('scene'),
		icon: '/images/scene.png',
		window: win1
	});
	win1.containingTab = tab1;
	
	var tab2 = Ti.UI.createTab({
		title: L('log'),
		icon: '/images/camera.png',
		window: win2
	});
	win2.containingTab = tab2;
	
	var tab3 = Ti.UI.createTab({
		title: L('loc'),
		icon: '/images/avatar.png',
		window: win3
	});
	win3.containingTab = tab3;
	
	var tab4 = Ti.UI.createTab({
		title: L('feed'),
		icon: '/images/chat.png',
		window: win4
	});
	win4.containingTab = tab4;
	
	var tab5 = Ti.UI.createTab({
		title: L('settings'),
		icon: '/images/settings.png',
		window: win5
	});
	win5.containingTab = tab5;

	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);
	self.addTab(tab4);
	self.addTab(tab5);
	
	setup_GPS();
		
	return self;
};

function setup_GPS() {
	if (Titanium.Geolocation.locationServicesEnabled === false)
	{
		Titanium.UI.createAlertDialog({title:L('app_name'), message:'location is disabled'}).show();
		return;
	}
	else {
		Ti.Geolocation.purpose = L('app_name') + ' ' + L('gps_purpose');
		if (Titanium.Platform.name != 'android') {
			var authorization = Titanium.Geolocation.locationServicesAuthorization;
			if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
				Ti.UI.createAlertDialog({
					title: L('app_name'),
					message:L('GPS_AUTHORIZATION_DENIED')
				}).show();
			}
			else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
				Ti.UI.createAlertDialog({
					title: L('app_name'),
					message:L('GPS_AUTHORIZATION_RESTRICTED')
				}).show();
			}
		}
	}
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = 50;
	setTimeout(function(){
		Titanium.Geolocation.getCurrentPosition(function(e){
			if (!e.success || e.error) {
				Titanium.API.info('Geo getCurrentPosition error: ' + JSON.stringify(e));
				return;
			}
			else {
				// Ti.Cloud.Users.coords = e.coords;
				myGPS = e.coords;
				//TODO change this to the actual location
				// myGPS = {latitude:39.9005002778,longtitude:116.384131389};
				// Ti.App.fireEvent('gps_UPDATE', e);
				Titanium.API.info('Geo getCurrentPosition success: ' + JSON.stringify(e.coords));
			}
		});
	},2000);
	
	var locationCallback = function(e) {
		if (!e.success || e.error) {
			Titanium.API.info('Geo locationCallback error: ' + JSON.stringify(e));
			return;
		}
		else {
			myGPS = e.coords;
			// Ti.API.info('myGPS: ' + JSON.stringify([myGPS.longitude,myGPS.latitude]));
			//TODO change this to the actual location

			// update user account: online, lat, lng
			Ti.Cloud.Users.update({custom_fields:{online:1, lat:null, lng:null, "coordinates":[myGPS.longitude,myGPS.latitude]}}, function(result){
				Ti.API.info('updating user Cloud coordinates: ' + JSON.stringify(result));
			});

			Ti.Cloud.Users.query({where:{"coordinates":{$nearSphere:[myGPS.longitude,myGPS.latitude], $maxDistance : 0.007}}, limit:100}, function(result){
				var new_friend_array = [];
				_(result.users).each(function(user) {
					if (user.id != userMe.id) {
						new_friend_array.push(user);
					}
				});
				if (new_friend_array.length > 0) { friend_array = new_friend_array;}
				Ti.App.fireEvent('gps_UPDATE_findfriend', e);
			});
	
			Ti.Cloud.Places.query({where:{"lnglat":{$nearSphere:[myGPS.longitude,myGPS.latitude], $maxDistance : 0.007}}, limit:100}, function(result){
				var new_scene_array = [];
				_(result.places).each(function(place) {
					if (place.tags[0] != '城市风景') {
						new_scene_array.push(place);
					}	
				});
				if (new_scene_array.length > 0) { scene_array = new_scene_array;}
				Ti.App.fireEvent('gps_UPDATE_findscene', e);
			});

			myGPS.currentLocation = {};
			Ti.Geolocation.reverseGeocoder(e.coords.latitude,e.coords.longitude, function(reverse_evt) {
				myGPS.currentLocation = {};
				if (e.success) {
					var places = reverse_evt.places;
					if (places && places.length) {
						myGPS.currentLocation['street'] = places[0].street;
						myGPS.currentLocation['city'] = places[0].city;
						myGPS.currentLocation['country'] = places[0].country_code;
						myGPS.currentLocation['address'] = places[0].address;
					} else {
						myGPS.currentLocation['street'] = "";
						myGPS.currentLocation['city'] = "";
						myGPS.currentLocation['country'] = "";
						myGPS.currentLocation['address'] = "";
					}
					Ti.API.info('reverseGeocoder success: ' + JSON.stringify(places[0]));
				}
				else {
					Ti.API.info('reverseGeocoder failure');
				}
			});
			
			Ti.App.fireEvent('gps_UPDATE_location', e);
			Titanium.API.info('Geo locationCallback success: ' + JSON.stringify(e.coords));
			
		}
	}
	Titanium.Geolocation.addEventListener('location', locationCallback);
}

module.exports = ApplicationTabGroup;
