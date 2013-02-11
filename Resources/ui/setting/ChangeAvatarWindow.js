function ChangeAvatarWindow(user, title) {
	
	var self = Ti.UI.createWindow({
		title:title,
		barColor: colors.titlebar,
		backgroundColor: colors.bg2
	});
	
	var emptyAvatarImgView = Ti.UI.createImageView({
		image: 'images/empty_avatar.png',
		height: 160,
		width: 160,
		top:20	
	});
	self.add(emptyAvatarImgView);
	
	if (userMe.photo) {
		emptyAvatarImgView.image = user.photo.urls.small_240;
	}	
	
	var takePhotoBtn = Titanium.UI.createButton({
		title : L('take_photo'),
		bottom : 60,
		height : 30,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
		// backgroundImage: 'images/button_orange.png'
	});
	self.add(takePhotoBtn);
	var cameraRollBtn = Titanium.UI.createButton({
		title : L('camera_roll'),
		bottom : 10,
		height : 30,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
		// backgroundImage: 'images/button_orange.png'
	});
	self.add(cameraRollBtn);

	var savePhotoBtn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('save_button')
	});
	self.setRightNavButton(savePhotoBtn);
	
	savePhotoBtn.addEventListener('click',function(e){
		Ti.API.info('save button clicked.');
		var saveProgressView = new ProgressView({window: self});
		saveProgressView.show({
			text:L('progress_wait_save')
		});
		Ti.Cloud.Users.update({photo:emptyAvatarImgView.image}, function(result){
			saveProgressView.hide();	
			Ti.API.info('save photo result: ' + JSON.stringify(result));
			if (result.success) {
				userMe = result.users[0];
				Ti.API.info('updated userMe: ' + JSON.stringify(userMe));
				var doneProgressView = new ProgressView({window: self});
				doneProgressView.show({
					text:L('progress_success_save'),success:true
				});
				setTimeout(function() {
				    doneProgressView.hide();
				    // var temp_photo = result.photos[0];
					var square_imageView = Ti.UI.createImageView({image:null});
					if (emptyAvatarImgView.toImage().height > emptyAvatarImgView.toImage().width) {
						square_imageView.image = emptyAvatarImgView.toImage().imageAsResized(Math.round((75/emptyAvatarImgView.toImage().height)*emptyAvatarImgView.toImage().width), 75);
					}
					else {
						square_imageView.image = emptyAvatarImgView.toImage().imageAsResized(75, Math.round((75/emptyAvatarImgView.toImage().width)*emptyAvatarImgView.toImage().height));
					}
					var square_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'PROFILE_THUMBS', userMe.id+'_square');
					var small_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'PROFILE_THUMBS', userMe.id+'_full');
					var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'PROFILE_THUMBS');
					if (!folder.exists()) {
						folder.createDirectory();
					};
					square_file.write(square_imageView.toImage());
				    	small_file.write(emptyAvatarImgView.toImage());
				    
				    Ti.App.fireEvent('setting_update_profile_image', {urls:{square_75:square_file.nativePath,small_240:small_file.nativePath}});
				    Ti.App.fireEvent('profile_update_profile_image', {urls:{square_75:square_file.nativePath,small_240:small_file.nativePath}});
				    self.close();
				}, 1500);				
			}
		});
	});

	cameraRollBtn.addEventListener('click',function(e){
		Titanium.Media.openPhotoGallery({
			success : function(event) {
				// savePhotoBtn.visible = true;
				var imageView = Ti.UI.createImageView({
					image : event.media,
					width : event.media.width,
					height : event.media.height,
					center : (Ti.Platform.osname == 'android') ? null : true
				});
				emptyAvatarImgView.image = imageView.toImage().imageAsResized(160,160);
				// savePhotoBtn.enabled = true;
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
		Titanium.Media.showCamera({
			success : function(event) {
				// savePhotoBtn.visible = true;
				var imageView = Ti.UI.createImageView({
					image : event.media,
					width : event.media.width,
					height : event.media.height,
					center : (Ti.Platform.osname == 'android') ? null : true
				});
				emptyAvatarImgView.image = imageView.toImage().imageAsResized(160,160);
				// savePhotoBtn.enabled = true;
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

	return self;
};

module.exports = ChangeAvatarWindow;
