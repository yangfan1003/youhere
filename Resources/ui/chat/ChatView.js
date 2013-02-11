function Class(conTab) {
	this.chatView = Ti.UI.createTableView({top:0,
					left:0,
					bottom: 55,
					minRowHeight:30,
					backgroundColor:'transparent',
					backgroundFocusedColor:'transparent',
					backgroundSelectedColor:'transparent',
					separatorColor:'transparent'});
	this.msg_count = 0;
	this.prev_msg_height = 20;
	this.containingTab = conTab;
	// this.is_daylight = ((new Date()).getHours() < 18 && (new Date()).getHours() > 8)?true:false;
	
}
var p = Class.prototype;

p.setData = function(data) {
	var new_data = [];
	
	for (var c=0;c<data.length;c++)
	{
		var row;
		switch (data[c]['from'].id == userMe.id) {
			case true: 
				if (data[c].custom_fields) {
					if (data[c].custom_fields.coordinates) {
						Ti.API.info('coordinates message');
						row = this._createSendGPSView(data[c]['id'], data[c].custom_fields.coordinates, data[c]['from'], data[c]['created_at']);
					}
				}
				else if (data[c].photo && data[c].photo.urls) {
					Ti.API.info('photo path: ' + data[c].photo.urls.small_240);
					row = this._createSendImageView(data[c]['id'], data[c].photo.urls, userMe, data[c]['created_at']);
				}
				else {
					row = this._createSendMessageView(data[c]['id'], data[c]['message'], userMe, data[c]['created_at']);
				}
				break;
			case false:
				if (data[c].custom_fields) {
					if (data[c].custom_fields.coordinates) {
						Ti.API.info('coordinates message');
						row = this._createReceiveGPSView(data[c]['id'], data[c].custom_fields.coordinates, data[c]['from'], data[c]['created_at']);
					}
				}
				else if (data[c].photo && data[c].photo.urls) {
					Ti.API.info('photo path: ' + data[c].photo.urls.small_240);
					row = this._createReceiveImageView(data[c]['id'], data[c].photo.urls, data[c]['from'], data[c]['created_at']);
				}
				else {
					row = this._createReceiveMessageView(data[c]['id'], data[c]['message'], data[c]['from'], data[c]['created_at']);
				}
				break;
		}  
		new_data[c] = row;
	}
	this.msg_count = data.length;
	this.chatView.data = new_data;
	// scroll to bottom without animation so it looks quicker and quieter
	this.scrollToBottom();
}


p.shortTimeFormat = function(timestamp) {
	var time = new Date(timestamp);
	var hours = time.getHours();
	var minutes = time.getMinutes();
	if (minutes < 10){
		minutes = "0" + minutes
	}
	var timeString = hours + ":" + minutes + " ";
	if(hours > 11){
		timeString += "PM";
	} else {
		timeString += "AM";
	}
	
	return timeString;
}

p.sendMessage = function(payload){
	var newRowView = this._createSendMessageView(payload['id'], payload['message'], payload['from'], payload['created_at']);
	this.msg_count++;
	this.chatView.appendRow(newRowView);
	this.scrollToBottom();
};

p.sendGPSMessage = function(payload) {
	var newRowView = this._createSendGPSView(payload['id'], payload.custom_fields.coordinates, payload['from'], payload['created_at']);
	this.msg_count++;
	this.chatView.appendRow(newRowView);
	this.scrollToBottom();
}

p.sendImage = function(payload, photo_urls) {
	var newRowView = this._createSendImageView(payload['id'], photo_urls, payload['from'], payload['created_at']);	
	this.msg_count++;
	this.chatView.appendRow(newRowView);
	this.scrollToBottom();
}

p.messageCount = function() {
	return this.msg_count;
}

p.addEventListener = function(name, callback) {
	this.chatView.addEventListener(name, function(){
		callback();
	});
}

p.receiveImage = function(payload, photo_urls){ // imgView is the thumb nail view of the original(big) image, refereced by big_img_id
	var newRowView = this._createReceiveImageView(payload['id'], photo_urls, payload['from'], payload['created_at']);
	this.msg_count++;
	this.chatView.appendRow(newRowView);
	this.scrollToBottom();
}

p.receiveMessage = function(payload){
	var newRowView = this._createReceiveMessageView(payload['id'], payload['message'], payload['from'], payload['created_at']);
	this.msg_count++;
	this.chatView.appendRow(newRowView);
	this.scrollToBottom();
};

