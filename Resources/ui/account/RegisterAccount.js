function RegisterAccount(title) {
	var customRows = require('rows').customTableRows;

	var self = Ti.UI.createWindow({
		title:title,
		barColor: colors.titlebar,
		backgroundColor:'white',
		tabBarHidden: true,
		navBarHidden: false
	});
	
	var email_textfield = Titanium.UI.createTextField({
		height : 30,
		backgroundImage : null,
		width : 230,
		left: 40,
		font : {
			fontSize : 14
		},
		color : '#555',
		clearOnEdit : false,
		autocorrect: false, 
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
	});
	
	var alias_textfield = Titanium.UI.createTextField({
		height : 30,
		backgroundImage : null,
		width : 230,
		left: 40,
		font : {
			fontSize : 14
		},
		color : '#555',
		clearOnEdit : false,
		autocorrect: false, 
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
	});
	var passwd_textfield = Titanium.UI.createTextField({
		height : 40,
		backgroundImage : null,
		width : 230,
		left: 40,
		font : {
			fontSize : 14
		},
		color : '#555',
		clearOnEdit : false,
		autocorrect: false, 
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		passwordMask: true,
	});

	var passwd2_textfield = Titanium.UI.createTextField({
		height : 30,
		backgroundImage : null,
		width : 230,
		left: 60,
		font : {
			fontSize : 14
		},
		color : '#555',
		clearOnEdit : false,
		autocorrect: false, 
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_NONE,
		passwordMask: true,
	});

	var inputData = [
		{title:L('account_email')},
		{title:L('account_nickname')}, // 0
		{title:L('account_pass')}, // 1
		{title:L('account_passconfirm')}
	];

	inputData[0] = customRows.addTextFieldRow(L('account_email'),  email_textfield,35);
	
	inputData[1] = customRows.addTextFieldRow(L('account_nickname'),  alias_textfield,35);
	inputData[2] = customRows.addTextFieldRow(L('account_pass'),  passwd_textfield,35);
	inputData[3] = customRows.addTextFieldRow(L('account_passconfirm'),  passwd2_textfield,35);
	
	var signup_form = Titanium.UI.createTableView({top:0,width:300,height:210,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});

	var next_btn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('next')
	});
	next_btn.addEventListener('click', function(e){
		if (email_textfield.value.length <= 0 || alias_textfield.value.length <= 0 || passwd_textfield.value.length <= 0) {
			(Ti.UI.createAlertDialog({message:L('incomplete_register')})).show();
			return;
		}
		if (passwd_textfield.value.length < 6) {
			(Ti.UI.createAlertDialog({message:L('password_tooshort')})).show();
			return;
		}
		if (passwd_textfield.value != passwd2_textfield.value) {
			(Ti.UI.createAlertDialog({message:L('password_mismatch')})).show();
			return;
		}
		var profileWindow = new (require('ui/account/RegisterProfileDetail'))({email:email_textfield.value,nickname:alias_textfield.value,pass:passwd_textfield.value});
		profileWindow.containingTab = self.containingTab;
		self.containingTab.open(profileWindow);
	});
	
	self.add(signup_form);
	self.setRightNavButton(next_btn);
	
	setTimeout(function(){
		//update culture
		Ti.Cloud.KeyValues.get({name:'culture'}, function(result) {
			if (result.keyvalues.length > 0) {
				var cultures_array = result.keyvalues[0].value.split(',');
				Ti.API.info('cultures array: ' + JSON.stringify(cultures_array));
				var new_culture_list = {};
				_(cultures_array).each(function(culture){
					//TODO only getting the top 100 results from DB cloud, need to upgrade this algorithm
					Ti.Cloud.Places.query({where:{"tags_array":culture},limit:100}, function(response) {
						if (response.places.length > 0) {
							_(response.places).each(function(place){
								if (!new_culture_list[culture]) {
									new_culture_list[culture] = {};
								}
								if (!new_culture_list[culture][place.state]) {
									new_culture_list[culture][place.state] = [];
								}
								Ti.Cloud.Checkins.query()
								new_culture_list[culture][place.state].push(place);
							});
							culture_list = new_culture_list;
							Ti.App.Properties.setString('CULTURE_LIST', JSON.stringify(culture_list));
						}
					});
				});
			}
		});
	},1);
	
	setTimeout(function() {
		//update nature
		Ti.Cloud.KeyValues.get({name:'nature'}, function(result){
			if (result.keyvalues.length > 0) {
				var natures_array = result.keyvalues[0].value.split(',');
				Ti.API.info('natures array: ' + JSON.stringify(natures_array));
				var new_nature_list = {};
				_(natures_array).each(function(nature){
					//TODO only getting the top 100 results from DB cloud, need to upgrade this algorithm
					Ti.Cloud.Places.query({where:{"tags_array":nature},limit:100}, function(response){
						if (response.places.length > 0) {
							_(response.places).each(function(place){
								if (!new_nature_list[nature]) {
									new_nature_list[nature] = {};
								}
								if (!new_nature_list[nature][place.state]) {
									new_nature_list[nature][place.state] = [];
								}
								new_nature_list[nature][place.state].push(place);
							});
							nature_list = new_nature_list;
							Ti.App.Properties.setString('NATURE_LIST', JSON.stringify(nature_list));
						}
					});
				});
			}
		});
	},1);
	
	setTimeout(function() {
		//update state
		Ti.Cloud.KeyValues.get({name:'state'}, function(result){
			if (result.keyvalues.length > 0) {
				var states_array = result.keyvalues[0].value.split(',');
				Ti.API.info('states array: ' + JSON.stringify(states_array));
				var new_state_list = {};
				_(states_array).each(function(state){
					//TODO only getting the top 100 results from DB cloud, need to upgrade this algorithm
					Ti.Cloud.Places.query({where:{"state":state, "tags_array":'城市风景'},limit:100}, function(response){
						// Ti.API.info('state_search_result: ' + JSON.stringify(response.places));
						if (response.places.length > 0) {
							_(response.places).each(function(place){
								if (!new_state_list[state]) {
									new_state_list[state] = {};
								}
								if (!new_state_list[state][place.city]) {
									new_state_list[state][place.city] = [];
								}
								new_state_list[state][place.city].push(place);
							});
							state_list = new_state_list;
							Ti.App.Properties.setString('STATE_LIST', JSON.stringify(state_list));
						}
					});
				});
			}
		});

	},1);
	
	return self;
};

module.exports = RegisterAccount;
