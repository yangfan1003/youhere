function WriteLogWindow(title, thumbView, fullView) {
	
	var self = Ti.UI.createWindow({
		title:title,
		barColor: colors.titlebar,
		backgroundColor:colors.bg2
	});
	var saveButton = Titanium.UI.createButton({
		title:L('publish_log'),
		backgroundColor:colors.button_col1
	});
	self.setRightNavButton(saveButton);

	var inputData = [];
	var log_textarea = Ti.UI.createTextArea({width:280, height:120,top:10,hintText:L('newlog_hint'),scrollable:true});
	inputData[0] = Ti.UI.createTableViewRow({backgroundColor:'white'});
	inputData[0].add(log_textarea);
	inputData[1] = Ti.UI.createTableViewRow({backgroundColor:'white'});
	inputData[1].add(Ti.UI.createImageView({image:thumbView.image,
		width:40, height:40,left:10,bottom:3}));
	inputData[0].header = '';

	var logEditor = Titanium.UI.createTableView({top:0,width:300,height:260,
					data:inputData,
					backgroundColor:'transparent',
					scrollable: true,
					style:(Ti.Platform.osname=='android')?null:Titanium.UI.iPhone.TableViewStyle.GROUPED});

	self.add(logEditor);
	
	var logMap = Ti.Map.createView({
		backgroundColor:'red',
		bottom:30,
		width:280,
		height:120,		
		mapType: Titanium.Map.STANDARD_TYPE,
		animate:false,
		regionFit:true,
		focusable: false,
		userLocation:true,
		region:{latitude:myGPS.latitude, longitude:myGPS.longitude, latitudeDelta:0.02, longitudeDelta:0.02}
	});
	self.add(logMap);
	saveButton.addEventListener('click', function(e){
		log_textarea.blur();
		// var publishProgressView = new ProgressView({window: self});
		// publishProgressView.show({
			// text:L('progress_wait_publish')
		// });
			
		if (!userMe.custom_fields.logs_custom_object_id) {
			// create a custom object as my logs collection
			Ti.Cloud.Objects.create({classname:'LOGS', fields:{user_id:userMe.id}},function(object_result){
				Ti.API.info('custom object create result: ' + JSON.stringify(object_result));
				if (object_result.success && object_result.meta.code==200) {
					// update user profile to store the custom object id
					userMe.custom_fields.logs_custom_object_id = object_result.LOGS[0].id;
					Ti.Cloud.Users.update({custom_fields:{'logs_custom_object_id':object_result.LOGS[0].id}}, function(user_result){
						if (user_result.success && user_result.meta.code==200) {
							Ti.API.info('user update result: ' + JSON.stringify(user_result));
							
							    self.close();
							    var temp_log = {};
							    temp_log.message = (log_textarea.value.length>0)?log_textarea.value:'#';
							    var updated_at_string = dateFormat(new Date(), 'isoDateTime');
							    Ti.API.info('updated_at_string: ' + updated_at_string);
							    temp_log.updated_at = updated_at_string;
							    temp_log.custom_fields = {'location':myGPS.currentLocation['address'], "coordinates":[myGPS.longitude,myGPS.latitude]};
							    
								var square_imageView = Ti.UI.createImageView({image:null});
								var medium_imageView = Ti.UI.createImageView({image:null});
								
								if (fullView.toImage().height > fullView.toImage().width) {
									square_imageView.image = fullView.toImage().imageAsResized(Math.round((75/fullView.toImage().height)*fullView.toImage().width), 75);
									medium_imageView.image = fullView.toImage().imageAsResized(Math.round((333/fullView.toImage().height)*fullView.toImage().width), 333);
								}
								else {
									square_imageView.image = fullView.toImage().imageAsResized(75, Math.round((75/fullView.toImage().width)*fullView.toImage().height));
									medium_imageView.image = fullView.toImage().imageAsResized(500, Math.round((500/fullView.toImage().width)*fullView.toImage().height));
								}
								var square_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'LOGS_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16) + '_square');
								var medium_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'LOGS_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16) + '_medium');
								var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'LOGS_THUMBS');
								if (!folder.exists()) {
									folder.createDirectory();
								};
								square_file.write(square_imageView.toImage());
							    	medium_file.write(medium_imageView.toImage());
							    
							    temp_log.photo = {urls:{
							    	square_75:square_file.nativePath,
							    	medium_500:medium_file.nativePath
							    }};
							    Ti.App.fireEvent('new_log_created', {new_log:temp_log});
							
							Ti.Cloud.Statuses.create({message:(log_textarea.value.length>0)?log_textarea.value:'#', 
								user_id:userMe.id, 
								photo: fullView.toImage(), 
								custom_fields:{'location':myGPS.currentLocation['address'], "coordinates":[myGPS.longitude,myGPS.latitude]}}, 
								function(status_result){
									if (status_result.success && status_result.meta.code==200) {
										Ti.API.info('status create result: ' + JSON.stringify(status_result));
										setTimeout(function() {
						    					Ti.App.fireEvent('new_log_created', {});
										}, 20000);
									}
									else {
										Ti.API.info('status create failed: ' + JSON.stringify(status_result));
										setTimeout(function() {
						    					Ti.App.fireEvent('new_log_created', {});
										}, 20000);
									}
							});
						}
						else {
							Ti.API.info('status create failed: ' + JSON.stringify(status_result));
							setTimeout(function() {
			    					Ti.App.fireEvent('new_log_created', {});
							}, 20000);
						}				
					});
				}
				else {
					Ti.API.info('status create failed: ' + JSON.stringify(status_result));
					setTimeout(function() {
	    					Ti.App.fireEvent('new_log_created', {});
					}, 20000);
				}
			});
		}
		else {
		    self.close();
		    var temp_log = {};
		    temp_log.message = (log_textarea.value.length>0)?log_textarea.value:'#';
		    var updated_at_string = dateFormat(new Date(), 'isoDateTime');
		    Ti.API.info('updated_at_string: ' + updated_at_string);
		    temp_log.updated_at = updated_at_string;
		    temp_log.custom_fields = {'location':myGPS.currentLocation['address'], "coordinates":[myGPS.longitude,myGPS.latitude]};
		    
			var square_imageView = Ti.UI.createImageView({image:null});
			var medium_imageView = Ti.UI.createImageView({image:null});
			
			if (fullView.toImage().height > fullView.toImage().width) {
				square_imageView.image = fullView.toImage().imageAsResized(Math.round((75/fullView.toImage().height)*fullView.toImage().width), 75);
				medium_imageView.image = fullView.toImage().imageAsResized(Math.round((333/fullView.toImage().height)*fullView.toImage().width), 333);
			}
			else {
				square_imageView.image = fullView.toImage().imageAsResized(75, Math.round((75/fullView.toImage().width)*fullView.toImage().height));
				medium_imageView.image = fullView.toImage().imageAsResized(500, Math.round((500/fullView.toImage().width)*fullView.toImage().height));
			}
			var square_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'LOGS_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16) + '_square');
			var medium_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'LOGS_THUMBS', (Math.random()*0xFFFFFF<<0).toString(16) + '_medium');
			var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'LOGS_THUMBS');
			if (!folder.exists()) {
				folder.createDirectory();
			};
			square_file.write(square_imageView.toImage());
		    	medium_file.write(medium_imageView.toImage());
		    
		    temp_log.photo = {urls:{
		    	square_75:square_file.nativePath,
		    	medium_500:medium_file.nativePath
		    }};
		    Ti.App.fireEvent('new_log_created', {new_log:temp_log});
		    
			// go ahead and post Status
			Ti.Cloud.Statuses.create({message:(log_textarea.value.length>0)?log_textarea.value:'#', 
					user_id:userMe.id, 
				photo: fullView.toImage(), 
				custom_fields:{'location':myGPS.currentLocation['address'], "coordinates":[myGPS.longitude,myGPS.latitude]}}, 
				function(status_result){
					if (status_result.success && status_result.meta.code==200) {
						Ti.API.info('status create result: ' + JSON.stringify(status_result));
						setTimeout(function() {
		    					Ti.App.fireEvent('new_log_created', {});
						}, 20000);
					}
					else {
						Ti.API.info('status create failed: ' + JSON.stringify(status_result));
						setTimeout(function() {
		    					Ti.App.fireEvent('new_log_created', {});
						}, 20000);
					}
			});
		}
	});
	
	return self;
};

module.exports = WriteLogWindow;
