function ChatGroupWindow(title) {
	var self = Ti.UI.createWindow({
		title:title,
		barColor: colors.titlebar,
		backgroundColor:'white'
	});

	var target_array = [];
	
	var friendTable = Ti.UI.createTableView({bottom:0});
	friendTable.addEventListener('singletap', function(e){
		if (e.row) {
			if (e.source.isAvatar) {
				showUserProfile(e.row.userobj);
			}
			else {
				loadChat(e.row.userobj);
			}	
		}
	});

	self.add(friendTable);

	function showUserProfile(user) {
		var UserProfileClass = require('/ui/setting/SettingWindow');
		var userProfile = new UserProfileClass(user, false);
		userProfile.containingTab = self.containingTab;
		self.containingTab.open(userProfile);
	}

	function loadChat(user) {
		var ChatWindowClass = require('/ui/chat/ChatWindow');
		var chatWin = new ChatWindowClass(user, self.containingTab);
		// chatWin.containingTab = self.containingTab;
		self.containingTab.open(chatWin);
	}

	function updateFriendTable() {
		var rows = [];
		if (target_array.length < 0) { return; }
		_(target_array).each(function(user) {
			var row = Ti.UI.createTableViewRow({
				className : user.id,
				userobj: user,
				height : 80,
				hasChild : true
			});
			var rowView = Ti.UI.createView({
				backgroundColor : 'transparent',
				left : 0,
				height : 70
			});
	
			rowView.add(Ti.UI.createLabel({
				text : user.first_name,
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
				text : user.custom_fields.prov + ' ' + user.custom_fields.city,
				left : 70,
				font : {
					fontSize : 12
				},
				top:25,
				color: '777777'
			}));
			rowView.add(Ti.UI.createButton({
				height:15,
				width:30,
				top:25,
				left:135,
				title:ageString,
				font:{fontSize:12,fontWeight:'bold'},
				style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
				backgroundColor: (user.custom_fields.sex=='MALE')?'#70C7FF':'pink'
				}));			
			rowView.add(Ti.UI.createLabel({
				text : user.custom_fields.mood,
				left : 70,
				font : {
					fontSize : 12
				},
				top: 45,
				color: '777777'
			}));
	
			var lat1 = myGPS.latitude;
			var lon1 = myGPS.longitude;
			var lat2 = user.custom_fields.coordinates[0][1]; //place.latitude;
			var lon2 = user.custom_fields.coordinates[0][0]; //place.longitude;
	
			var R = 6371;
			// km
			var d = Math.round(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R);
			
			rowView.add(Ti.UI.createLabel({
				text : isNaN(d)?'0 km':d + ' km',
				top : 25,
				left: 170,
				font : {
					fontSize : 14,
				},
				color: '777777'
			}));
			var online_status = L('online');
			if (user.custom_fields.online == 0) {
				var last_seen_datetime = new Date(user.updated_at.replace(/-/g, '/').replace('T',' '));
				var now = new Date();
				var diff = now.getTime() - last_seen_datetime.getTime();
				// Ti.API.info('last seen : ' + diff + ' milliseconds ago');
				
				var days = Math.floor(diff / (24 * 60 * 60 * 1000));
				var hours = Math.floor(diff / (60*60*1000));
				var minutes = Math.floor(diff / (60*1000));
				if (days > 0) {
					online_status = days + L('days') + L('ago');
				}
				else if (hours > 0) {
					online_status = hours + L('hours') + L('ago');
				}
				else {
					online_status = minutes + L('minutes') + L('ago');
				}
			}
			rowView.add(Ti.UI.createLabel({
				text : online_status,
				right: 20,
				font : {
					fontSize : 12
				},
				top:25,
				color: '777777'
			}));

			var imageUrl = (user.photo)?user.photo.urls.square_75:null;
			var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:8, top:6, height:52, width:52,borderRadius:24});
			var bubble_imgView = Ti.UI.createImageView({left:0, top:0, height:70, width:70,
								backgroundColor:'transparent',
								borderColor:'transparent',
								backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
			
			bubble_imgView.isAvatar = true;
			avatar_imgView.isAvatar = true;
			
			rowView.add(avatar_imgView);
			rowView.add(bubble_imgView);
			
			row.add(rowView);
			rows.push(row);
		});
		friendTable.setData(rows);
	}

	function reloadChatGroups() {
		Ti.API.info('loading chat groups')
		Ti.Cloud.Chats.getChatGroups({order:'-updated_at', limit:100},function(groups_result){
			if (groups_result.success && groups_result.meta.code==200) {
				var chatters_array = [];
				_(groups_result.chat_groups).each(function(chat_group){
					var users_array = chat_group.participate_users;
					// assuming two users per array
					if (users_array.length == 2) {
						if (users_array[0].id == userMe.id) {
							if(users_array[1].first_name)
								chatters_array.push(users_array[1]);
						}
						else {
							if (users_array[0].first_name)
								chatters_array.push(users_array[0]);
						}
					}
				});
				target_array = chatters_array;
				updateFriendTable();
			}
		});
	}

	self.addEventListener('focus', function(e){
		reloadChatGroups();
	});
	
	self.addEventListener('open', function(e){
	});

	reloadChatGroups();
	
	return self;
};

module.exports = ChatGroupWindow;
