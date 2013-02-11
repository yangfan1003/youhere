/*
 * A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.  
 * A starting point for tab-based application with multiple top-level windows. 
 * Requires Titanium Mobile SDK 1.8.0+.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

Ti.Cloud = require('ti.cloud');
Ti.Cloud.debug = true;
Ti.include("/date.format.js");

var myGPS;
var colors = require('/ui/common/Colors');
var _ = require('underscore')._;
var youhere = require('ti.youhere');
var ImageFactory = require('ti.imagefactory');
var imageCache = require('CachedImageView').cache;
var ProgressView = require("progress.view").ProgressView;
var scene_array = [];
var friend_array = [];
var favs_array = [];
var status_array = [];
var userMe = null;
var visited_scenes = {};
var visited_logs = {};
var place_checkins = {};
var logStats = {};
var register_data = {
		'北京':['西城','海淀','门头沟','通县','密云','平谷','崇文','东城','丰台','顺义','昌平','怀柔','宣武','朝阳','石景山','大兴','延庆'],
		'上海':['黄浦','卢湾','徐汇','长宁','静安','普陀','闸北','虹口','杨浦','闵行','宝山','嘉定','浦东','金山','松江','青浦','南汇','奉贤','崇明'],
		'天津':['和平','南开','河西','河东','河北','红桥','东丽','西青','津南','北辰','武清','宝坻','滨海','静海','宁河','蓟县'],
		'重庆':['万州','涪陵','渝中','大渡口','江北','沙坪坝','九龙坡','南岸','北碚','万盛','双桥','渝北','巴南','黔江','长寿','江津','合川','永川','南川'],
		'内蒙古':['呼和浩特','包头','乌海','赤峰','通辽','兴安','阿拉善','锡林郭勒','鄂尔多斯','呼伦贝尔','乌兰察布','巴彦淖尔'],
		'山西':['太原','大同','晋城','朔州','阳泉','长治','忻州','吕梁','晋中','临汾','运城','吕梁'],
		'河北':['石家庄','唐山','邯郸','秦皇岛','保定','张家口','承德','廊坊','沧州','衡水','邢台'],
		'辽宁':['鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
		'吉林':['长春','吉林','四平','通化','白山','辽源','白城','松原','延边'],
		'黑龙江':['哈尔滨','齐齐哈尔','牡丹江','佳木斯','大庆','鸡西','双鸭山','伊春','七台河','鹤岗','黑河市','绥化市'],
		'江苏':['南京','无锡','苏州','南通','泰州','徐州','淮安','宿迁','连云港','扬州','常州','镇江','盐城'],
		'安徽':['合肥','芜湖','淮南','滁州','蚌埠','黄山','宿州','宣城','淮北','铜陵','阜阳','马鞍山','毫州','安庆','六安','池州','巢湖'],
		'山东':['济南','青岛','淄博','枣庄','东营','烟台','潍坊','济宁','泰安','威海','日照','莱芜','临沂','德州','聊城','滨州','菏泽'],
		'浙江':['杭州','宁波','温州','台州','金华','湖州','嘉兴','湖州','丽水','金华','衢州','舟山']
		};

// This is a single context application with mutliple windows in a stack
(function() {
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	// var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
// 	
	// var Window;
	// if (isTablet) {
		// Window = require('ui/tablet/ApplicationWindow');
	// }
	// else {
		// Window = require('ui/handheld/ApplicationWindow');
	// }


	// clear session
	// Ti.Cloud.Users.logout();
	
	
	var auto_login = Ti.App.Properties.getBool('AUTO_LOGIN');
	if (auto_login) {
		var username = Ti.App.Properties.getString('APP_USERNAME');
		var email = Ti.App.Properties.getString('APP_EMAIL');
		if (email || username) {
			var passwd = Ti.App.Properties.getString('APP_PASSWD');
			Ti.API.info('logging with: ' + username + '/' + email + ' ' + passwd);
			Ti.Cloud.Users.login({
				login : (username)?username:email,
				password : passwd
				}, function(data) {
					Ti.API.info('entering login callback: ' + JSON.stringify(data));
					if (data.success) {
						userMe = data.users[0];
						var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
						var mainTab = new ApplicationTabGroup();
						mainTab.open();
						Ti.App.addEventListener('APP_LOGOUT', function(e){
							mainTab.close();
							var LandingTabGroup = require('ui/common/LandingTabGroup');
							new LandingTabGroup().open();
						});
					}
					else {
						var LandingTabGroup = require('ui/common/LandingTabGroup');
						new LandingTabGroup().open();
					}
			});
		}
		else {
			var LandingTabGroup = require('ui/common/LandingTabGroup');
			new LandingTabGroup().open();
		}
	}
	else {
		var LandingTabGroup = require('ui/common/LandingTabGroup');
		new LandingTabGroup().open();
	}
	
})();
