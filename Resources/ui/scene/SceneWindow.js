//Tidy up button bars
function SceneWindow(title) {
	// var colors = require('/ui/common/Colors');
	// var _ = require('underscore')._;
	// var youhere = require('ti.youhere');
	// var imageCache = require('CachedImageView').cache;
	
	var nature_list = (Ti.App.Properties.getString('NATURE_LIST'))?JSON.parse(Ti.App.Properties.getString('NATURE_LIST')):{'海岛':{'海南':[],'福建':[],'香港':[]},'山岳':{'山东':[],'陕西':[],'江苏':[]}};
	var culture_list = (Ti.App.Properties.getString('CULTURE_LIST'))?JSON.parse(Ti.App.Properties.getString('CULTURE_LIST')):{'古镇':{'江苏':[]}};
	var state_list = (Ti.App.Properties.getString('STATE_LIST'))?JSON.parse(Ti.App.Properties.getString('STATE_LIST')):{'江苏':[]};
	favs_array = (Ti.App.Properties.getString('FAVORITES_LIST'))?JSON.parse(Ti.App.Properties.getString('FAVORITES_LIST')):[];
	// Ti.API.info('favs_array from app properties: ' + JSON.stringify(favs_array));

	var view_mode = 'natscene';

	var self = Ti.UI.createWindow({
		title : title,
		barColor : colors.titlebar,
		backgroundColor : 'white'
	});

	var fav = Ti.UI.createButton({
		title : L('fav'),
		backgroundColor : colors.button_col1,
		height : 33,
		width : 33
	});
	self.setRightNavButton(fav);

	var self_view = Ti.UI.createView({
		backgroundColor : colors.bg,
		top : 0,
		height : self.height,
		width : self.width
	});

	var SModeSwitch = Ti.UI.createView({
		backgroundColor : colors.bg2,
		top : 0,
		height : 60,
		width : self.width
	});

	var SModeSwitch_bar = youhere.createGreenSegmentView({
		// labels : [L('category'), L('daren')],
		width : 180,
		height : 40,
		top : 10,
		left:86,
		color: 'transparent',
	});
	var searchBtn = Ti.UI.createImageView({right:16,image:'/images/search_action.png'});
	
	SModeSwitch.add(SModeSwitch_bar);
	SModeSwitch.add(searchBtn);
	//Tidy up later! (Get it to look better)
	self_view.add(SModeSwitch);

	var search_bar = Titanium.UI.createSearchBar({
		barColor : colors.bg,
		showCancel : false,
		height : 40,
		top : 55,
		hintText : L('searchbar'),
		visible: false,
		borderColor : colors.bg
	});

	var search_barView = Ti.UI.createView({
		backgroundColor : 'transparent',
		top : 0,
		height : 200
	})
	self_view.add(search_bar);

	var search_CategoryBar = youhere.createOrangeSegmentView({
	    // labels : [L('natscene'), L('travcity'), L('cultland'), {tintColor:'green'}],
	    width:270,
	    height:45,
	    top:100,
	    left:27,
	    color: 'transparent'
	});
	self_view.add(search_CategoryBar);

	//Temp view for H picker area
	var search_PickerView = Ti.UI.createView({
		backgroundColor : 'transparent',
		top : 140,
		height : 170,
	});
	self_view.add(search_PickerView);
	var pickerView1 = youhere.createPickerView({
		width : 300,
		height : 140,
		top : -60,
		left : 0,
		color : 'transparent',
		data: _(nature_list).keys(),
		layout : 'vertical'
	});
	var cat_1 = pickerView1.data[0];
	Ti.API.info('picker1 begin: ' + cat_1);
	var pickerView2 = youhere.createPickerView({
		width : 300,
		height : 180,
		top : 15,
		left : 0,
		color : 'transparent',
		data: _(nature_list[_(nature_list).keys()[0]]).keys(),
		layout : 'vertical'
	});

	var cat_2 = pickerView2.data[0];
	Ti.API.info('picker2 begin: ' + cat_2);
	search_PickerView.add(pickerView2);
	search_PickerView.add(pickerView1);

	var search_Submit = Titanium.UI.createButton({
		title : L('submitresults'),
		bottom : 20,
		height : 30,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
		// backgroundImage: 'images/button_orange.png'
	});
	self_view.add(search_Submit);

	var search_resultsView = Ti.UI.createView({
		backgroundColor : colors.bg,
		bottom : 0,
		height : 300
	});

	var table = Ti.UI.createTableView();

	var Daren_photoicon = Ti.UI.createImageView({
		bottom : 30,
		right : 30,
		image : '/images/camera-logo.gif'
	});

	var Daren_view = Ti.UI.createView({
		backgroundColor : 'transparent',
		bottom : 0,
		height : 300,
	});
	Daren_view.add(Daren_photoicon);

	var Suggest_pickerTopView = Ti.UI.createView({
		backgroundColor : colors.bg3,
		opacity : 0.75,
		top : 0,
		height : 120
	});

	var Suggest_picker = Ti.UI.createPicker({
		bottom : 0
	});

	function addRow(text) {
		var row = Ti.UI.createPickerRow({
			id : text
		});
		var label = Ti.UI.createLabel({
			text : text,
			textAlign : 'center',
			height : 'auto'
		});
		row.add(label);
		Suggest_picker.add(row);
	}

	addRow('湖南');
	addRow('江苏');
	addRow('海南');
	addRow('浙江');
	addRow('重庆');
	addRow('四川');

	var Suggest_pickerBottomView = Ti.UI.createView({
		backgroundColor : colors.bg3,
		borderColor : colors.bg3,
		bottom : 0,
		height : 250
	});

	var Suggest_pickerCancel = Ti.UI.createButton({
		title : L('cancel'),
		height : 33,
		width : 60,
		top : 0,
		left : 15
	});

	var Suggest_pickerAccept = Ti.UI.createButton({
		title : L('accept'),
		height : 33,
		width : 60,
		top : 0,
		right : 15
	});

	Suggest_picker.selectionIndicator = true;
	Suggest_pickerBottomView.add(Suggest_picker);
	Suggest_pickerBottomView.add(Suggest_pickerCancel);
	Suggest_pickerBottomView.add(Suggest_pickerAccept);

	self.add(self_view);

	//EventListeners:

	pickerView1.addEventListener('rowChanged', function(e){
		if (e.rowData == cat_1) { return; }
		cat_1 = e.rowData;
		Ti.API.info('picker 1 selected: ' + cat_1);	
		if (view_mode == 'natscene') {
			pickerView2.data = _(nature_list[cat_1]).keys();
			cat_2 = pickerView2.data[0];
			Ti.API.info('picker 2 selected: ' + cat_2);	
		}
		else if (view_mode == 'travcity') {
			pickerView2.data = _(state_list[cat_1]).keys();
			cat_2 = pickerView2.data[0];
			Ti.API.info('picker 2 selected: ' + cat_2);	
		}
		else if (view_mode == 'cultland') {
			pickerView2.data = _(culture_list[cat_1]).keys();
			cat_2 = pickerView2.data[0];
			Ti.API.info('picker 2 selected: ' + cat_2);	
		}
	});
	pickerView2.addEventListener('rowChanged', function(e){
		cat_2 = e.rowData;
		Ti.API.info('picker 2 selected: ' + cat_2);	
	});

	search_CategoryBar.addEventListener('click', function(e){
		Ti.API.info('clicked e: ' + JSON.stringify(e));
		switch (e.index) {
			case 0:
				Ti.API.info('clicked nature');
				view_mode = 'natscene';
				pickerView1.data = _(nature_list).keys();
				pickerView2.data = _(nature_list[_(nature_list).keys()[0]]).keys();
				cat_1 = pickerView1.data[0]; 
				cat_2 = pickerView2.data[0];
				break;
			case 1:
				Ti.API.info('clicked state');
				view_mode = 'travcity';
				pickerView1.data = _(state_list).keys();
				pickerView2.data = _(state_list[_(state_list).keys()[0]]).keys();
				cat_1 = pickerView1.data[0]; 
				cat_2 = pickerView2.data[0];
				break;
			case 2:
				Ti.API.info('clicked culture');
				view_mode = 'cultland';
				pickerView1.data = _(culture_list).keys();
				pickerView2.data = _(culture_list[_(culture_list).keys()[0]]).keys();
				cat_1 = pickerView1.data[0]; 
				cat_2 = pickerView2.data[0];
				break;
		}
	});

	SModeSwitch_bar.addEventListener('click', function(e) {
		switch (e.index) {
			case 0:
				table.setData([]);
				self.remove(search_resultsView);
				self.remove(Daren_view);
				self.remove(Suggest_pickerBottomView);
				self.remove(Suggest_pickerTopView);
				self_view.add(SModeSwitch);
				search_bar.value = '';
				self.add(self_view);
				search_bar.visible = false;
				searchBtn.visible = true;
				self.setTitle(L('lscene'));
				break;
			case 1:
				table.setData([]);
				self.remove(search_resultsView);
				self.remove(self_view);
				self.remove(Suggest_pickerBottomView);
				self.remove(Suggest_pickerTopView);
				self.add(SModeSwitch);
				search_bar.visible = false;
				self.add(Daren_view);
				break;
			case 2:
				table.setData([]);
				self.remove(search_resultsView);
				self.add(Suggest_pickerTopView);
				self.add(Suggest_pickerBottomView);
				self.setTitle(L('sug'));
				Suggest_picker.setSelectedRow(0, 0, false);
				break;
		}
	});

	searchBtn.addEventListener('click', function(){
		search_bar.visible = true;
		search_bar.focus();
	});

	search_bar.addEventListener('focus', function() {
		self_view.add(search_barView);
	})

	search_bar.addEventListener('change', function() {
		hintText = '';
	});

	function queryAndShow(query_Dict) {
		var rows = [];
		Ti.API.info('query is: ' + JSON.stringify(query_Dict));
		Ti.Cloud.Places.query(query_Dict, function(result) {
			Ti.API.info(JSON.stringify(result));
			_(result.places).each(function(place) {
				Ti.API.info(JSON.stringify(place));
				var row = Ti.UI.createTableViewRow({
					className : place.id,
					placeobj : place,
					height : 70,
					hasChild : true
				});
				var rowView = Ti.UI.createView({
					backgroundColor : 'transparent',
					left : 0,
					height : 70
				});

				rowView.add(Ti.UI.createLabel({
					text : place.name,
					left : 70,
					top: 3,
					width : 200,
					color: 'black',
					textAlign : 'left',
					font : {
						fontSize : 16
					}
				}));
				rowView.add(Ti.UI.createLabel({
					text : L('scene_area_heading') + ': ' + place.state + ' ' + place.city,
					left : 70,
					font : {
						fontSize : 12
					},
					bottom: 10,
					color: '777777'
				}));
				rowView.add(Ti.UI.createLabel({
					text : L('scene_type_heading') + ': ' + L(view_mode) + ' - ' + index_1,
					left : 70,
					font : {
						fontSize : 12
					},
					top: 30,
					color: '777777'
				}));

				var lat1 = myGPS.latitude;
				var lon1 = myGPS.longitude;
				var lat2 = place.latitude;
				var lon2 = place.longitude;

				var R = 6371;
				// km
				var d = Math.round(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R);

				rowView.add(Ti.UI.createLabel({
					text : ('' + d + ' km'),
					top : 30,
					right : 20,
					font : {
						fontSize : 14,
					},
					color: '777777'
				}));

				var imageUrl = place.photo.urls.square_75;
				rowView.add(Ti.UI.createImageView({
					image : imageUrl,
					height : 65,
					width : 65,
					top : 2,
					left : 4
				}));
				row.add(rowView);
				rows.push(row);
			});
			table.setData(rows);
			search_resultsView.add(table);
		});
	}

	function localQueryAndShow(list, index_1, index_2) {
			var rows = [];
			Ti.API.info('refreshing table');
			_(list[index_1][index_2]).each(function(place) {
				Ti.API.info(JSON.stringify(place));
				var row = Ti.UI.createTableViewRow({
					className : place.id,
					placeobj : place,
					height : 70,
					hasChild : true
				});
				var rowView = Ti.UI.createView({
					backgroundColor : 'transparent',
					left : 0,
					height : 70
				});

				rowView.add(Ti.UI.createLabel({
					text : place.name,
					left : 70,
					top: 3,
					width : 200,
					color: 'black',
					textAlign : 'left',
					font : {
						fontSize : 16
					}
				}));
				rowView.add(Ti.UI.createLabel({
					text : L('scene_area_heading') + ': ' + place.state + ' ' + place.city,
					left : 70,
					font : {
						fontSize : 12
					},
					bottom: 10,
					color: '777777'
				}));
				rowView.add(Ti.UI.createLabel({
					text : L('scene_type_heading') + ': ' + L(view_mode) + ' - ' + index_1,
					left : 70,
					font : {
						fontSize : 12
					},
					top: 30,
					color: '777777'
				}));

				var lat1 = myGPS.latitude;
				var lon1 = myGPS.longitude;
				var lat2 = place.latitude;
				var lon2 = place.longitude;

				var R = 6371;
				// km
				var d = Math.round(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R);

				rowView.add(Ti.UI.createLabel({
					text : ('' + d + ' km'),
					top : 30,
					right : 20,
					font : {
						fontSize : 14,
					},
					color: '777777'
				}));

				var imageUrl = place.photo.urls.square_75;
				rowView.add(Ti.UI.createImageView({
					image : imageUrl,
					height : 65,
					width : 65,
					top : 2,
					left : 4
				}));

				row.add(rowView);
				rows.push(row);
			});
			table.setData(rows);
			search_resultsView.add(table);
	}

	function search_resultsDetail(place) {
		var DetailPlaceWindowClass = require('/ui/scene/DetailSceneWindow');
		var clickedPlace = new DetailPlaceWindowClass(place);
		clickedPlace.containingTab = self.containingTab;
		self.containingTab.open(clickedPlace);
	}


	table.addEventListener('click', function(e) {
		Ti.API.info('entering table event ');
		search_resultsDetail(e.row.placeobj);
	});

	search_bar.addEventListener('return', function(e) {
		self.remove(self_view);
		self.add(SModeSwitch);
		self.add(search_resultsView);
		self.setTitle(L('results'));
		SModeSwitch_bar.index = -1;		
		queryAndShow({
			where : {
				"name" : {
					"$regex" : "^.*" + e.value
				}
			},
			//TODO change number of results displayed
			per_page : 20
		});
	});

	search_barView.addEventListener('click', function() {
		search_bar.blur();
		search_bar.visible = false;
		self_view.remove(search_barView)
	});

	search_Submit.addEventListener('click', function() {
		self.remove(self_view);
		self.add(SModeSwitch);
		self.add(search_resultsView);
		SModeSwitch_bar.index = -1;		
		searchBtn.visible = false;
		self.setTitle(L('results'));
		if (view_mode == 'travcity') {
			//TODO upload data to DB cloud to test state/city
			// queryAndShow({where : {"state" : cat_1,"city": cat_2},per_page : 50});
			var target_list = state_list;
			if (target_list[cat_1] && target_list[cat_1][cat_2]) {
				localQueryAndShow(target_list, cat_1, cat_2);
			}
			else {
				//TODO change number
				queryAndShow({where : {"state" : cat_1,"city": cat_2},per_page : 50});
			}
		}
		else {
			var target_list = (view_mode=='natscene')?nature_list:culture_list;
			if (target_list[cat_1] && target_list[cat_1][cat_2]) {
				localQueryAndShow(target_list, cat_1, cat_2);
			}
			else
				queryAndShow({where : {"tags_array" : cat_1,"state": cat_2},per_page : 100});
			
		}
	});

	Suggest_pickerTopView.addEventListener('click', function() {
		self.remove(Suggest_pickerTopView);
		self.remove(Suggest_pickerBottomView);
		self.setTitle(L('lscene'))
	});

	var Suggest_value;
	Suggest_picker.addEventListener('change', function(e) {
		Suggest_value = e.row.id;
		Ti.API.info(Suggest_value)
	});

	Suggest_pickerCancel.addEventListener('click', function() {
		self.remove(Suggest_pickerTopView);
		self.remove(Suggest_pickerBottomView);
		self.setTitle(L('lscene'))
	});

	Suggest_pickerAccept.addEventListener('click', function(e) {
		self.remove(Suggest_pickerTopView);
		self.remove(Suggest_pickerBottomView);
		self.add(search_resultsView);
		self.add(SModeSwitch);
		self.setTitle(L('results'));
		queryAndShow({
			where : {
				state : Suggest_value
			},
			per_page : 20
		});
	});

	fav.addEventListener('click', function() {
		//containingTab attribute must be set by parent tab group on
		//the window for this work
		// self.containingTab.open(favorites);
		var favoritesWindow = require('/ui/scene/FavoritesWindow');
		var favWin = new favoritesWindow();
		favWin.containingTab = self.containingTab;
		self.containingTab.open(favWin);
	});

	setTimeout(function(){
		Ti.Cloud.Reviews.query({user_id:userMe.id, limit:100}, function(result){
			Ti.API.info('favorites reviews result: ' + JSON.stringify(result));
			if (result.reviews.length >= 0) {
				var new_favs_list = [];
				_(result.reviews).each(function(review){
					var place_obj_str = review.custom_fields.place_obj;
					if (place_obj_str) {
						var place_obj = JSON.parse(place_obj_str);
						new_favs_list.push(place_obj);
					}
				});
				favs_array = new_favs_list;
				Ti.App.Properties.setString('FAVORITES_LIST', JSON.stringify(new_favs_list));
			}
		});
	}, 1);
	
	Ti.API.info('userMe custom fields: ' + JSON.stringify(userMe.custom_fields));

	return self;
};

module.exports = SceneWindow;
