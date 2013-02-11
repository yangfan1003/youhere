function Class() {
	
}
var p = Class.prototype;

/* 
	Developed by Kevin L. Hopkins (http://kevin.h-pk-ns.com)
	You may borrow, steal, use this in any way you feel necessary but please
	leave attribution to me as the source.  If you feel especially grateful,
	give me a linkback from your blog, a shoutout @Devneck on Twitter, or 
	my company profile @ http://wearefound.com.

/* Expects parameters of the directory name you wish to save it under, the url of the remote image, 
   and the Image View Object its being assigned to. */
p.updateImageView = function(imageDirectoryName, url, imageViewObject, scale, callback, type)
{
	// Grab the filename
	var filename = url.split('/');
	filename = filename[filename.length - 1];
	filename = type?filename+'.' + type:filename;
	
	// Ti.API.info('url: ' + url);
	// Ti.API.info('filename: ' + filename);
	// Try and get the file that has been previously cached
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);
	var xhr = Ti.Network.createHTTPClient({timeout:120000});
	
	if (file.exists()) {
		// If it has been cached, assign the local asset path to the image view object.
		// imageViewObject.image = file.nativePath;
		if (scale == true) {
			var newImage = Ti.UI.createImageView({
				image: file.nativePath
			})
			var newBlob = newImage.toImage();
			var newWidth = newImage.toImage().width; 
			var newHeight = newImage.toImage().height; 
			var newX = newY = 0;
			if (newImage.toImage().width > 320) {
				newX = Math.round((newImage.toImage().width - 320) / 2);
				newWidth = 320;
			}
			if (newImage.toImage().height > 210) {
				newY = Math.round((newImage.toImage().height - 210) / 2);
				newHeight = 210;
			}
			var croppedImage = newBlob.imageAsCropped({x:newX,y:newY,width:newWidth,height:newHeight});
			imageViewObject.image = croppedImage;
		}
		else {
			imageViewObject.image = file.nativePath;
		}
		
		if (callback) {
			callback();
		}
		
	} else {
		// If it hasn't been cached, grab the directory it will be stored in.
		var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName);
		if (!g.exists()) {
			// If the directory doesn't exist, make it
			g.createDirectory();
		};
		
		// Create the HTTP client to download the asset.
		
		xhr.onload = function() {
			Ti.API.info('xhr onload');
			if (xhr.status == 200) {
				// Ti.API.info('successfully got the avatar image');
				// On successful load, take that image file we tried to grab before and 
				// save the remote image data to it.
				file.write(xhr.responseData);
				// Assign the local asset path to the image view object.
				if (scale == true) {
					var newImage = Ti.UI.createImageView({
						image: file.nativePath
					})
					var newBlob = newImage.toImage();
					var newWidth = newImage.toImage().width; 
					var newHeight = newImage.toImage().height; 
					var newX = newY = 0;
					if (newImage.toImage().width > 320) {
						newX = Math.round((newImage.toImage().width - 320) / 2);
						newWidth = 320;
					}
					if (newImage.toImage().height > 210) {
						newY = Math.round((newImage.toImage().height - 210) / 2);
						newHeight = 210;
					}
					var croppedImage = newBlob.imageAsCropped({x:newX,y:newY,width:newWidth,height:newHeight});
					imageViewObject.image = croppedImage;
				}
				else {
					imageViewObject.image = file.nativePath;
				}
				if (callback) {
					callback();
				}
			};
		};
		
		xhr.onerror = function() {
			Ti.API.info('xhr onerror');
		};
		
		// Issuing a GET request to the remote URL
		// Ti.API.info('requesting avatar image from http')
		xhr.open('GET', url);
		// Finally, sending the request out.
		xhr.send();
	};
};

	
exports.cache = new Class();