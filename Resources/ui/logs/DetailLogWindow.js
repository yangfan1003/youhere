function DetailLogWindow(title, status_obj, user) {
	
	var self = Ti.UI.createWindow({
		title : title,
		backgroundColor : 'white',
		scrollable : true,
		tabBarHidden: true,
		barColor : colors.titlebar
	});

	function confirmAndRun(title, message, callback) {
		var self = this;
		var confirm = Titanium.UI.createAlertDialog({title:title, message:message, buttonNames: ['Yes', 'No'], cancel: 1 });
		confirm.addEventListener('click', function(e) { 
		   Titanium.API.info('e = ' + JSON.stringify(e));
		   if (e.cancel === e.index || e.cancel === true) {
		      return;
		   }
		   switch (e.index) {
		      case 0: callback();break;
		      case 1: Titanium.API.info('Clicked button 1 (NO)');break;
		      default:break;
		  }
		});
		confirm.show();
	}
	
	var photoImageView = Ti.UI.createImageView({
		image: null,
		width: 320,
		height: 230,
		top:0,
		left:0
		
	});
	self.add(photoImageView);
	var textArea = Ti.UI.createTextArea({
		backgroundColor: 'white',
		font : {
			fontSize : 12
		},
		color: '666666',
		editable : false,
		scrollable: true,
		textAlign : 'left',
		value : (status_obj.message=='#')?'':status_obj.message,
		bottom : 60,
		left : 10,
		right : 30,
		width : 280,
		height : 90
	});
	self.add(textArea);
	
	var locationView = Ti.UI.createView({top:220, left:20,backgroundColor:'white',width:150,height:25,borderWidth:1,borderColor:'#eee'});
	var location_string1 = (status_obj.custom_fields.location)?(status_obj.custom_fields.location.split(',')[0]).split(' ')[0]:'';
	var location_string2 = (status_obj.custom_fields.location)?status_obj.custom_fields.location.split(',')[1]:'';
	locationView.add(Ti.UI.createImageView({image:'/images/location_pin.png',left:10, width:16, height:16,backgroundColor:'white'}));
	locationView.add(Ti.UI.createLabel({left: 25, text:location_string1 + ' ' + location_string2, font:{fontSize:12}, color:'#777', backgroundColor:'white'}));
	self.add(locationView);
	
	// var visitorButton = Titanium.UI.createButton({
		// title:L('rvisit'),
		// backgroundColor:colors.button_col1
	// });
	// self.setRightNavButton(visitorButton);
	
	var footerView = Ti.UI.createView({height:40,bottom:0,backgroundColor:'#eeeeee'});
	var share_label = Ti.UI.createLabel({text:(user.id == userMe.id)?L('logs_edit'):L('logs_share'), color:'#777', font:{fontSize:12}, left:25});
	var visitors_label = Ti.UI.createLabel({text:L('rvisit'), color:'#777', font:{fontSize:12}, right:60});
	var visitors_stat_label = Ti.UI.createLabel({text:(status_obj.reviews_count)?status_obj.reviews_count:0, color:'#777', font:{fontSize:12}, right:5});
	
	footerView.add(share_label);
	footerView.add(visitors_label);
	footerView.add(visitors_stat_label);
	self.add(footerView);


	if (status_obj.photo.urls.medium_500.substring(0,4)=='http') {
		var actInd = Titanium.UI.createActivityIndicator({
			style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
			height:90,
			width:90,
			top:60
		});
		self.add(actInd);
		
		actInd.show();
		imageCache.updateImageView("cache", status_obj.photo.urls.medium_500, photoImageView, true, function(){
			Ti.API.info('finished loading full log pic');
			actInd.hide();
			photoImageView.addEventListener('singletap',function(){
				var GalleryWindowClass = require('/ui/scene/GalleryWindow');
				viewFullPic = new GalleryWindowClass(title, false, [status_obj.photo.urls], 0);
				viewFullPic.containingTab = self.containingTab;
				self.containingTab.open(viewFullPic);
			});
		});
	}
	else if (status_obj.photo.urls.medium_500.substring(0,4)=='file') {
		photoImageView.image = status_obj.photo.urls.medium_500;
		photoImageView.addEventListener('singletap',function(){
			var GalleryWindowClass = require('/ui/scene/GalleryWindow');
			viewFullPic = new GalleryWindowClass(title, false, [status_obj.photo.urls], 0);
			viewFullPic.containingTab = self.containingTab;
			self.containingTab.open(viewFullPic);
		});
	}
	if (status_obj.user) {
		if (status_obj.user.id != userMe.id) { // make sure not looking at my own log
			if (!visited_logs[status_obj.id]) { // make sure we have not visit here during this app lifecycle
				Ti.Cloud.Reviews.create({status_id:status_obj.id, content:'status visits', rating:1, allow_duplicate:1}, 
				function(review_result){
					if (review_result.success && review_result.meta.code==200) {
						Ti.API.info('create status/review result: ' + JSON.stringify(review_result));
						visited_logs[status_obj.id] = true;
					}	
				});
			}
			if (user.custom_fields.logs_custom_object_id && !visited_logs[user.custom_fields.logs_custom_object_id]) { // make sure we have not visit here during this app lifecycle
				// create review on the user custom object
				Ti.Cloud.Reviews.create({custom_object_id:user.custom_fields.logs_custom_object_id, content:'log visits', rating:1, allow_duplicate:1}, 
				function(review_result){
					if (review_result.success && review_result.meta.code==200) {
						Ti.API.info('create custom_object/review result: ' + JSON.stringify(review_result));
						visited_logs[user.custom_fields.logs_custom_object_id] = true;
					}	
				});
			}
		}
		else {
			Ti.API.info('i am looking at my own log!')
		}
	
		visitors_label.addEventListener('click', function(evt){
			var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
			var findFriendWindow = new FindFriendWindowClass(L('rvisit'), [], false, 'list', null, function(e, callback){
				var visitors_array = [];
				Ti.Cloud.Reviews.query({status_id:status_obj.id, order:'-updated_at', limit:100}, function(result) {
					// Ti.API.info('querying custom object reviews: ' + JSON.stringify(result));
					if (result.success && result.meta.code==200) {
						_(result.reviews).each(function(review){
							// Ti.API.info('review retrieved: ' + JSON.stringify(review));
							review.user.visited_at = review.updated_at;
							visitors_array.push(review.user);	
						});
					callback({array:visitors_array});
					}	
				});
			});
			findFriendWindow.containingTab = self.containingTab;		
			self.containingTab.open(findFriendWindow);
		});
	}
	
	var actionMenuView = Ti.UI.createView({
		bottom:0,
		height:290,
		backgroundColor:'#444444',
		visible: false	
	});
	var editLogBtn = Titanium.UI.createButton({
		title : L('editLog'),
		top : 30,
		height : 35,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
		// backgroundImage: 'images/button_orange.png'
	});
	var copyLogBtn = Titanium.UI.createButton({
		title : L('logs_share'),
		top : 80,
		height : 35,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: colors.button_col2
		// backgroundImage: 'images/button_orange.png'
	});
	var cancelActionBtn = Titanium.UI.createButton({
		title : L('cancel'),
		top: 230,
		height : 35,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: '#888888'
		// backgroundImage: 'images/button_orange.png'
	});
	cancelActionBtn.addEventListener('click', function(e){
		actionMenuView.visible = false;
	});
	actionMenuView.add(cancelActionBtn);
	var deleteBtn = Titanium.UI.createButton({
		title : L('removeLog'),
		top: 180,
		height : 35,
		width : 260,
		style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		backgroundColor: '#888888'
		// backgroundImage: 'images/button_orange.png'
	});
	deleteBtn.addEventListener('click', function(e){
		confirmAndRun('', 'are you sure to delete the log?', function(){
			Ti.API.info('deleting log...');
		});	
	});

	share_label.addEventListener('click', function(e){
		// if (user.id == userMe.id) {
			// actionMenuView.add(editLogBtn);
			// actionMenuView.add(deleteBtn);
			// actionMenuView.visible = true;
		// }
		// else {
			// actionMenuView.add(copyLogBtn);
			// actionMenuView.visible = true;
		// }
	});
	self.add(actionMenuView);
			
	self.addEventListener('focus', function(e){
	});
	
	self.addEventListener('open', function(e){
	});
	
	return self;
};

module.exports = DetailLogWindow;
