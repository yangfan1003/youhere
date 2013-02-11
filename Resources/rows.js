/* ### Custom Table Rows */
function CustomTableRows() {
	
}

var p = CustomTableRows.prototype;


p.addTextFieldRow = function (title, obj, height) {
		var row = Ti.UI.createTableViewRow({backgroundColor:'white', height:height,font:{fontSize : 12},color : '#222'});
		if (title) {
			row.title = title;			
		}
		row.add(obj);
		if (Ti.Platform.osname == 'android') {
			row.add(Ti.UI.createLabel({text:title,left:10, font:{fontSize : 12},color : '#222'}));
		}
		row.className = title;
		return row;
};

p.addSwitchRow = function (title, swValue, handler) {
		var row = Ti.UI.createTableViewRow({height:35, title:title,font:{fontSize : 12},color : '#222'});
		var sw = Ti.UI.createSwitch({right:10,value:swValue});
		row.add(sw);
		if (Ti.Platform.osname == 'android') {
			row.add(Ti.UI.createLabel({text:title,left:10, font:{fontSize : 12},color : '#222'}));
		}
		sw.addEventListener('change', function(e) {
			handler(e);
		});
		row.className = title;
		return row;
};
p.addTitleRow = function (title, height, handler) {
		var row = Ti.UI.createTableViewRow({height:height, backgroundColor:"white", title:title,font:{fontSize : 12},color : '#777'});
		row.addEventListener('click', function(e) {
			handler(e);
		});
		row.className = title;
		row.hasChild = true;
		return row;
};
p.addLabelRow = function (title, label, height, handler) {
		var row = Ti.UI.createTableViewRow({title:title, backgroundColor:'white',height:height,font:{fontSize : 12},color : '#222'});
		if (label) {
			row.add(label);
		}
		if (handler) {
			row.addEventListener('click', function(e) {
				handler(e);
			});
		}
		if (Ti.Platform.osname == 'android') {
			row.add(Ti.UI.createLabel({text:title,left:10, font:{fontSize : 12},color : '#222'}));
		}
		row.className = title;
		return row;
};
p.addButtonRow = function (button, height, handler) {
		var row = Ti.UI.createTableViewRow({backgroundColor:'transparent',height:height,font:{fontSize : 12},color : '#777'});
		row.add(button);
		row.addEventListener('click', function(e) {
			handler(e);
		});
		if (Ti.Platform.osname == 'android') {
			row.add(Ti.UI.createLabel({text:title,left:10, font:{fontSize : 12},color : '#777'}));
		}
		row.className = button.title;
		// row.hasChild = true;
		return row;
};

p.addSliderRow = function (title, slider_label, min, max, value, change, touchend) {
		var row = Ti.UI.createTableViewRow({height:50, title:title});
		var slider = Ti.UI.createSlider({			
			min : min,
			max : max,
			value : value,
			width : 140,
			height : 'auto'
		});
		row.add(slider);
		slider_label.top = slider.top;
		slider_label.left = 230;
		row.add(slider_label);
		slider.addEventListener('change', function(e) {
			change(e);
		});
		slider.addEventListener('touchend', function(e){
			touchend(e);
		})
		if (Ti.Platform.osname == 'android') {
			row.add(Ti.UI.createLabel({text:title,left:10, font:{fontSize : 12},color : '#777'}));
		}
		row.className = title;
		return row;
};

