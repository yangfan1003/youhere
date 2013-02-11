function EditSaveWindow(title, value, save) {
		
	var self = Ti.UI.createWindow({
		backgroundColor:colors.bg2,
		title : title,
		barColor : colors.titlebar,
		tabBarHidden: true
	});
	var edit_textarea = Ti.UI.createTextArea({width:280, height:120,top:10,scrollable:true});
	self.add(edit_textarea);
	
	if (value) {
		edit_textarea.value = value;
	}

	var saveBtn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('save_button')
	});
	self.setRightNavButton(saveBtn);
	
	if (save) {
		saveBtn.addEventListener('click', function(e){
			edit_textarea.blur();
			save({save_value:edit_textarea.value});
		});
	}
	
	self.addEventListener('focus', function(e){
		edit_textarea.focus();
	});
	
	return self;
};

module.exports = EditSaveWindow;