p.receiveGPSMessage = function(payload) {
	var newRowView = this._createReceiveGPSView(payload['id'], payload.custom_fields.coordinates, payload['from'], payload['created_at']);
	this.msg_count++;
	this.chatView.appendRow(newRowView);
	this.scrollToBottom();
}

p.statusMessage = function(message){
	var newRowView = this._createStatusMessageView(message);
	// this.msg_view_stack.push({'type':'status', 'message': message});
	this.msg_count++;
	this.chatView.appendRow(newRowView);
	this.scrollToBottom();	
};

p.setHeight = function(height) {
	this.chatView.setHeight(height);
	this.chatView.scrollToIndex(this.msg_count-1);
}

p.scrollToBottom = function() {
	if (this.msg_count > 0)
		this.chatView.scrollToIndex(this.msg_count-1);
}

p.scrollToBottomQuiet = function() {
	if (this.msg_count > 0)
		this.chatView.scrollToIndex(this.msg_count-1, {position: Ti.UI.iPhone.TableViewScrollPosition.BOTTOM, animated:false})
}

p.getView = function() {
	return this.chatView;
};

p.empty = function() {
    for(var i = 0; i < this.msg_view_stack.length; i++)
    {
    	var view = this.msg_view_stack[i]; 
    	if (view) {
    		this.chatView.remove(view['view']);
    	}
    }
    this.msg_height = -250;
};
p._createReceiveGPSView = function(id, coordinates, user, timestamp) {
	var msgWidth = 210;
	var imageUrl = (user.photo)?user.photo.urls.square_75:null;
	var messageView = Ti.UI.createTableViewRow({className:id,
	                height:5,
	                width:msgWidth,
	                backgroundSelectedColor:'transparent',
	                backgroundFocusedColor:'transparent',
	                backgroundColor:'transparent'});
	var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:5, top:10, height:43, width:43,borderRadius:23});
	var text = Ti.UI.createLabel({color:'white',left:avatar_imgView.left+60, top:20,width:messageView.width - 35,
				font:{fontSize:14,fontFamily:'arial'},
				text: ''});
	var chat_bubble_body = Ti.UI.createImageView({
		width: messageView.width - 20,
		height: 85,
		top:text.top+5,
		left:avatar_imgView.left+50,
		backgroundImage: '/images/bubble-blue-body.png'	
	});
	var chat_bubble_top = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 11,
		top:chat_bubble_body.top-11,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-blue-top.png'	
	});
	var chat_bubble_bum = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 5,
		top:chat_bubble_body.top+chat_bubble_body.height,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-blue-bottom.png'	
	});
	var timeString = '';
	var last_seen_datetime = new Date(timestamp.replace(/-/g, '/').replace('T',' '));

	var now = new Date();
	var diff = now.getTime() - last_seen_datetime.getTime();
	var days = Math.floor(diff / (24 * 60 * 60 * 1000));
	if (days > 0) {
		timeString = dateFormat(last_seen_datetime,'m/d/yyyy h:MM TT');
	}
	else {
		timeString = dateFormat(last_seen_datetime, 'shortTime');
	}

	var time_label = Ti.UI.createLabel({color:'#333',left:text.left+text.width-80, width:100,top:text.top-20, height:'auto',
				font:{fontSize:10,fontFamily:'Helvetica Neue'},
				text: timeString});
	var locMapView = Ti.Map.createView({
		backgroundColor:'transparent',
		top:chat_bubble_top.top+5,
		left: chat_bubble_top.left+12,
		width:170,
		height:90,	
		mapType: Titanium.Map.STANDARD_TYPE,
		userLocation:false,
		annotations: [{
				latitude:user.custom_fields.coordinates[0][1],
				longitude:user.custom_fields.coordinates[0][0],
				pincolor:Titanium.Map.ANNOTATION_RED,
				draggable: false,
				animate:false,
		}],
		region:{latitude:coordinates[0][1], longitude:coordinates[0][0], latitudeDelta:0.01, longitudeDelta:0.01}
	});
	var bubble_imgView = Ti.UI.createImageView({left:avatar_imgView.left-4, top:avatar_imgView.top-2, height:53, width:53,
						backgroundColor:'transparent',
						borderColor:'transparent',
						backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
	messageView.add(chat_bubble_top);
	messageView.add(chat_bubble_body);
	messageView.add(chat_bubble_bum);
	messageView.add(time_label);
	messageView.add(locMapView);
	messageView.add(avatar_imgView);
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.add(bubble_imgView);
	}
	if (Ti.Platform.osname == 'android') {
		messageView.height += 130;
	}
	else if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.height += 130;
	}
	return messageView;	
};

