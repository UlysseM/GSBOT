#!/usr/bin/env node

GLOBAL.GSBOTVERSION = '2.0.3BETA';

var grooveshark = require('./core/grooveshark.js');
var manatee = require('./core/manatee.js')
var moduleloader = require('./core/moduleloader.js');
var request = require('./core/request.js');

var GU = {
 user: null,
 pingInterval: null,
 isFollowed: [],
 mods: {},
 modCallback: {},

 getLastBroadcast: function(cb) {
    grooveshark.more({method: 'getUserLastBroadcast'}, false, cb);
 },

 permissionList: {
    guest: function(userid) {
        return manatee.getQueue().guests.indexOf(userid) != -1;
    },
    isFollowed: function(userid) {
        return GU.isFollowed.indexOf(userid) != -1;
    },
    isListener: function(userid) {
        return true;
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
            var req = request.onCall(userid, GU.isFollowed, regResult[3]);
            // TODO: add functionality for eventSilence toggle that when enabled, will silence all non-guest initaiated output, and turn off auto-queuing.
            if (mod && (!mod.config || !mod.config.permission || mod.config.permission.some(function(pname){
                if (typeof GU.permissionList[pname] != 'function')
                    return false;
                return GU.permissionList[pname](userid);
            })))
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
                manatee.sendChatMessage("You do not meet the following permission: " + mod.config.permission);
            }
        }
        if (userid != GU.user.userID)
        {
            if (GU.modCallback.onChatMessageRcv.length)
            {
                var req = request.onCall(userid, GU.isFollowed, msg);
                try {
                    GU.modCallback.onChatMessageRcv.forEach(function(cb){cb(req)});
                } catch (err) {
                    console.log(err.stack)
                }
            }
        }
    },
    OnSongChange: function(oldSong, oldVote, newSong) {
        if (GU.modCallback.onSongChange.length)
        {
            var req = request.onSongChange(oldSong, oldVote, newSong);
            try {
                GU.modCallback.onSongChange.forEach(function(cb){cb(req)});
            } catch (err) {
                console.log(err.stack)
            }
        }
    },
    OnQueueChange: function() {
        if (GU.modCallback.onQueueChange.length)
        {
            var req = request.defaultConstructor();
            try {
                GU.modCallback.onQueueChange.forEach(function(cb){cb(req)});
            } catch (err) {
                console.log(err.stack)
            }
        }
    },
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
        grooveshark.more({method: 'getFavorites', parameters: {userID: GU.user.userID, ofWhat: "Users"}},
        false,
        function(alluser) {
            alluser.forEach(function(single) {
                GU.isFollowed.push(parseInt(single.UserID));
            });
        });
 },

 // copy the file from ./core/config.dist to ./config.js
 createConfigFile: function(cb) {
    var fs = require('fs');
    if (!fs.existsSync('plugin_enabled'))
    {
        console.log("Error: You should run the EnablePlugins script !");
        return;
    }
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
                GU.modCallback = moduleloader.getCallbackList();
                GU.getLastBroadcast(function(lastBroadcast) {
                    manatee.init(userinfo, GU.manateeCallback, function(boolres) {
                        manatee.broadcast(lastBroadcast, function(success){
                            if (success)
                                console.log("We are now broadcasting!");
                            else
                                console.log("Something wrong happened, please submit a bug report containing the logs.");
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
