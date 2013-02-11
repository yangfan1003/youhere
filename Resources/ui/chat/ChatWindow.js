function ChatWindow(chat_user, conTab) {
	var ChatView = require('/ui/chat/ChatView').Class;

	function processMediaEvent(event) {
		var compressedBlob = ImageFactory.compress(event.media, 0.25); 
		
		var imageView = Ti.UI.createImageView({
			image : compressedBlob,
			width : event.media.width,
			height : event.media.height
		});
		Ti.API.info('ready to upload to photo collection');
		// var saveProgressView = new ProgressView({window: self});
		// saveProgressView.show({
			// text:L('progress_wait_send')
		// });
	    	addPhotoCollectionView.visible = false;
		var thumb_imageView = Ti.UI.createImageView({
			image : compressedBlob,
			width : (event.media.height > event.media.width)?120:160,
			height : (event.media.height> event.media.width)?160:120
		});
		var random_id = (Math.random()*0xFFFFFF<<0).toString(16);
		var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'CHAT_THUMBS', random_id);
		var full_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'CHAT_THUMBS', 'full_' + random_id);
		var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'CHAT_THUMBS');
		if (!folder.exists()) {
			folder.createDirectory();
		};
		file.write(thumb_imageView.toImage());
		full_file.write(imageView.toImage());
		var created_at_string = dateFormat(new Date(), 'isoDateTime');
		var payload = {id:random_id, message:'IMG PHOTO', from:userMe, created_at:created_at_string, photo:{urls:{small_240:file.nativePath, original:full_file.nativePath}}};
		Ti.API.info('display photo payload: ' + JSON.stringify(payload.photo));
		chatView.sendImage(payload, payload.photo.urls);
		
		Ti.Cloud.Chats.create({to_ids:chat_user.id, message: 'IMG PHOTO', photo:event.media}, function(send_result){
			if (send_result.success && send_result.meta.code==200) {
				// saveProgressView.hide();
				// var doneProgressView = new ProgressView({window: self});
				// doneProgressView.show({
					// text:L('progress_success_send'),success:true
				// });
				// setTimeout(function() {
				        // doneProgressView.hide();
					var actual_payload = {id:send_result.chats[0].id, message:'IMG PHOTO', from:userMe, created_at:send_result.chats[0].created_at, photo:{urls:{small_240:file.nativePath, original:full_file.nativePath}}};
					Ti.API.info('actual photo payload: ' + JSON.stringify(actual_payload.photo));
					chat_history = chat_history.concat([actual_payload]);
					Ti.App.Properties.setString('CHAT_HISTORY_'+chat_user.id, JSON.stringify(chat_history));
				// }, 1500);
			}
			else {
				Ti.API.info('send chat failed: ' + JSON.stringify(send_result));
			}
		});
	}

	var self = Ti.UI.createWindow({
		title:chat_user.first_name,
		barColor: colors.titlebar,
		backgroundColor:colors.bg2,
		tabBarHidden: true
	});
	
	self.containingTab = conTab;
	
	var chat_area = Ti.UI.createScrollView({
		bottom : 0,
		width : Ti.Platform.displayCaps.platformWidth,
		backgroundColor : 'transparent',
		backgroundFocusedColor : 'transparent',
		backgroundSelectedColor : 'transparent',
		contentHeight: 'auto'
	});
	var chatView = new ChatView(self.containingTab);
	chat_area.add(chatView.getView());
	self.add(chat_area);

	var addPhotoCollectionView = Ti.UI.createView({
		bottom:0,
		height:220,
		backgroundColor:'#444444',
		visible: false	
	});
	self.add(addPhotoCollectionView);
	
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
			allowEditing : false,
			animated : true,
			autohide : true,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
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
	cancelAddBtn.addEventListener('click', function(e){
		addPhotoCollectionView.visible = false;
	});


	
	var chat_history = [];
	if (Ti.App.Properties.getString('CHAT_HISTORY_'+chat_user.id)) {
		chat_history = JSON.parse(Ti.App.Properties.getString('CHAT_HISTORY_'+chat_user.id));
	}
	var query_dictionary = {participate_ids:chat_user.id+','+userMe.id, order:'updated_at', limit:100};
	
	if (chat_history.length > 0) {
		query_dictionary.where = {'created_at':{'$gt':chat_history[chat_history.length - 1]['created_at']}};
		Ti.API.info('retrieve chat after previous chat timestamp: ' + JSON.stringify(query_dictionary));
		chatView.setData(chat_history, self.containingTab);
	}


	

	var reload = Ti.UI.createButton({systemButton: Ti.UI.iPhone.SystemButton.REFRESH});
	self.setRightNavButton(reload);

	var tf = Titanium.UI.createTextField({
		left : 50,
		height : 30,
		top : 10,
		width : Math.round(Ti.Platform.displayCaps.platformWidth / 2) + 60,
		font : {
			fontSize : 13
		},
		color : '#777',
		paddingLeft : 0,
		paddingRight : 5,
		clearOnEdit : false,
		// autocorrect : Ti.App.Properties.getList('SETTINGS')[0].SPELLCHECK ? Ti.App.Properties.getList('SETTINGS')[0].SPELLCHECK : 'true',
		maxLength: 300,
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		returnKeyType:Titanium.UI.RETURNKEY_SEND,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	tf.addEventListener('return', function(evt){
		if (tf.value.length > 0) {
			/*
			var payload = {id:send_result.chats[0].id,message:tf.value, from:userMe, created_at:send_result.chats[0].created_at};
			chatView.sendMessage(payload);
			tf.value='';
			
			Ti.Cloud.Chats.create({to_ids:chat_user.id, message: tf.value}, function(send_result){
				if (send_result.success && send_result.meta.code==200) {
					chat_history = chat_history.concat([payload]);
					Ti.App.Properties.setString('CHAT_HISTORY_'+chat_user.id, JSON.stringify(chat_history));
				}
				else {
					Ti.API.info('send chat failed: ' + JSON.stringify(send_result));
				}
			});

			 */
			
			Ti.Cloud.Chats.create({to_ids:chat_user.id, message: tf.value}, function(send_result){
				if (send_result.success && send_result.meta.code==200) {
					var payload = {id:send_result.chats[0].id,message:tf.value, from:userMe, created_at:send_result.chats[0].created_at};
					chatView.sendMessage(payload);
					chat_history = chat_history.concat([payload]);
					Ti.App.Properties.setString('CHAT_HISTORY_'+chat_user.id, JSON.stringify(chat_history));
					tf.value='';
				}
				else {
					Ti.API.info('send chat failed: ' + JSON.stringify(send_result));
				}
			});
		}
	});
	
	reload.addEventListener('click', function(evt){
		query_dictionary.where = {'created_at':{'$gt':chat_history[chat_history.length - 1]['created_at']}};
		Ti.Cloud.Chats.query(query_dictionary, function(refresh_result){
			if (refresh_result.success && refresh_result.meta.code == 200) {
				Ti.API.info('refresh result: ' + JSON.stringify(refresh_result.chats));
				if (refresh_result.chats.length > 0) {
					_(refresh_result.chats).each(function(chat){
						if (chat.custom_fields && chat.custom_fields.coordinates) {
							chatView.receiveGPSMessage(chat);
						}
						else if (chat.photo && chat.photo.urls) {
							chatView.receiveImage(chat, chat.photo.urls);
						}
						else {
							chatView.receiveMessage(chat);
						}
						chat_history = chat_history.concat(chat);	
						Ti.App.Properties.setString('CHAT_HISTORY_'+chat_user.id, JSON.stringify(chat_history));
					});
				}
			}
		});
	});
	
	var locationImgView= Ti.UI.createImageView({
		left:10,
		top:10,
		width: 30,
		height: 25,
		image: '/images/chat_geolocation.png'
	});
	locationImgView.addEventListener('click', function(evt){
		var GeolocationWindowClass = require('/ui/chat/GeolocationWindow');
		var geoWin = new GeolocationWindowClass(
			{latitude: myGPS.latitude, longitude: myGPS.longitude},
			{latitude: myGPS.latitude, longitude: myGPS.longitude, latitudeDelta:0.01, longitudeDelta:0.01},
			true,
			function(){
				Ti.API.info('callback from GeoWindow');
				Ti.Cloud.Chats.create({to_ids:chat_user.id, message:'MY GEOLOCATION', custom_fields:{'coordinates':[myGPS.longitude,myGPS.latitude]}}, function(send_result){
					if (send_result.success && send_result.meta.code==200) {
						Ti.API.info('send chat success: ' + JSON.stringify(send_result));
						var payload = {id:send_result.chats[0].id,message:'MY GEOLOCATION', from:userMe, created_at:send_result.chats[0].created_at, custom_fields:{coordinates:{longitude:myGPS.longitude,latitude:myGPS.latitude}}};
						chatView.sendGPSMessage(payload);
						chat_history = chat_history.concat(payload);
						Ti.App.Properties.setString('CHAT_HISTORY_'+chat_user.id, JSON.stringify(chat_history));
					}
					else {
						Ti.API.info('send GPS failed: ' + JSON.stringify(send_result));
					}
				});
			}
		);
		geoWin.containingTab = self.containingTab;
		self.containingTab.open(geoWin);
		
	});
	var mediaImgView= Ti.UI.createImageView({
		right:10,
		top:10,
		width: 30,
		height: 25,
		image: '/images/chat_media.png'
	});
	mediaImgView.addEventListener('click', function(){
		addPhotoCollectionView.visible = true;
	});

	var footerView = Ti.UI.createView({
		bottom : 0,
		left : 0,
		height : 50,
		width : Ti.Platform.displayCaps.platformWidth,
		backgroundImage : '/images/tabbar_blk.png'
	});
	footerView.add(locationImgView);
	footerView.add(mediaImgView);
	footerView.add(tf);
	chat_area.add(footerView);


	Ti.Cloud.Chats.query(query_dictionary, function(chat_result){
		if (chat_result.success && chat_result.meta.code==200) {
			Ti.API.info('chat result: ' + JSON.stringify(chat_result.chats));
			if (chat_result.chats.length > 0) {
				chat_history = chat_history.concat(chat_result.chats);
				Ti.API.info('new chat msg: ' + JSON.stringify(chat_result.chats));
				chatView.setData(chat_history);
				Ti.App.Properties.setString('CHAT_HISTORY_'+chat_user.id, JSON.stringify(chat_history));
			}
			else {
				Ti.API.info('no new messages from cloud, show old history');
				chatView.setData(chat_history);
			}
		}
		else {
			Ti.API.info('chat query result failed: ' + JSON.stringify(chat_result));
			chatView.setData(chat_history);
		}
		
	});
	chat_area.addEventListener('singletap', function(e){
		tf.blur();
	});
	
	return self;
};

module.exports = ChatWindow;
