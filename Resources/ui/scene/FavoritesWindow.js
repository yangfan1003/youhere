function FavoritesWindow(title, user) {
	var self = Ti.UI.createWindow({
		backgroundColor:colors.bg,
		title : title,
		barColor : colors.titlebar,
		tabBarHidden: true
	});
	
	
	var found_scene_array = null;
	if (!user) {
		Ti.API.info('this is my favorites window');
		found_scene_array = favs_array;
	}

	var sceneTable = Ti.UI.createTableView();
	sceneTable.addEventListener('click', function(e){
		search_resultsDetail(e.row.placeobj);
	});

	function search_resultsDetail(place) {
		var DetailPlaceWindowClass = require('/ui/scene/DetailSceneWindow');
		var clickedPlace = new DetailPlaceWindowClass(place);
		clickedPlace.containingTab = self.containingTab;		
		self.containingTab.open(clickedPlace);
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
	
	var findSceneTableView = Ti.UI.createView({
		backgroundColor : colors.bg,
		top : 0,
		height : self.height,
		width : self.width,
		visible: true
	});
	
	// UI
	findSceneTableView.add(sceneTable);
	self.add(findSceneTableView);
	if (!user) {
		updateSceneTable();
	}
	else {
		// someone else's favorites window, let's load the data
		var refreshProgressView = new ProgressView({window: self});
		refreshProgressView.show({
			text:L('progress_wait_load')
		});
		Ti.Cloud.Reviews.query({user_id:user.id,limit:100}, function(result){
			if (result.reviews.length >= 0) {
				var new_favs_list = [];
				_(result.reviews).each(function(review){
					var place_obj_str = review.custom_fields.place_obj;
					if (place_obj_str) {
						var place_obj = JSON.parse(place_obj_str);
						new_favs_list.push(place_obj);
					}
				});
				found_scene_array = new_favs_list;
				refreshProgressView.hide();		
				updateSceneTable();
			}
		});
	}

	return self;
};

module.exports = FavoritesWindow;