p._createReceiveMessageView = function(id, message, user, timestamp) {
	if (!message)
		message = '';
	var msgWidth = 170;
	var imageUrl = (user.photo)?user.photo.urls.square_75:null;
	var messageView = Ti.UI.createTableViewRow({className:id,
	                height:5,
	                width:msgWidth,
	                backgroundSelectedColor:'transparent',
	                backgroundFocusedColor:'transparent',
	                backgroundColor:'transparent'});
	var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:5, top:10, height:43, width:43,borderRadius:23});
	var text = Ti.UI.createLabel({color:'white',left:avatar_imgView.left+60, top:20,width:messageView.width - 35,
				font:{fontSize:14,fontFamily:'arial'},
				text: message});
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		text.height = (Math.round(message.toString().length/16)+1) * 30;
	}
	else {
		text.height = (Math.round(message.toString().length/16)+1) * 30;
	}
	var timeString = '';
	var last_seen_datetime = new Date(timestamp.replace(/-/g, '/').replace('T',' '));

	var now = new Date();
	var diff = now.getTime() - last_seen_datetime.getTime();
	var days = Math.floor(diff / (24 * 60 * 60 * 1000));
	if (days > 0) {
		timeString = dateFormat(last_seen_datetime,'m/d/yyyy h:MM TT');
	}
	else {
		timeString = dateFormat(last_seen_datetime, 'shortTime');
	}

	var time_label = Ti.UI.createLabel({color:'#333',left:text.left+text.width-80, width:100,top:text.top-20, height:'auto',
				font:{fontSize:10,fontFamily:'Helvetica Neue'},
				text: timeString});
	var chat_bubble_body = Ti.UI.createImageView({
		width: messageView.width - 20,
		height: text.height + 10,
		top:text.top+5,
		left:text.left-10,
		backgroundImage: '/images/bubble-blue-body.png'	
	});
	var chat_bubble_top = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 11,
		top:chat_bubble_body.top-11,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-blue-top.png'	
	});
	var chat_bubble_bum = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 5,
		top:chat_bubble_body.top+chat_bubble_body.height,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-blue-bottom.png'	
	});
	
	var bubble_imgView = Ti.UI.createImageView({left:avatar_imgView.left-4, top:avatar_imgView.top-2, height:53, width:53,
						backgroundColor:'transparent',
						borderColor:'transparent',
						backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
	messageView.add(chat_bubble_top);
	messageView.add(chat_bubble_body);
	messageView.add(chat_bubble_bum);
	messageView.add(text);
	messageView.add(time_label);
	messageView.add(avatar_imgView);
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.add(bubble_imgView);
	}
	if (Ti.Platform.osname == 'android') {
		messageView.height += (chat_bubble_body.height > avatar_imgView.height)?chat_bubble_body.height+50:avatar_imgView.height+50;
	}
	else if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.height += (chat_bubble_body.height + 45);
	}
	return messageView;	
}

