function Login(title) {
	var customRows = require('rows').customTableRows;

	var self = Ti.UI.createWindow({
		title:title,
		barColor: colors.titlebar,
		backgroundColor:'white',
		tabBarHidden: true,
		navBarHidden: false
	});
	
	var login_textfield = Titanium.UI.createTextField({
		height : 30,
		backgroundImage : null,
		width : 180,
		font : {
			fontSize : 14
		},
		color : '#555',
		clearOnEdit : false,
		autocorrect: false, 
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		hintText: L('login_account_hint'),
	});
	var passwd_textfield = Titanium.UI.createTextField({
		height : 40,
		backgroundImage : null,
		width : 180,
		font : {
			fontSize : 14
		},
		color : '#555',
		clearOnEdit : false,
		autocorrect: false,
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		passwordMask: true,
		hintText: L('login_password_hint'),
	});

	var inputData = [];

	var new_auto_login = Ti.App.Properties.getBool('AUTO_LOGIN');
	if (new_auto_login == null) new_auto_login = false;
	inputData[0] = customRows.addTextFieldRow(L('login_account')+': ',  login_textfield,35);
	inputData[1] = customRows.addTextFieldRow(L('login_password')+': ',  passwd_textfield,35);
	inputData[2] = customRows.addSwitchRow(L('auto_login_label'), new_auto_login, function(e){
		new_auto_login = e.source.value?'true':'false';
		Ti.API.info('AUTO_LOGIN changed to ' + new_auto_login);
	})
	inputData[0].header = '';
	
	var signup_form = Titanium.UI.createTableView({top:0,width:300,height:210,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});
	self.add(signup_form);

	var next_btn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('forgot_password')
	});
	self.setRightNavButton(next_btn);
	
	var loginButton = Ti.UI.createButton({
		height:24,
		width:280,
		title:L('login_label'),
		top:160,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	self.add(loginButton);
	
	loginButton.addEventListener('click', function(e){
			login_textfield.blur();
			passwd_textfield.blur();
			var loginProgressView = new ProgressView({window: self});
			loginProgressView.show({
				text:L('progress_wait_login')
			});
			Ti.Cloud.Users.login({
				login : login_textfield.value,
				password : passwd_textfield.value
			}, function(data) {
				if (data.success && data.meta.code == 200) {
					Ti.API.info('entering login callback: ' + JSON.stringify(data));
					userMe = data.users[0];
					var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
					var mainTab = new ApplicationTabGroup();
					loginProgressView.hide();
					Ti.App.Properties.setBool('AUTO_LOGIN', new_auto_login);
					Ti.App.Properties.setString('APP_EMAIL', login_textfield.value);
					Ti.App.Properties.setString('APP_USERNAME', login_textfield.value);
					Ti.App.Properties.setString('APP_PASSWD', passwd_textfield.value);
					mainTab.open();
					Ti.App.addEventListener('APP_LOGOUT', function(e){
						mainTab.close();
					});
				}
				else {
					loginProgressView.hide();
					var failProgressView = new ProgressView({window: self});
					failProgressView.show({
						text:L('progress_fail_login'),error:true
					});
					setTimeout(function() {
					    failProgressView.hide();
					}, 1500);				
					return;
				}
			});
	});
	
	return self;
};

module.exports = Login;
