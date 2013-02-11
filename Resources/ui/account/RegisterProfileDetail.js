function RegisterProfileDetail(account) {
	var customRows = require('rows').customTableRows;
	var _account = account;
	_account.sex = 'MALE';
	_account.age = 60;
	var sexTypes = ['MALE', 'FEMALE'];
	var ageTypes = [60, 70, 80, 90];
	var second_col_index = 0;
	
	var self = Ti.UI.createWindow({
		title:L('register_label'),
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
		text: ''
	});
	var inputData = [];
	inputData[0] = customRows.addLabelRow(L('account_from')+': ',  home_label,35, null);
	
	
	var signup_form = Titanium.UI.createTableView({top:0,width:290,height:210,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});
	self.add(signup_form);
	
	var next_btn = Ti.UI.createButton({
		height:45,
		width:80,
		title: L('next')
	});
	self.setRightNavButton(next_btn);
	var sex_Bar = youhere.createOrangeSexSegmentView({
		width : 280,
		height : 40,
		top : 60,
		left:24,
		color: 'transparent',
	});
	var age_Bar = youhere.createOrangeAgeSegmentView({
		width : 280,
		height : 40,
		top : 105,
		left:24,
		color: 'transparent',
	});
	self.add(sex_Bar);
	self.add(age_Bar);

	sex_Bar.addEventListener('click', function(e){
		_account.sex = sexTypes[e.index];
		Ti.API.info('account sex: ' + _account.sex);	
	});
	age_Bar.addEventListener('click', function(e){
		_account.age = ageTypes[e.index];
		Ti.API.info('account age: ' + _account.age);
	});

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

	next_btn.addEventListener('click', function(e){
		if (!_account.prov || !_account.city) {
			return;
		}
		var photoWindow = new (require('ui/account/RegisterPhoto'))(_account);
		photoWindow.containingTab = self.containingTab;
		self.containingTab.open(photoWindow);
	});
	
	return self;
};

module.exports = RegisterProfileDetail;
