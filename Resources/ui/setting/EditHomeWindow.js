function EditHomeWindow(save) {
	var customRows = require('rows').customTableRows;
	var second_col_index = 0;
	var _account = {};
	
	var self = Ti.UI.createWindow({
		title:L('account_from'),
		barColor: colors.titlebar,
		backgroundColor:'white'
	});
	var home_label = Titanium.UI.createLabel({
		height : 30,
		width : 200,
		font : {
			fontSize : 16,
			fontWeight: 'bold' 
		},
		left:50,
		text: userMe.custom_fields.prov + ' ' + userMe.custom_fields.city
	});
	var inputData = [];
	inputData[0] = customRows.addLabelRow(L('account_from')+': ',  home_label,35, null);
	
	
	var signup_form = Titanium.UI.createTableView({top:0,width:290,height:210,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});
	self.add(signup_form);
	
	var saveBtn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('save_button')
	});
	self.setRightNavButton(saveBtn);
	if (save) {
		saveBtn.addEventListener('click', function(e){
			save({prov:_account.prov, city:_account.city});
		});
	}

	var picker = Ti.UI.createPicker({bottom:0,height:90});
	var column1 = Ti.UI.createPickerColumn({opacity:0});
	//var prov_data = ['北京','上海'];
	
	//column1.addRow(Ti.UI.createPickerRow({title:'贵州',strValue:'贵州'}));
	
	var prov_data = _(register_data).keys();
	_(prov_data).each(function(prov) {
		column1.addRow(Ti.UI.createPickerRow({title:prov}));
	});
	
	var column2 = Ti.UI.createPickerColumn();
	_(register_data['北京']).each(function(city){
		column2.addRow(Ti.UI.createPickerRow({title:city}));	
	});

	_account.prov = null;
	_account.city = null;
	
	picker.add([column1,column2]);
	
	
	// turn on the selection indicator (off by default)
	picker.selectionIndicator = true;
	picker.addEventListener('change',function(e)
	{
		_account.prov = e.selectedValue[0];
		_account.city = e.selectedValue[1];
		// province
		if (e.columnIndex == 0) {
			// _account.prov = e.row.title;
			var dynamic_rows = [];
			_(register_data[e.row.title]).each(function(city){
				dynamic_rows.push(Ti.UI.createPickerRow({title:city}));
			});
			column2.rows = dynamic_rows;
			picker.reloadColumn(column2);
			if (second_col_index+1 > dynamic_rows.length) {
				second_col_index = dynamic_rows.length - 1;
			}
			_account.city = dynamic_rows[second_col_index].title;
		}
		// city
		if (e.columnIndex == 1) {
			second_col_index = e.rowIndex;
		}
		Ti.API.info('prov: ' + _account.prov);
		Ti.API.info('city: ' + _account.city);
		home_label.text = _account.prov + ' ' + _account.city;
	});
	
	self.add(picker);
	
	return self;
};

module.exports = EditHomeWindow;