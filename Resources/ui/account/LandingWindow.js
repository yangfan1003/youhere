function LandingWindow() {
	var self = Ti.UI.createWindow({
		title:null,
		barColor: colors.titlebar,
		backgroundColor:'white',
		tabBarHidden: true,
		navBarHidden: true
	});
	var wallpaperView = Ti.UI.createImageView({
		image: '/images/login_wallpaper.png',
		top:0,
		left:0	
	});
	self.add(wallpaperView);
	
	var registerButton = Ti.UI.createButton({
		height:24,
		width:100,
		title:L('register_label'),
		bottom:60,
		right:20,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
	});
	self.add(registerButton);
	registerButton.addEventListener('click', function() {
		var registerWindow = new (require('ui/account/RegisterAccount'))(L('register_label'));
		registerWindow.containingTab = self.containingTab;
		self.containingTab.open(registerWindow);
	});
	
	var loginButton = Ti.UI.createButton({
		height:24,
		width:100,
		title:L('login_label'),
		bottom:60,
		left:20,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.titlebar
	});
	self.add(loginButton);
	loginButton.addEventListener('click', function() {
		var loginWindow = new (require('ui/account/Login'))(L('login_label'));
		loginWindow.containingTab = self.containingTab;
		self.containingTab.open(loginWindow);
	});
	
	// var slogan_Label = Ti.UI.createLabel({
		// text: '即时  即地  游你  游我',
		// color: '#666666',
		// bottom: 20
	// });
	// self.add(slogan_Label);
	
	return self;
};

module.exports = LandingWindow;
