function LandingTabGroup() {
	//create module instance
	
	var self = Ti.UI.createTabGroup();
	var landing = require('/ui/account/LandingWindow');
	
	var win1 = new landing(L('register_label'));
	
	var tab1 = Ti.UI.createTab({ 
		title: L('settings'),
		icon: '/images/scene.png',
		window: win1
	});
	win1.containingTab = tab1;
	
	self.addTab(tab1);
	
	return self;
};

module.exports = LandingTabGroup;