p._createReceiveImageView = function(id, photo_urls, user, timestamp) {
	var self = this;
	var msgWidth = 170;
	var imageUrl = (user.photo)?user.photo.urls.square_75:null;
	var messageView = Ti.UI.createTableViewRow({className:id,
	                height:5,
	                width:msgWidth,
	                backgroundSelectedColor:'transparent',
	                backgroundFocusedColor:'transparent',
	                backgroundColor:'transparent'});
	var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:5, top:10, height:43, width:43,borderRadius:23});
	var text = Ti.UI.createLabel({color:'white',left:avatar_imgView.left+60, top:20,width:messageView.width - 35,
				font:{fontSize:14,fontFamily:'arial'},
				text: '',
				height:130});
	var timeString = '';
	var last_seen_datetime = new Date(timestamp.replace(/-/g, '/').replace('T',' '));

	var now = new Date();
	var diff = now.getTime() - last_seen_datetime.getTime();
	var days = Math.floor(diff / (24 * 60 * 60 * 1000));
	if (days > 0) {
		timeString = dateFormat(last_seen_datetime,'m/d/yyyy h:MM TT');
	}
	else {
		timeString = dateFormat(last_seen_datetime, 'shortTime');
	}

	var time_label = Ti.UI.createLabel({color:'#333',left:text.left+text.width-80, width:100,top:text.top-20, height:'auto',
				font:{fontSize:10,fontFamily:'Helvetica Neue'},
				text: timeString});
	var chat_bubble_body = Ti.UI.createImageView({
		width: messageView.width - 20,
		height: text.height + 10,
		top:text.top+5,
		left:text.left-10,
		backgroundImage: '/images/bubble-blue-body.png'	
	});
	var chat_bubble_top = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 11,
		top:chat_bubble_body.top-11,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-blue-top.png'	
	});
	var chat_bubble_bum = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 5,
		top:chat_bubble_body.top+chat_bubble_body.height,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-blue-bottom.png'	
	});
	
	var bubble_imgView = Ti.UI.createImageView({left:avatar_imgView.left-4, top:avatar_imgView.top-2, height:53, width:53,
						backgroundColor:'transparent',
						borderColor:'transparent',
						backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
	// messageView.add(chat_bubble_top);
	// messageView.add(chat_bubble_body);
	// messageView.add(chat_bubble_bum);
	messageView.add(time_label);
	messageView.add(avatar_imgView);
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.add(bubble_imgView);
	}
	if (Ti.Platform.osname == 'android') {
		messageView.height += 190;
	}
	else if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.height += 190;
	}
	var imgView = Ti.UI.createImageView({image:photo_urls.small_240});
	imgView.top = time_label.top + 20;
	imgView.left = 80;
	imgView.addEventListener('singletap',function(){
		Ti.API.info('view full image from chat history: ' + JSON.stringify(photo_urls));
		var GalleryWindowClass = require('/ui/scene/GalleryWindow');
		viewFullPic = new GalleryWindowClass(user.first_name, false, [{original:(photo_urls.original)?photo_urls.original:photo_urls.small_240}], 0);
		viewFullPic.containingTab = self.containingTab;
		self.containingTab.open(viewFullPic);
	});
	messageView.add(imgView);
	return messageView;	
}


p._createSendMessageView = function(id, message, user, timestamp) {
	if (!message)
		message = '';
	var msgWidth = 170;
	var messageView = Ti.UI.createTableViewRow({className:id,
	                height:5,
	                width:msgWidth,
	                backgroundSelectedColor:'transparent',
	                backgroundFocusedColor:'transparent',
	                backgroundColor:'transparent'});
	
	var text = Ti.UI.createLabel({color:'black',left:Math.round(Ti.Platform.displayCaps.platformWidth/2)-60, top:25, width:messageView.width - 35,
				font:{fontSize:14,fontFamily:'arial'},
				text: message});
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		text.height = (Math.round(message.toString().length/16)+1) * 30;
	}
	else {
		text.height = (Math.round(message.toString().length/16)+1) * 30;
	}
	var timeString = '';
	var last_seen_datetime = new Date(timestamp.replace(/-/g, '/').replace('T',' '));

	var now = new Date();
	var diff = now.getTime() - last_seen_datetime.getTime();
	var days = Math.floor(diff / (24 * 60 * 60 * 1000));
	if (days > 0) {
		timeString = dateFormat(last_seen_datetime,'m/d/yyyy h:MM TT');
	}
	else {
		timeString = dateFormat(last_seen_datetime, 'shortTime');
	}
					
	var time_label = Ti.UI.createLabel({color:'#333',left:(days>0)?text.left+text.width-80:text.left+text.width-40, width:(days>0)?100:70,top:text.top-20, height:'auto',
				font:{fontSize:10,fontFamily:'Helvetica Neue'},
				text: timeString});
	var chat_bubble_body = Ti.UI.createImageView({
		width: messageView.width - 20,
		height: text.height + 10,
		top:text.top+5,
		left:text.left-5,
		backgroundImage: '/images/bubble-green-body.png'	
	});
	var chat_bubble_top = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 11,
		top:chat_bubble_body.top-11,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-green-top.png'	
	});
	var chat_bubble_bum = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 5,
		top:chat_bubble_body.top+chat_bubble_body.height,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-green-bottom.png'	
	});
	var imageUrl = (user.photo)?user.photo.urls.square_75:null;
	var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:text.left+text.width+20, top:text.top-22, height:43, width:43,borderRadius:23});
	var bubble_imgView = Ti.UI.createImageView({left:avatar_imgView.left-4, top:avatar_imgView.top-2, height:53, width:53,
						backgroundColor:'transparent',
						borderColor:'transparent',
						backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
	messageView.add(chat_bubble_top);
	messageView.add(chat_bubble_body);
	messageView.add(chat_bubble_bum);
	messageView.add(text);
	messageView.add(time_label);
	messageView.add(avatar_imgView);
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.add(bubble_imgView);
	}
	if (Ti.Platform.osname == 'android') {
		messageView.height += (chat_bubble_body.height > avatar_imgView.height)?chat_bubble_body.height+50:avatar_imgView.height+50;
	}
	else if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.height += (chat_bubble_body.height + 45);
	}
	return messageView;	
};