p.addProfileRow = function (user, isMe, handler) {
		var row = Ti.UI.createTableViewRow({height:100,backgroundColor:'white'});
		// var avatar_imgView = Ti.UI.createImageView({image:'/images/empty_avatar.png', 
			// height:75, width:75, left:10});

		var avatar_imgView = Ti.UI.createImageView({image: '/images/empty_avatar.png', left:12, top:16, height:52, width:52,borderRadius:24});
		var bubble_imgView = Ti.UI.createImageView({left:4, top:10, height:70, width:70,
							backgroundColor:'transparent',
							borderColor:'transparent',
							backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});

		if (user && user.photo) {
			Ti.API.info('user photo: ' + JSON.stringify(user.photo));
			avatar_imgView.image = user.photo.urls.square_75;
		}
		
		row.add(avatar_imgView);
		row.add(bubble_imgView);
		
		if (handler)
		{
			row.hasChild = isMe;
			if (isMe) {
				row.addEventListener('click', function(e) {
					handler(e);
				});
			}
			var nicknameLabel = Ti.UI.createLabel({text: user.first_name, top:5, left:100});
			row.add(nicknameLabel);
			ageString = L('age_'+user.custom_fields.age+'s');
			
			row.add(Ti.UI.createLabel({text:L('age_label')+': ', font:{fontSize:12},color:'#555', top:30, left:100}));
			// row.add(Ti.UI.createLabel({text:ageString,backgroundColor:'blue,', font:{fontSize:12},color:'white', top:30, left:100}));
			row.add(Ti.UI.createButton({
				height:15,
				width:30,
				top:30,
				left:135,
				title:ageString,
				font:{fontSize:12,fontWeight:'bold'},
				style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
				backgroundColor: (user.custom_fields.sex=='MALE')?'#70C7FF':'pink'
				})
			);
			
			row.add(Ti.UI.createLabel({text:L('call_number')+':  ' + user.username,font:{fontSize:12},color:'#555', top:50, left:100}));
			row.add(Ti.UI.createLabel({text:L('account_from')+':  ' + user.custom_fields.prov + ' ' + user.custom_fields.city, font:{fontSize:12},color:'#555', top:70, left:100}));
		}
		else {
			row.add(Ti.UI.createLabel({text:L('call_number') +': '+user.username,top:20, left:120,font:{fontSize:14,fontWeight:'bold'}}));
		}
		row.className = user.id;
		return row;
};

p.addAvatarsRow = function (photoArray, isMe, delete_handler, add_handler, click_handler) {
		var row = Ti.UI.createTableViewRow({height:'auto'});
		var max = photoArray.length;
		for (i=0; i<=max;i++) {
			y = Math.floor(i/4);
			x = i % 4;
			// Ti.API.info('x: ' + x + ' y: ' + y);
			if (i==max) {
				if (isMe) {
					var avatar_imgView = Ti.UI.createImageView({image:'/images/addAvatar.png', 
						height:60, width:60, left: x*65+10, top: y*65+10});
					
					avatar_imgView.addEventListener('click', function(e) {
						add_handler(e);
					});
					row.add(avatar_imgView);
				}
				row.height = (y*65+10) + 70;
			}
			else {
				var avatar_imgView = Ti.UI.createImageView({image:photoArray[i].urls.square_75, 
					height:60, width:60, left: x*65+10, top: y*65+10, scroll_index:i});
			
				avatar_imgView.photo_obj = photoArray[i];
				if (isMe && delete_handler) {
					avatar_imgView.addEventListener('longpress', function(e) {
						delete_handler(e);
					});
				}
				if (click_handler) {
					avatar_imgView.addEventListener('singletap', function(e){
						click_handler(e);
					})
				}
				row.add(avatar_imgView);		
			}
		}
		row.hasChild = false;
		return row;
};

p.addLogPhotoRow = function (statusesArray, handler) {
		var row = Ti.UI.createTableViewRow({top:0, height:'auto'});
		var max = statusesArray.length;
		for (i=0; i<max;i++) {
			// Ti.API.info('statusesArray keys: ' + JSON.stringify(_(statusesArray[i]).keys()));
			y = Math.floor(i/3);
			x = i % 3;
			var avatar_imgView = Ti.UI.createImageView({image:statusesArray[i].photo.urls.square_75,
				height:60, width:60, left: x*65+5, top: y*65+5});
			avatar_imgView.status_obj = statusesArray[i]
			// Ti.API.info('inserting status obj: ' + JSON.stringify(statusesArray[i]));
			row.add(avatar_imgView);
			if (i==max-1) {
				row.height = avatar_imgView.top + 70;
			}
			if (handler) {
				avatar_imgView.addEventListener('click', function(e) {
					handler(e);
				});
			}
		}
		row.hasChild = false;
		return row;
};

	
exports.customTableRows = new CustomTableRows();