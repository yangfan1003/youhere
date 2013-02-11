function LogsWindow(user, isMe) {
	var customRows = require('rows').customTableRows;
	var logs_width = 230;
	var sideview_width = 40;
	var winTitle = L('mylog');
	var ungrouped_status_array = [];
	
	if (!isMe) {
		if (user.custom_fields.sex == 'MALE') {
			winTitle = L('hislog');
		}
		else
			winTitle = L('herlog');
	}
	var self = Ti.UI.createWindow({
		title : winTitle,
		barColor : colors.titlebar,
		backgroundColor : colors.bg2
	});
	
	var logsTable = Titanium.UI.createTableView({top:3,width:logs_width+sideview_width,height:350,
					data:[],
					backgroundColor:'transparent',
					scrollable: true,
					left: 0});


	var visitorsButton = Titanium.UI.createButton({
		title:L('rvisit'),
		backgroundColor:colors.button_col1
	});
	self.setRightNavButton(visitorsButton);

	var updateLogTable = function(groupedArray) {
		var inputData = [];
		Ti.API.info('groupedArray: ' + JSON.stringify(groupedArray));
		var sorted_keys = _(_(groupedArray).keys()).sortBy(function(year_month){
			return year_month;
		});
		_(sorted_keys.reverse()).each(function(year_month){
			var multiLogsArray = groupedArray[year_month];
			// Ti.API.info('logs: ' + JSON.stringify(multiLogsArray));
			var month_label = Titanium.UI.createLabel({text:year_month.substring(0,7).replace('-', L('year_delimiter')) + L('month_delimiter'),
				height:20,width:logs_width,font:{fontSize:12,fontWeight:'bold'},backgroundColor:'#777',color:'white',left:0,textAlign:'right'});
			var date_label = Ti.UI.createLabel({text:year_month.substring(8,10),
				backgroundColor:colors.bg2, width:sideview_width,font:{fontSize:20,fontWeight: 'bold'},textAlign:'center'});
			var left_view = Ti.UI.createView({left:0,width:logs_width});
			var right_view = Ti.UI.createView({right:0,width:sideview_width});
			left_view.add(month_label);
			right_view.add(date_label);
				
			var row = Ti.UI.createTableViewRow({backgroundColor:'white',height:20,font:{fontSize:12},color : '#222'});
			row.add(left_view);
			row.add(right_view);
			
			inputData.push(row);
			inputData.push(customRows.addLogPhotoRow(multiLogsArray, function(e){
				var status_obj = e.source.status_obj;
				// Ti.API.info('status obj: ' + JSON.stringify(status_obj));
				var DetailLogClass = require('/ui/logs/DetailLogWindow');
				var detailLog = new DetailLogClass(winTitle, status_obj, user);
				detailLog.containingTab = self.containingTab;
				self.containingTab.open(detailLog);
				
			}));
		});
		logsTable.setData(inputData);
	} 
	
	status_array = Ti.App.Properties.getString('STATUS_LIST')?JSON.parse(Ti.App.Properties.getString('STATUS_LIST')):null;
	if (status_array && isMe) { updateLogTable(status_array); }


	function refresh_logs_cloud() {
		Ti.Cloud.Statuses.query({where:{user_id:user.id},order:'-updated_at', limit:100}, function(status_result){
			if (status_result.success && status_result.meta.code==200) {
				ungrouped_status_array = status_result.statuses;
				status_array = _(status_result.statuses).groupBy(function(status){
					return status.updated_at.substring(0,10);
				});
				updateLogTable(status_array);
				if (isMe || user.id == userMe.id) {
					// if is me, persist the array
					Ti.App.Properties.setString('STATUS_LIST', JSON.stringify(status_array));
				}
			}	
		});
	}

	function refresh_logs(e) {
		Ti.API.info('adding new log and refresh...');
		if (e.new_log) {
			var new_log = e.new_log;
			if (ungrouped_status_array) {
				ungrouped_status_array.push(new_log);
				status_array = _(ungrouped_status_array).groupBy(function(status){
					return status.updated_at.substring(0,10);
				});
				updateLogTable(status_array);
			}
		}
		else {
			Ti.API.info('refreshing logs from cloud');
			refresh_logs_cloud();			
		}
	}
	
	refresh_logs_cloud();
	self.add(logsTable);

	function processMediaEvent(event) {
		var compressedBlob = ImageFactory.compress(event.media, 0.25); 
		var fullView = Ti.UI.createImageView({
			image : compressedBlob,
			width : event.media.width,
			height : event.media.height,
			center : (Ti.Platform.osname == 'android') ? null : true
		});
		var thumbView = {image:fullView.toImage().imageAsResized(40,40)};
		var WriteLogClass = require('/ui/logs/WriteLogWindow');
		var writeLog = new WriteLogClass(L('newlog'), thumbView, fullView);
		writeLog.containingTab = self.containingTab;
		self.containingTab.open(writeLog);
	}

	var cameraImgView = Ti.UI.createImageView({image:'/images/logs_camera.png',width:40,height:40,right:5,bottom:20});
	if (isMe) self.add(cameraImgView);
	
	cameraImgView.addEventListener('click',function(e){
		if (Ti.Platform.model == 'Simulator') {
			Titanium.Media.openPhotoGallery({
				success : function(event) {
					processMediaEvent(event);
				},
				cancel : function() {
					//self.tf.fireEvent('return');
					Ti.API.info('user cancelled openGallery');
				},
				allowEditing : false,
				animated : true,
				autohide : true,
				mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
			});
		}
		else {
			Titanium.Media.showCamera({
				success : function(event) {
					processMediaEvent(event);
				},
				cancel : function() {
					//self.tf.fireEvent('return');
					Ti.API.info('user cancelled showCamera');
				},
				saveToPhotoGallery : true,
				allowEditing : true,
				animated : true,
				autohide : true,
				mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
			});
		}
	});
	
	visitorsButton.addEventListener('click', function(evt){ 
		var FindFriendWindowClass = require('/ui/location/FindFriendWindow');
		var findFriendWindow = new FindFriendWindowClass(L('rvisit'), [], false, 'list', null, function(e, callback){
			var visitors_array = [];
			Ti.Cloud.Reviews.query({custom_object_id:user.custom_fields.logs_custom_object_id, order:'-updated_at', limit:100}, function(result) {
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
	
	Ti.App.addEventListener('new_log_created', function(evt){
		refresh_logs(evt);
	});
	
	return self;
};

module.exports = LogsWindow;