p._createSendGPSView = function(id, coordinates, user, timestamp) {
	var msgWidth = 210;
	var messageView = Ti.UI.createTableViewRow({className:id,
	                height:5,
	                width:msgWidth,
	                backgroundSelectedColor:'transparent',
	                backgroundFocusedColor:'transparent',
	                backgroundColor:'transparent'});
	
	var text = Ti.UI.createLabel({color:'black',left:Math.round(Ti.Platform.displayCaps.platformWidth/2)-60, top:25, width:messageView.width - 35,
				font:{fontSize:14,fontFamily:'arial'},
				text: ''});
	var chat_bubble_body = Ti.UI.createImageView({
		width: messageView.width - 20,
		height: 85,
		top:text.top+5,
		left:text.left-40,
		backgroundImage: '/images/bubble-green-body.png'	
	});
	var chat_bubble_top = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 11,
		top:chat_bubble_body.top-11,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-green-top.png'	
	});
	var chat_bubble_bum = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 5,
		top:chat_bubble_body.top+chat_bubble_body.height,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-green-bottom.png'	
	});
	var timeString = '';
	var last_seen_datetime = new Date(timestamp.replace(/-/g, '/').replace('T',' '));

	var now = new Date();
	var diff = now.getTime() - last_seen_datetime.getTime();
	var days = Math.floor(diff / (24 * 60 * 60 * 1000));
	if (days > 0) {
		timeString = dateFormat(last_seen_datetime,'m/d/yyyy h:MM TT');
	}
	else {
		timeString = dateFormat(last_seen_datetime, 'shortTime');
	}
					
	var time_label = Ti.UI.createLabel({color:'#333',left:(days>0)?text.left+text.width-120:text.left+text.width-40, width:(days>0)?100:70,top:text.top-20, height:'auto',
				font:{fontSize:10,fontFamily:'Helvetica Neue'},
				text: timeString});
	var locMapView = Ti.Map.createView({
		backgroundColor:'transparent',
		top:chat_bubble_top.top+5,
		left: chat_bubble_top.left+5,
		width:170,
		height:90,		
		mapType: Titanium.Map.STANDARD_TYPE,
		userLocation:false,
		annotations: [{
				latitude:coordinates.latitude,
				longitude:coordinates.longitude,
				pincolor:Titanium.Map.ANNOTATION_RED,
				draggable: false,
				animate:false,
		}],
		region:{latitude:coordinates.latitude, longitude:coordinates.longitude, latitudeDelta:0.01, longitudeDelta:0.01}
	});
	var imageUrl = (user.photo)?user.photo.urls.square_75:null;
	var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:chat_bubble_top.left+chat_bubble_top.width+5, top:text.top-22, height:43, width:43,borderRadius:23});
	var bubble_imgView = Ti.UI.createImageView({left:avatar_imgView.left-4, top:avatar_imgView.top-2, height:53, width:53,
						backgroundColor:'transparent',
						borderColor:'transparent',
						backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
	messageView.add(chat_bubble_top);
	messageView.add(chat_bubble_body);
	messageView.add(chat_bubble_bum);
	messageView.add(time_label);
	messageView.add(locMapView);
	messageView.add(avatar_imgView);
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.add(bubble_imgView);
	}
	if (Ti.Platform.osname == 'android') {
		messageView.height += 130;
	}
	else if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.height += 130;
	}
	return messageView;	
};

