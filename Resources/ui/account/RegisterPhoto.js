function RegisterPhoto(account) {
	
	function getRandomInt (min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	var _account = account;
	var self = Ti.UI.createWindow({
		title:L('register_photo'),
		barColor: colors.titlebar,
		backgroundColor:'white'
	});

	var photo_chosen = false;
	
	var emptyAvatarImgView = Ti.UI.createImageView({
		image: 'images/empty_avatar.png',
		height: 160,
		width: 160,
		top:20	
	});
	self.add(emptyAvatarImgView);
	
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

	takePhotoBtn.addEventListener('click', function(e){
					Titanium.Media.showCamera({
						success : function(event) {
							// var image = event.cropRect?event.cropEct:event.media;
							Ti.API.debug('Picture type was: ' + event.mediaType);
							if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
								var imageView = Ti.UI.createImageView({
									image : event.media,
									width : event.media.width,
									height : event.media.height,
									center : (Ti.Platform.osname == 'android') ? null : true
								});
								// upload to cloud;
								photo_chosen = true;
								emptyAvatarImgView.image = imageView.toImage().imageAsResized(160,160);
							} else {
								alert("got the wrong type back =" + event.mediaType);
							}
						},
						cancel : function() {
							// self.tf.fireEvent('return');
							Ti.API.info('cancel from user showCamera');
						},
						error : function(error) {
							// self.tf.fireEvent('return');
							if(error.code == Titanium.Media.NO_CAMERA) {
								(Ti.UI.createAlertDialog({message:L('device_no_camera')})).show();
							}
						},
						saveToPhotoGallery : true,
						allowEditing : true,
						animated : true,
						autohide : true,
						mediaTypes : [Ti.Media.MEDIA_TYPE_VIDEO, Ti.Media.MEDIA_TYPE_PHOTO]
					});
	});	

	cameraRollBtn.addEventListener('click', function(e){
					Titanium.Media.openPhotoGallery({
						success : function(event) {
							var imageView = Ti.UI.createImageView({
								image : event.media,
								width : event.media.width,
								height : event.media.height,
								center : (Ti.Platform.osname == 'android') ? null : true
							});
							photo_chosen = true;
							emptyAvatarImgView.image = imageView.toImage().imageAsResized(160,160);
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

	var next_btn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('finish')
	});
	self.setRightNavButton(next_btn);
	
	next_btn.addEventListener('click', function(e){
		// cloud create user	
		Ti.API.info('ready to register account: ' + JSON.stringify(_account));
		var usernameRandInt = getRandomInt(10000, 10000000); 
		var registerProgressView = new ProgressView({window: self});
		registerProgressView.show({
			text:L('progress_wait_register')
		});
		Ti.Cloud.Users.create({
			email: _account.email,
			username: usernameRandInt,
			first_name: _account.nickname,
			password: _account.pass,
			password_confirmation: _account.pass,
			photo: photo_chosen?emptyAvatarImgView.image:null,
			custom_fields:{online:1, prov: _account.prov, city:_account.city, sex:_account.sex, age:_account.age, coordinates:[0,0]}
		}, function(result){
			Ti.API.info('register result: ' + JSON.stringify(result));
			userMe = result.users[0];
			Ti.API.info('userMe: ' + JSON.stringify(userMe));
			if (photo_chosen) {
				userMe.photo = {};
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
				userMe.photo = {urls:{square_75:square_file.nativePath,small_240:small_file.nativePath}};
			}
			registerProgressView.hide();			
			if (result.success) {
				Ti.App.Properties.setString('APP_EMAIL', _account.email);
				Ti.App.Properties.setString('APP_USERNAME', usernameRandInt);
				Ti.App.Properties.setString('APP_PASSWD', _account.pass);
				Ti.App.Properties.setBool('AUTO_LOGIN', true);
				var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
				var mainTab = new ApplicationTabGroup();
				mainTab.open();
				Ti.App.addEventListener('APP_LOGOUT', function(evt){
					mainTab.close();
				});
			}
			else {
				// alert('Error: ' + JSON.stringify(e));
				if (result.code == 400) {
					alert (L('email_taken_error'));
				}
				else {
				   alert(JSON.stringify(result));
				}
			}	
		});
	});
	
	return self;
};

module.exports = RegisterPhoto;
