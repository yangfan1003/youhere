function DetailSceneWindow(place) {
	
	var self = Ti.UI.createWindow({
		title : place.name,
		backgroundColor : 'white',
		scrollable : true,
		tabBarHidden: true,
		barColor : colors.titlebar
	});
	var actInd = Titanium.UI.createActivityIndicator({
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
		height:90,
		width:90,
		top:60
	});
	var scrollViewPics = Titanium.UI.createScrollableView({
		showPagingControl : true,
		pagingControlColor: '#eeeeee',
		pagingControlOnTop: false,
		clipViews : true,
		pagingControlHeight: 1,
		backgroundColor : 'white',
		top : 0,
		left : 0,
		height: 230
	});

	function showPhotosArray(sorted_photos_array) {
		var newImages = [];
		_(sorted_photos_array).each(function(photo) {
			var newImage = Ti.UI.createImageView({
				image : null,
				top: 0,
				left: 0,
				right: 0
			});
			scrollViewPics.addView(newImage);
			newImages.push(newImage)
		});
		scrollViewPics.addEventListener('scrollEnd', function(e){
			if (e.currentPage >= 0) {
				actInd.show();
				
				imageCache.updateImageView("cache", sorted_photos_array[e.currentPage].urls.medium_500, newImages[e.currentPage], true, function(){
					Ti.API.info('finished loading full pic');
					actInd.hide();
				});
			}
		});
		scrollViewPics.addEventListener('singletap', function(){
			var GalleryWindowClass = require('/ui/scene/GalleryWindow');
			viewFullPic = new GalleryWindowClass(place.name, true, _(sorted_photos_array).pluck('urls'), scrollViewPics.currentPage);
			viewFullPic.containingTab = self.containingTab;
			self.containingTab.open(viewFullPic);
		});
		scrollViewPics.fireEvent('scrollEnd', {currentPage:0});
	}
	
	var place_photos_list = (Ti.App.Properties.getString('PLACE_PHOTOS_LIST'))?JSON.parse(Ti.App.Properties.getString('PLACE_PHOTOS_LIST')):{};
	
	var photo_title_parts = place.photo.title.split('-');
	if (place_photos_list[place.id]) {
		var photos_array = place_photos_list[place.id];
		showPhotosArray(photos_array);
		
	}
	else {
		Ti.API.info('reading photos array from cloud');
		actInd.show();
		Ti.Cloud.Photos.query({where : {"title" : {"$regex" : photo_title_parts[0] + '-.*$'}}}, function(result) {
				if (result.photos.length > 0) {
					var sorted_result = _(result.photos).sortBy(function(photo){
						return photo.title;
					});
					showPhotosArray(sorted_result);
					place_photos_list[place.id] = sorted_result;
					Ti.App.Properties.setString('PLACE_PHOTOS_LIST', JSON.stringify(place_photos_list));
				}
				actInd.hide();
		});
	}
	var textArea = Ti.UI.createTextArea({
		font : {
			fontSize : 14
		},
		color: '666666',
		editable : false,
		textAlign : 'left',
		value : place.address,
		bottom : 60,
		left : 20,
		right : 30,
		width : 280,
		height : 120
	});
	self.add(textArea);
	var findActionBtnBar = Titanium.UI.createButtonBar({
		labels:[L('loc_find_scene'), L('loc_find_friend')],
		backgroundColor:colors.button_col1
	});
	self.setRightNavButton(findActionBtnBar);
	findActionBtnBar.addEventListener('click', function(e){
		switch (e.index) {
			case 0: //open find scene window
				var FindSceneWindowClass = require('/ui/location/FindSceneWindow');
				var locationFindWindow = new FindSceneWindowClass(place);
				locationFindWindow.containingTab = self.containingTab;
				var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
				var findFriendWindow = new FindFriendWindowClass(L('lfriend'), 
						[], 
						true, 
						'map', 
						{latitude:place.latitude, longitude:place.longitude, latitudeDelta:0.2, longitudeDelta:0.2}, 
						function(e, callback){
							var friend_around_array = [];
							Ti.Cloud.Users.query({where:{"coordinates":{$nearSphere:[place.longitude,place.latitude], $maxDistance : 0.007}}, limit:100}, function(result){
								var friend_around_array = [];
								_(result.users).each(function(user) {
									if (user.id != userMe.id) {
										friend_around_array.push(user);
									}
								});
								callback({array:friend_around_array});
							});
				});
				locationFindWindow.secondaryWindow = findFriendWindow;
				self.containingTab.open(locationFindWindow);
				break;
			case 1: //open find friends window
				var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
				var findFriendWindow = new FindFriendWindowClass(L('lfriend'), 
						[], 
						true, 
						'map', 
						{latitude:place.latitude, longitude:place.longitude, latitudeDelta:0.2, longitudeDelta:0.2}, 
						function(e, callback){
							var friend_around_array = [];
							Ti.Cloud.Users.query({where:{"coordinates":{$nearSphere:[place.longitude,place.latitude], $maxDistance : 0.007}}, limit:100}, function(result){
								var friend_around_array = [];
								_(result.users).each(function(user) {
									if (user.id != userMe.id) {
										friend_around_array.push(user);
									}
								});
								callback({array:friend_around_array});
							});
				});
				findFriendWindow.containingTab = self.containingTab;
				var FindSceneWindowClass = require('/ui/location/FindSceneWindow');
				var locationFindWindow = new FindSceneWindowClass(place);

				findFriendWindow.secondaryWindow = locationFindWindow;
				self.containingTab.open(findFriendWindow);
				break;
		}
	});
	self.add(scrollViewPics);
	var footerView = Ti.UI.createView({height:40,bottom:0,backgroundColor:'#eeeeee'});
	var favorites_label = Ti.UI.createLabel({text:L('vfav'), color:'#777', font:{fontSize:12}, left:25});
	var visitors_label = Ti.UI.createLabel({text:L('rvisit'), color:'#777', font:{fontSize:12}, right:60});
	var visitors_stat_label = Ti.UI.createLabel({text:(place_checkins[place.id])?place_checkins[place.id]:'', color:'#777', font:{fontSize:12}, right:5});
	
	var localScenes_label = Ti.UI.createLabel({text:L('scene_local_scenes'), color:'#777', font:{fontSize:12},left:110});
	footerView.add(Ti.UI.createImageView({image:'/images/favorites.png', width:15, height:15,left:2}));
	footerView.add(favorites_label);
	footerView.add(visitors_label);
	footerView.add(visitors_stat_label);
	footerView.add(Ti.UI.createImageView({image:'/images/visitors.png', width:15, height:15,right:110}));
	// footerView.add(localScenes_label);
	// var localService_label = Ti.UI.createLabel({text:L('scene_local_services'), color:'#777', font:{fontSize:12},right:90});
	// footerView.add(localService_label);
	self.add(footerView);

	visitors_label.addEventListener('click', function(evt){
		var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
		var findFriendWindow = new FindFriendWindowClass(L('rvisit'), [], false, 'list', null, function(e, callback){
			var visitors_array = [];
			Ti.Cloud.Checkins.query({where:{place_id:place.id},order:'-updated_at', limit:100}, function(result) {
				// Ti.API.info('querying place checkins: ' + JSON.stringify(result));
				if (result.success && result.meta.code==200) {
					_(result.checkins).each(function(checkin){
						// Ti.API.info('checkin retrieved: ' + JSON.stringify(checkin));
						checkin.user.visited_at = checkin.updated_at;
						visitors_array.push(checkin.user);	
					});
				callback({array:visitors_array});
				}	
			});
		});
		findFriendWindow.containingTab = self.containingTab;		
		self.containingTab.open(findFriendWindow);
	});

	favorites_label.addEventListener('click', function(e){
		// create a chained-review
		var addFavoriteProgressView = new ProgressView({window: self});
		addFavoriteProgressView.show({
			text:L('progress_wait_favorite')
		});
		Ti.Cloud.Reviews.create({place_id:place.id, content:userMe.id, tags:'Favorites', rating:1, custom_fields:{user_obj:JSON.stringify(userMe)}}, function(result){
			// create a unique place review, based on the results, create a user review (should be unique as well)
			// now the user profile is attached with reviews of multiple places
			Ti.API.info('create unique-place review result: ' + JSON.stringify(result));
			if (result.success && result.meta.code==200) {
				Ti.Cloud.Reviews.create({user_id:userMe.id, content:place.id, tags:'Places', rating:1, allow_duplicate:1, custom_fields:{place_obj:JSON.stringify(place)}}, function(user_review_result) {
					Ti.API.info('create user review result: ' + JSON.stringify(user_review_result));
					addFavoriteProgressView.hide();
					if (user_review_result.success && user_review_result.meta.code == 200) {
						userMe.reviews_count++;
						favs_array.push(place);
						Ti.App.Properties.setString('FAVORITES_LIST', JSON.stringify(favs_array));
						var doneProgressView = new ProgressView({window: self});
						doneProgressView.show({
							text:L('progress_success_favorite'),success:true
						});
						setTimeout(function() {
						    doneProgressView.hide();
						}, 1500);				
					}
				});
			}
			else {
				addFavoriteProgressView.hide();
				var doneProgressView = new ProgressView({window: self});
				doneProgressView.show({
					text:L('progress_fail_favorite'),error:true
				});
				setTimeout(function() {
				    doneProgressView.hide();
				}, 1500);				
			}
		});
	});
		
	self.add(actInd);
	
	self.addEventListener('focus', function(e){
		setTimeout(function(){
			Ti.Cloud.Checkins.query({where:{place_id:place.id}, limit:100}, function(result){
				Ti.API.info('querying place checkins: ' + JSON.stringify(result));
				if (result.success && result.meta.code==200) {
					visitors_stat_label.text = result.checkins.length;
					place_checkins[place.id] = result.checkins.length; 
				}	
			});
		}, 1);
	});
	
	self.addEventListener('open', function(e){
		if (!visited_scenes[place.id]) {
			visited_scenes[place.id] = true;
			setTimeout(function(){
				Ti.Cloud.Checkins.create({place_id:place.id}, function(result){
					Ti.API.info('create checkin result: ' + JSON.stringify(result));
				});
			}, 1);
		}
	});
	
	return self;
};

module.exports = DetailSceneWindow;
