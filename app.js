#!/usr/bin/env node

var grooveshark = require('./core/grooveshark.js');
var manatee = require('./core/manatee.js')
var moduleloader = require('./core/moduleloader.js');
var request = require('./core/request.js');

var GU = {
 user: null,
 pingInterval: null,
 followingList: [],
 mods: {},
 
 getLastBroadcast: function(cb) {
	grooveshark.more({method: 'getUserLastBroadcast'}, false, cb);
 },
 
 permissionList: {
	guest: function(userid) {
		return manatee.getQueue().guests.indexOf(userid) != -1;
	},
	broadcaster: function(userid) {
		return GU.followingList.indexOf(userid) != -1;
	}
 },

 manateeCallback: {
	OnSocketClose: function() {
		console.log('Matanee socket is down.');
	},
	OnChatMessageRcv: function(userid, msg) {
		var regexp = RegExp('^/([a-zA-Z]*)([ ]+(.+))?$');
		var regResult = regexp.exec(msg);
		if (regResult != null)
		{
			var mod = GU.mods[regResult[1]];
			var req = request.onCall(userid, GU.followingList, regResult[3]);
			if (mod && (!mod.permission || mod.permission.some(function(pname){return GU.permissionList[pname](userid)})))
			{
				try {
					mod.onCall(req);
				} catch (err) {
					manatee.sendChatMessage("BOT WARNING: The extension " + mod.name + " by " + mod.author + " threw an error...");
					console.log(err.stack);
				}
			}
			else if (mod)
			{
				manatee.sendChatMessage("You do not meet the following permission: " + mod.permission);
			}
		}
	}
 },

 // Call the callback with the user as a parameter, or null if the login failed.
 login: function(cb) {
	if (GU.user)
	{
		cb(GU.user);
		return;
	}
	var config = require('./config.js');
	var user = config.username;
	var pass = config.password;
	
	if (user == '' || pass == '')
	{
		cb(null);
		return;
	}
	
	var parameters = {method: 'authenticateUser', parameters: {username: user, password: pass}};
	var callback;
	callback = function(message) {
		if (message == undefined)
		{
			grooveshark.more(parameters, true, callback);
		}
		else
		{
			GU.user = message;
			cb(GU.user);
		}
	};
	grooveshark.more(parameters, true, callback);
 },
	
 getFollowing: function() {
		grooveshark.more({method: 'userGetFollowersFollowingExt', parameters: {}},
		false,
		function(alluser)
		{
			alluser.forEach(function(single)
			{
				if (single.IsFavorite === '1')
				{
					GU.followingList.push(parseInt(single.UserID));
				}
			});
		});
	},
	
 // copy the file from ./core/config.dist to ./config.js
 createConfigFile: function(cb) {
	var fs = require('fs');
	fs.exists('config.js', function(exists) {
		if (exists)
		{
			cb();
		}
		else
		{
			var stream = fs.createReadStream('core/config.dist');
			stream.pipe(fs.createWriteStream('config.js'));
			stream.on('close', cb);
		}
	});
 },
	
 init: function() {
	GU.createConfigFile(function() {
		GU.login(function(userinfo) {
			if (userinfo && userinfo.userID)
			{
				console.log('Logged successfully as ' + userinfo.FName);
				GU.getFollowing();
				GU.mods = moduleloader.getList();
				GU.getLastBroadcast(function(lastBroadcast) {
					manatee.init(userinfo, GU.manateeCallback, function(boolres) {
						manatee.broadcast(lastBroadcast, function(a){
							console.log("Broadcasting !");
							console.log(a);
						});
						GU.pingInterval = setInterval(function(){manatee.ping()}, 30000);
					});
				});
			}
			else
			{
				console.log('Error: cannot login. Make sure to fill your username and password in the file \'config.js\'');
			}
		});
	});
 }
};

GU.init();