p._createSendImageView = function(id, photo_urls, user, timestamp) {
	var self = this;
	var msgWidth = 170;
	var messageView = Ti.UI.createTableViewRow({className:id,
	                height:5,
	                width:msgWidth,
	                backgroundSelectedColor:'transparent',
	                backgroundFocusedColor:'transparent',
	                backgroundColor:'transparent'});

	var text = Ti.UI.createLabel({color:'black',left:Math.round(Ti.Platform.displayCaps.platformWidth/2)-60, top:25, width:messageView.width - 35,
				font:{fontSize:14,fontFamily:'arial'},
				text: '', height:130});
	var timeString = '';
	var last_seen_datetime = new Date(timestamp.replace(/-/g, '/').replace('T',' '));

	var now = new Date();
	var diff = now.getTime() - last_seen_datetime.getTime();
	var days = Math.floor(diff / (24 * 60 * 60 * 1000));
	if (days > 0) {
		timeString = dateFormat(last_seen_datetime,'m/d/yyyy h:MM TT');
	}
	else {
		timeString = dateFormat(last_seen_datetime, 'shortTime');
	}
					
	var time_label = Ti.UI.createLabel({color:'#333',left:(days>0)?text.left+text.width-80:text.left+text.width-40, width:(days>0)?100:70,top:text.top-20, height:'auto',
				font:{fontSize:10,fontFamily:'Helvetica Neue'},
				text: timeString});
	var chat_bubble_body = Ti.UI.createImageView({
		width: messageView.width - 20,
		height: text.height + 10,
		top:text.top+5,
		left:text.left-5,
		backgroundImage: '/images/bubble-green-body.png'	
	});
	var chat_bubble_top = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 11,
		top:chat_bubble_body.top-11,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-green-top.png'	
	});
	var chat_bubble_bum = Ti.UI.createImageView({
		width: chat_bubble_body.width,
		height: 5,
		top:chat_bubble_body.top+chat_bubble_body.height,
		left:chat_bubble_body.left,
		backgroundImage: '/images/bubble-green-bottom.png'	
	});
	var imageUrl = (user.photo)?user.photo.urls.square_75:null;
	var avatar_imgView = Ti.UI.createImageView({image: imageUrl, left:chat_bubble_top.left+chat_bubble_top.width+5, top:text.top-22, height:43, width:43,borderRadius:23});
	var bubble_imgView = Ti.UI.createImageView({left:avatar_imgView.left-4, top:avatar_imgView.top-2, height:53, width:53,
						backgroundColor:'transparent',
						borderColor:'transparent',
						backgroundImage:(user.custom_fields.sex=='FEMALE')?'/images/bubble-circle-woman.png':'/images/bubble-circle-man.png'});
	// messageView.add(chat_bubble_top);
	// messageView.add(chat_bubble_body);
	// messageView.add(chat_bubble_bum);
	messageView.add(time_label);
	messageView.add(avatar_imgView);
	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.add(bubble_imgView);
	}
	if (Ti.Platform.osname == 'android') {
		messageView.height += 190;
	}
	else if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad') {
		messageView.height += 190;
	}
	var imgView = Ti.UI.createImageView({image:photo_urls.small_240});
	imgView.top = time_label.top + 20;
	imgView.right = 80;
	imgView.addEventListener('singletap',function(){
		Ti.API.info('view full image from chat history: ' + JSON.stringify(photo_urls));
		var GalleryWindowClass = require('/ui/scene/GalleryWindow');
		viewFullPic = new GalleryWindowClass(user.first_name, false, [{original:(photo_urls.original)?photo_urls.original:photo_urls.small_240}], 0);
		viewFullPic.containingTab = self.containingTab;
		self.containingTab.open(viewFullPic);
	});
	messageView.add(imgView);
	// Ti.API.info('imageView properties: ' + imgView.toImage().height + '-' + imgView.toImage().width);
	return messageView;	
};

p._createStatusMessageView = function(message) {
	var msgWidth = 300;
	var messageView = Ti.UI.createTableViewRow({
			top:0,
			left:0,
	                height:45,
	                width:msgWidth,
	                backgroundSelectedColor:'transparent',
	                backgroundFocusedColor:'transparent',
	                backgroundColor:'transparent'});
	
	var status_label = Ti.UI.createLabel({color:'#333',left:10, width:msgWidth,top:0, height:45,
				font:{fontSize:12,fontFamily:'Helvetica Neue'},
				text: message});
	messageView.add(status_label);
	return messageView;	
}


exports.Class = Class;