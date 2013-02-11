function SettingWindow(user, isMe) {	
	var customRows = require('rows').customTableRows;
	var imgArray = [];

	var self = Ti.UI.createWindow({
		title:(isMe)?L('settings'):user.first_name,
		barColor: colors.titlebar,
		backgroundColor: colors.bg2
	});
	
	var addPhotoCollectionView = Ti.UI.createView({
		bottom:0,
		height:220,
		backgroundColor:'#444444',
		visible: false	
	});

	var mood_label = Titanium.UI.createLabel({
		height : 30,
		width : 200,
		font : {
			fontSize : 12
		},
		color : '#777',
		left:70,
		text: user.custom_fields.mood
	});
	var likes_label = Titanium.UI.createLabel({
		height : 30,
		width : 200,
		font : {
			fontSize : 12
		},
		color : '#777',
		left:70,
		text: (user.reviews_count)?user.reviews_count:0
	});
	
	var inputData = [];
	if (isMe) {
		inputData[0] = customRows.addProfileRow(user, true, function(e){
			Ti.API.info('profile row clicked');
			var editProfileWindow = new (require('ui/setting/EditProfile'))(user, isMe);
			editProfileWindow.containingTab = self.containingTab;
			self.containingTab.open(editProfileWindow);
			
		});
	}
	else {
		inputData[0] = customRows.addProfileRow(user, false, true);
	}
	
	if (isMe) {
		imgArray = Ti.App.Properties.getString('COLLECTION_LIST_'+user.id)?JSON.parse(Ti.App.Properties.getString('COLLECTION_LIST_'+user.id)):[];
	}
	inputData[1] = customRows.addAvatarsRow(imgArray, isMe, 
		function(e){
			Ti.API.info('deleting photo: ' + JSON.stringify(e));
			delPhotoCollectionView.visible = true;
		}, 
		function(e){
			addPhotoCollectionView.visible = true;
		}
	);
	inputData[1].header = '';
	
	inputData[2] = customRows.addLabelRow(L('mood_label')+ ': ', mood_label, 35, function(e){
		if (!isMe) return;
		var editWindowClass = require('/ui/setting/EditSaveWindow');
		var editWindow = new editWindowClass(L('mood_label'), mood_label.text, function(save_Event){
			// Ti.API.info('save_Event: ' + save_Event.save_value);
			if (save_Event.save_value == null || save_Event.save_value.length <= 0) { return; }
			var saveProgressView = new ProgressView({window: editWindow});
			saveProgressView.show({
				text:L('progress_wait_save')
			});
			Ti.Cloud.Users.update({
				custom_fields:{mood:save_Event.save_value}
			}, function(result){
				saveProgressView.hide();	
				Ti.API.info('save user result: ' + JSON.stringify(result));
				if (result.success) {
					userMe = result.users[0];
					Ti.API.info('updated userMe: ' + JSON.stringify(userMe));
					var doneProgressView = new ProgressView({window: editWindow});
					doneProgressView.show({
						text:L('progress_success_save'),success:true
					});
					setTimeout(function() {
					    doneProgressView.hide();
					    editWindow.close();
					    user.custom_fields.mood = save_Event.save_value;
					    mood_label.value = userMe.custom_fields.mood;
					}, 1500);				
				}
			});
		});
		editWindow.containingTab = self.containingTab;
		self.containingTab.open(editWindow);
	});
	if (isMe) {
		inputData[2].hasChild = true;
	}
	
	inputData[3] = customRows.addLabelRow(isMe?L('my_likes_label'):L('others_likes_label')+ ': ',  likes_label,35, function(e){
		var favoritesWindow = require('/ui/scene/FavoritesWindow');
		var favWinTitle = '';
		if (isMe) {
			favWinTitle = L('fav');
		}
		else {
			if (user.custom_fields.sex == 'MALE') {
				favWinTitle = L('mfav');
			}
			else {
				favWinTitle = L('ffav');
			}
		}
		var favWin;
		if (isMe) {
			favWin = new favoritesWindow(favWinTitle);	
		}
		else {
			favWin = new favoritesWindow(favWinTitle, user);
		}
		favWin.containingTab = self.containingTab;
		self.containingTab.open(favWin);
	});
	inputData[3].hasChild = true;
	
	var logs_label = Titanium.UI.createLabel({
		height : 30,
		width : 200,
		font : {
			fontSize : 12
		},
		color : '#777',
		left:70,
		text: (logStats[user.id])?logStats[user.id]:0
	});
	if (!isMe) {
		inputData[4] = customRows.addLabelRow((user.custom_fields.sex=='MALE')?L('hislog'):L('herlog')+ ': ',  logs_label,35, 
			function(e){
				var logsWindow = require('/ui/logs/LogsWindow');
				logWin = new logsWindow(user, false);
				logWin.containingTab = self.containingTab;
				self.containingTab.open(logWin);
			});
		Ti.Cloud.Statuses.query({where:{user_id:user.id},order:'-updated_at', limit:100}, 
			function(status_result){
				if (status_result.success && status_result.meta.code==200) {
					Ti.API.info('status result: ' + JSON.stringify(status_result));
					logStats[user.id] = status_result.statuses.length;
					logs_label.text = status_result.statuses.length;
				}	
			});
		inputData[4].hasChild = true;

		var lat1 = myGPS.latitude;
		var lon1 = myGPS.longitude;
		var lat2 = user.custom_fields.coordinates[0][1];
		var lon2 = user.custom_fields.coordinates[0][0];
	
		var R = 6371;
		var d = Math.round(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R);
		var distance_text = isNaN(d)?'0 km':d + ' km';
		var online_status = L('online');
		if (user.custom_fields.online == 0) {
			var last_seen_datetime = new Date(user.updated_at.replace(/-/g, '/').replace('T',' '));
			var now = new Date();
			var diff = now.getTime() - last_seen_datetime.getTime();
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
		inputData[5] = customRows.addLabelRow(L('distance_location_heading')+ ': ',  Ti.UI.createLabel({		
			height : 30,
			width : 200,
			font : {
				fontSize : 12
			},
			color : '#777',
			left:70,
			text:distance_text + ' / ' + online_status}),35, 
			function(e){
				var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
				var findFriendWindow = new FindFriendWindowClass(self.title, [user], false);
				findFriendWindow.containingTab = self.containingTab;		
				self.containingTab.open(findFriendWindow);
			});
		inputData[5].hasChild = true;		
	}
	inputData[2].header = '';
	
	var logoutButton = Ti.UI.createButton({
			height:25,
			width:280,
			title:L('logout_label'),
			style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
			backgroundColor: colors.button_col2,
			top:10
	});
	logoutButton.addEventListener('click', function(e){
		var logoutProgressView = new ProgressView({window: self});
		logoutProgressView.show({
			text:L('progress_wait_logout')
		});
		Ti.Cloud.Users.update({custom_fields:{online:0}}, function(result) {
			Ti.API.info('updating user online status: ' + JSON.stringify(result));	
			Ti.Cloud.Users.logout(function(){
				logoutProgressView.hide();
				Ti.App.Properties.setBool('AUTO_LOGIN', false);
				Ti.App.fireEvent('APP_LOGOUT');
			});
		});
	});
	var logoutView = Ti.UI.createView({backgroundColor:'transparent',height:50,width:300});
	logoutView.add(logoutButton);
	
	var hiButton = Ti.UI.createButton({
			height:25,
			width:280,
			title:L('start_chat'),
			style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
			backgroundColor: colors.button_col2,
			top:10
	});
	hiButton.addEventListener('click', function(e){
		var ChatWindowClass = require('/ui/chat/ChatWindow');
		var chatWin = new ChatWindowClass(user);
		chatWin.containingTab = self.containingTab;
		self.containingTab.open(chatWin);
	});
	var hiView = Ti.UI.createView({backgroundColor:'transparent',height:50,width:300});
	hiView.add(hiButton);

	var longAccountForm = Titanium.UI.createTableView({top:0,width:300,height:210,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					height: self.height,
					footerView: (user.id == userMe.id)?logoutView:hiView,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});

	self.add(longAccountForm);

	function drawCollection(photo_array) {
		imgArray = photo_array;
		Ti.App.Properties.setString('COLLECTION_LIST_'+user.id, JSON.stringify(imgArray));
		var collectionRow = customRows.addAvatarsRow(imgArray, isMe, 
			function(e){
				Ti.API.info('deleting photo: ' + JSON.stringify(e));
				var delPhotoCollectionView = Ti.UI.createView({
					bottom:0,
					height:220,
					backgroundColor:'#444444',
				});
				var removePhotoBtn = Titanium.UI.createButton({
					title : L('removePhoto'),
					top : 40,
					height : 35,
					width : 260,
					photo_id: e.source.photo_obj.id,
					style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
					backgroundColor: colors.button_col2
				});
				delPhotoCollectionView.add(removePhotoBtn);
				var cancelDelBtn = Titanium.UI.createButton({
					title : L('cancel'),
					top : 160,
					height : 35,
					width : 260,
					style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
					backgroundColor: '#888888'
				});
				delPhotoCollectionView.add(cancelDelBtn);
				cancelDelBtn.addEventListener('click', function(){
					delPhotoCollectionView.visible = false;
					self.remove(delPhotoCollectionView);	
				});
				removePhotoBtn.addEventListener('click', function(evt){
					Ti.API.info('remove clicked: ' + JSON.stringify(evt));
					    delPhotoCollectionView.visible = false;
					    self.remove(delPhotoCollectionView);
					    var new_photo_array = _(photo_array).reject(function(photo){
					    	return photo.id == evt.source.photo_id;
					    });
					    drawCollection(new_photo_array);

					// var removeFavoriteProgressView = new ProgressView({window: self});
					// removeFavoriteProgressView.show({
						// text:L('progress_wait_delete')
					// });
					Ti.Cloud.Photos.remove({photo_id:evt.source.photo_id}, function(delete_result){
						if (delete_result.success && delete_result.meta.code==200) {
							Ti.API.info('removed collection photo success');
							// removeFavoriteProgressView.hide();
							// var doneProgressView = new ProgressView({window: self});
							// doneProgressView.show({
								// text:L('progress_success_delete'),success:true
							// });
							// setTimeout(function() {
							    // doneProgressView.hide();
							    loadCollection();
							// }, 1500);				
						}
						else {
							    loadCollection();
						}
					});
				});							
				self.add(delPhotoCollectionView);
	
			}, 
			function(e){
				addPhotoCollectionView.visible = true;
			},
			function(e){
				var GalleryWindowClass = require('/ui/scene/GalleryWindow');
				viewFullPic = new GalleryWindowClass(self.title, true, _(imgArray).pluck('urls'), e.source.scroll_index);
				viewFullPic.containingTab = self.containingTab;
				self.containingTab.open(viewFullPic);
			}
		);
		longAccountForm.updateRow(1, collectionRow);
	}

	function loadCollection() {
		if (user.custom_fields.collection_id) {
			Ti.Cloud.PhotoCollections.showPhotos({collection_id:user.custom_fields.collection_id, user_id:user.id}, function(result){
				Ti.API.info('collection result: ' + JSON.stringify(result));
				if (result.success && result.meta.code==200) {
					drawCollection(result.photos);
					Ti.API.info('setting photo collection array: ' + JSON.stringify(result.photos));
				}
			});
		}
	}

	loadCollection();
	
	Ti.App.addEventListener('new_collection_photo', function(e){
		Ti.API.info('new collection photo event fired');
		loadCollection();
	});
		
	self.addEventListener('focus', function(e){
		Ti.API.info('SettingWindow focused event fired');
		if (isMe) {
			user = userMe;
			mood_label.text = user.custom_fields.mood;	
			likes_label.text = (user.reviews_count)?user.reviews_count:0
		}	
	});

	var takePhotoBtn = Titanium.UI.createButton({
		title : L('take_photo'),
		top : 30,
		height : 35,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
		// backgroundImage: 'images/button_orange.png'
	});
	addPhotoCollectionView.add(takePhotoBtn);
	var cameraRollBtn = Titanium.UI.createButton({
		title : L('camera_roll'),
		top : 80,
		height : 35,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
		// backgroundImage: 'images/button_orange.png'
	});
	addPhotoCollectionView.add(cameraRollBtn);
	var cancelAddBtn = Titanium.UI.createButton({
		title : L('cancel'),
		top : 160,
		height : 35,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: '#888888'
		// backgroundImage: 'images/button_orange.png'
	});
	addPhotoCollectionView.add(cancelAddBtn);
	
	function processMediaEvent(event) {
		var imageView = Ti.UI.createImageView({
			image : event.media,
			width : event.media.width,
			height : event.media.height,
			center : (Ti.Platform.osname == 'android') ? null : true
		});
		// emptyAvatarImgView.image = imageView.toImage().imageAsResized(160,160);
		Ti.API.info('ready to upload to photo collection');
		// var saveProgressView = new ProgressView({window: self});
		// saveProgressView.show({
			// text:L('progress_wait_save')
		// });
		if (user.custom_fields.collection_id) {
				addPhotoCollectionView.visible = false;			
			    	var temp_photo = {};
				var square_imageView = Ti.UI.createImageView({image:null});
				if (imageView.toImage().height > imageView.toImage().width) {
					square_imageView.image = imageView.toImage().imageAsResized(Math.round((75/imageView.toImage().height)*imageView.toImage().width), 75);
				}
				else {
					square_imageView.image = imageView.toImage().imageAsResized(75, Math.round((75/imageView.toImage().width)*imageView.toImage().height));
				}
				var square_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'COLLECTION_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16)+'_square');
				var full_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'COLLECTION_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16)+'_full');
				var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'COLLECTION_THUMBS');
				if (!folder.exists()) {
					folder.createDirectory();
				};
				square_file.write(square_imageView.toImage());
			    	full_file.write(imageView.toImage());
			    
			    temp_photo.urls = {
			    	square_75:square_file.nativePath,
			    	original:full_file.nativePath
			    };
			    drawCollection(imgArray.concat(temp_photo));
			    
			Ti.Cloud.Photos.create({photo:imageView.image, collection_id:user.custom_fields.collection_id}, function(result){
				if (result.success && result.meta.code==200) {
					Ti.API.info('new photo in collection: ' + JSON.stringify(result));
					setTimeout(function() {
						loadCollection();
					}, 20000);
				}
				else {
					Ti.API.info('failed to add new photo in collection: ' + JSON.stringify(result));
					setTimeout(function() {
						loadCollection();
					}, 20000);
				}
			});
		}
		else {
			Ti.API.info('creating a new photo collection');
				addPhotoCollectionView.visible = false;			
			    	var temp_photo = {};
				var square_imageView = Ti.UI.createImageView({image:null});
				if (imageView.toImage().height > imageView.toImage().width) {
					square_imageView.image = imageView.toImage().imageAsResized(Math.round((75/imageView.toImage().height)*imageView.toImage().width), 75);
				}
				else {
					square_imageView.image = imageView.toImage().imageAsResized(75, Math.round((75/imageView.toImage().width)*imageView.toImage().height));
				}
				var square_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'COLLECTION_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16)+'_square');
				var full_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'COLLECTION_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16)+'_full');
				var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'COLLECTION_THUMBS');
				if (!folder.exists()) {
					folder.createDirectory();
				};
				square_file.write(square_imageView.toImage());
			    	full_file.write(imageView.toImage());
			    
			    temp_photo.urls = {
			    	square_75:square_file.nativePath,
			    	original:full_file.nativePath
			    };
			    drawCollection(imgArray.concat(temp_photo));
			
			Ti.Cloud.PhotoCollections.create({name:'profile'}, function(result){
				if (result.success && result.meta.code==200) {
					var id = result.collections[0].id;
					Ti.Cloud.Users.update({custom_fields:{collection_id:id}}, function(user_result){
						if (user_result.success && user_result.meta.code==200) {
							userMe = user_result.users[0];
							user.custom_fields.collection_id = id;
							Ti.Cloud.Photos.create({photo:imageView.image, collection_id:user.custom_fields.collection_id}, function(photo_result){
								if (photo_result.success && photo_result.meta.code == 200) {
									if (photo_result.success && photo_result.meta.code==200) {
										Ti.API.info('new photo in collection: ' + JSON.stringify(result));
										setTimeout(function() {
											loadCollection();
										}, 20000);
									}
									else {
										Ti.API.info('failed to add new photo in collection: ' + JSON.stringify(result));
										setTimeout(function() {
											loadCollection();
										}, 20000);
									}
								}
							});
						}
					});
				}
				else {
					Ti.API.info('failed to add new photo in collection: ' + JSON.stringify(result));
					setTimeout(function() {
						loadCollection();
					}, 20000);
				}	
			});
		}
	}
	
	cameraRollBtn.addEventListener('click',function(e){
		Titanium.Media.openPhotoGallery({
			success : function(event) {
				processMediaEvent(event);
			},
			cancel : function() {
				//self.tf.fireEvent('return');
				Ti.API.info('user cancelled openGallery');
			},
			allowEditing : false,
			animated : true,
			autohide : true,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	});
	takePhotoBtn.addEventListener('click', function(e){
		Ti.API.info('opening camera');
		Titanium.Media.showCamera({
			success : function(event) {
				processMediaEvent(event);
			},
			cancel : function() {
				//self.tf.fireEvent('return');
				Ti.API.info('user cancelled showCamera');
			},
			saveToPhotoGallery : true,
			allowEditing : true,
			animated : true,
			autohide : true,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	});
	
	self.add(addPhotoCollectionView);

	cancelAddBtn.addEventListener('click', function(e){
		addPhotoCollectionView.visible = false;
	});

	Ti.App.addEventListener('setting_update_profile_image', function(evt) {
		// must be called from ChangeAvatarWindow, which means userMe is true
		var new_user_val = user;
		new_user_val.photo.urls = evt.urls;
		var newProfileRow = customRows.addProfileRow(new_user_val, true, function(e){
			Ti.API.info('sub event in setting, new_user_val: ' + JSON.stringify(new_user_val));
			var editProfileWindow = new (require('ui/setting/EditProfile'))(new_user_val, isMe);
			editProfileWindow.containingTab = self.containingTab;
			self.containingTab.open(editProfileWindow);
		});
		longAccountForm.updateRow(0, newProfileRow);
	});
	
	return self;
};

module.exports = SettingWindow;
