function EditProfileWindow(user, isMe) {
	var customRows = require('rows').customTableRows;
	
	var self = Ti.UI.createWindow({
		title:L('settings'),
		barColor: colors.titlebar,
		backgroundColor: colors.bg2,
		tabBarHidden: true,
		navBarHidden: false
	});

	var inputData = [];
	inputData[0] = customRows.addProfileRow(user, true, null);
	var changeAvatarBtn = Ti.UI.createButton({
		height:25,
		width:140,
		title:L('change_avatar'),
		top: 50,
		left: 120,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
	});
	inputData[0].add(changeAvatarBtn);
	changeAvatarBtn.addEventListener('click',function(e){
		var changeAvatarWindow = new (require('ui/setting/ChangeAvatarWindow'))(user, L('change_avatar'));
		changeAvatarWindow.containingTab = self.containingTab;
		self.containingTab.open(changeAvatarWindow);
	});
	
	var email_label = Titanium.UI.createLabel({
		height : 30,
		width : 200,
		font : {
			fontSize : 12
		},
		color : '#777',
		left:70,
		text: user.email
	});
	
	inputData[1] = customRows.addLabelRow(L('account_email')+': ',  email_label,35, null);
	inputData[1].header = '';
	
	// var nickname_textfield = Titanium.UI.createTextField({
		// height : 30,
		// backgroundImage : null,
		// width : 260,
		// font : {
			// fontSize : 14
		// },
		// color : '#555',
		// clearOnEdit : false,
		// autocorrect: false, 
		// borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		// hintText: L('account_nickname')+': ' + user.first_name,
	// });
	var nickname_label = Titanium.UI.createLabel({
		height : 30,
		width : 200,
		font : {
			fontSize : 12
		},
		color : '#777',
		left:70,
		text: user.first_name
	});
	var age_textfield = Titanium.UI.createTextField({
		height : 30,
		backgroundImage : null,
		width : 260,
		font : {
			fontSize : 14
		},
		color : '#555',
		clearOnEdit : false,
		autocorrect: false, 
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		hintText: L('age_label')+': ' + L('age_'+user.custom_fields.age+'s'),
	});
	inputData[2] = customRows.addLabelRow(L('account_nickname')+': ',  nickname_label,35, function(e){
		if (!isMe) return;
		var editWindowClass = require('/ui/setting/EditSaveWindow');
		var editWindow = new editWindowClass(L('account_nickname'), nickname_label.text, function(save_Event){
			// Ti.API.info('save_Event: ' + save_Event.save_value);
			if (save_Event.save_value == null || save_Event.save_value.length <= 0) { return; }
			var saveProgressView = new ProgressView({window: editWindow});
			saveProgressView.show({
				text:L('progress_wait_save')
			});
			Ti.Cloud.Users.update({
				first_name:save_Event.save_value
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
					    user.first_name = save_Event.save_value;
					    nickname_label.text = userMe.first_name;
					}, 1500);				
				}
			});
		});
		editWindow.containingTab = self.containingTab;
		self.containingTab.open(editWindow);
	});
	inputData[3] = customRows.addTextFieldRow(null,  age_textfield,35);
	inputData[2].header = '';
	inputData[2].hasChild = true;

	var home_label = Titanium.UI.createLabel({
		height : 30,
		width : 200,
		font : {
			fontSize : 12
		},
		color : '#777',
		left:70,
		text: user.custom_fields.prov + ' ' + user.custom_fields.city
	});

	inputData[4] = customRows.addLabelRow(L('account_from'), home_label, 35, function(e){
		var editHomeClass = require('/ui/setting/EditHomeWindow');
		var editHomeWin = new editHomeClass(function(save_Event){
			var saveProgressView = new ProgressView({window: editHomeWin});
			saveProgressView.show({
				text:L('progress_wait_save')
			});
			Ti.Cloud.Users.update({
				custom_fields:{prov:save_Event.prov, city:save_Event.city}
			}, function(result){
				saveProgressView.hide();	
				if (result.success) {
					var doneProgressView = new ProgressView({window: editHomeWin});
					doneProgressView.show({
						text:L('progress_success_save'),success:true
					});
					setTimeout(function() {
					    doneProgressView.hide();
					    editHomeWin.close();
						userMe.custom_fields.prov = save_Event.prov;
						userMe.custom_fields.city = save_Event.city;
						user.custom_fields.prov = save_Event.prov;
						user.custom_fields.city = save_Event.city;
						home_label.text = user.custom_fields.prov + ' ' + user.custom_fields.city;
					}, 1500);				
				}
			});
		});
		editHomeWin.containingTab = self.containingTab;
		self.containingTab.open(editHomeWin);
	});
	inputData[4].hasChild = true;
	
	inputData[5] = customRows.addTitleRow(L('update_password'),  35, function(e){
		var resetPassClass = require('/ui/setting/NewPassWindow');
		var resetPass = new resetPassClass(L('update_password'), function(save_Event){
			Ti.API.info('save_Event: ' + JSON.stringify(save_Event));
			if (save_Event.pass1.length <= 0 || save_Event.pass1 == null) {
				(Ti.UI.createAlertDialog({message:L('incomplete_register')})).show();
				return;
			}
			if (save_Event.pass1.length < 6) {
				(Ti.UI.createAlertDialog({message:L('password_tooshort')})).show();
				return;
			}
			if (save_Event.pass1 != save_Event.pass2) {
				(Ti.UI.createAlertDialog({message:L('password_mismatch')})).show();
				return;
			}
			var saveProgressView = new ProgressView({window: resetPass});
			saveProgressView.show({
				text:L('progress_wait_save')
			});
			Ti.Cloud.Users.update({
				password:save_Event.pass1,
				password_confirmation:save_Event.pass2
			}, function(result){
				saveProgressView.hide();	
				Ti.API.info('save user password: ' + JSON.stringify(result));
				if (result.success) {
					// userMe = result.users[0];
					// Ti.API.info('updated userMe: ' + JSON.stringify(userMe));
					var doneProgressView = new ProgressView({window: resetPass});
					doneProgressView.show({
						text:L('progress_success_save'),success:true
					});
					Ti.App.Properties.setString('APP_PASSWD', save_Event.pass1);
					setTimeout(function() {
					    doneProgressView.hide();
					    resetPass.close();
					}, 1500);				
				}
			});
		});
		resetPass.containingTab = self.containingTab;
		self.containingTab.open(resetPass);
	});
	inputData[4].header = '';

	//inputData[3].header = '';
	
	var profileForm = Titanium.UI.createTableView({top:0,width:300,height:210,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					height: self.height,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});

	self.add(profileForm);

	Ti.App.addEventListener('profile_update_profile_image', function(evt) {
		// must be called from ChangeAvatarWindow, which means userMe is true
		var new_user = user;
		new_user.photo.urls = evt.urls;
		var newProfileRow = customRows.addProfileRow(new_user, true, null);
		var new_changeAvatarBtn = Ti.UI.createButton({
			height:25,
			width:140,
			title:L('change_avatar'),
			top: 50,
			left: 120,
			style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
			backgroundColor: colors.button_col2
		});
		newProfileRow.add(new_changeAvatarBtn);
		new_changeAvatarBtn.addEventListener('click',function(e){
			var changeAvatarWindow = new (require('ui/setting/ChangeAvatarWindow'))(new_user, L('change_avatar'));
			changeAvatarWindow.containingTab = self.containingTab;
			self.containingTab.open(changeAvatarWindow);
		});
		
		profileForm.updateRow(0, newProfileRow);
	});
		
	return self;
};

module.exports = EditProfileWindow;
