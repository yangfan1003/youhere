function NewPassWindow(title, save) {
	var customRows = require('rows').customTableRows;
		
	var self = Ti.UI.createWindow({
		backgroundColor:colors.bg2,
		title : title,
		barColor : colors.titlebar,
		tabBarHidden: true
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
	var inputData = [];
	inputData[0] = customRows.addTextFieldRow(L('account_pass'),  passwd_textfield,35);
	inputData[1] = customRows.addTextFieldRow(L('account_passconfirm'),  passwd2_textfield,35);
	var save_form = Titanium.UI.createTableView({top:0,width:300,height:210,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});
	
	self.add(save_form);
	
	var saveBtn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('save_button')
	});
	self.setRightNavButton(saveBtn);
	
	if (save) {
		saveBtn.addEventListener('click', function(e){
			// edit_textarea.blur();
			// save({save_value:edit_textarea.value});
			passwd_textfield.blur();
			passwd2_textfield.blur();
			save({pass1:passwd_textfield.value, pass2:passwd2_textfield.value});
		});
	}
	
	self.addEventListener('focus', function(e){
		passwd_textfield.focus;
	});
	
	return self;
};

module.exports = NewPassWindow;
