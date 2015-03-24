#!/usr/bin/env node

GLOBAL.GSBOTVERSION = '2.0.8BETA';

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
        return manatee.getQueue().guests.indexOf(userid) != -1 || GU.permissionList.isBroadcaster(userid); // a broadcaster could be doing everything a guest could do
    },
    isFollowed: function(userid) {
        return GU.isFollowed.indexOf(userid) != -1;
    },
    isBroadcaster: function(userid) {
        return userid == GU.user.userID;
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
    OnListenerJoin: function(userobj) {
        if (GU.modCallback.onListenerJoin.length)
        {
            var req = request.onUserAction(userobj);
            try {
                GU.modCallback.onListenerJoin.forEach(function(cb){cb(req)});
            } catch (err) {
                console.log(err.stack)
            }
        }
    },
    OnListenerLeave: function(userobj) {
        if (GU.modCallback.onListenerLeave.length)
        {
            var req = request.onUserLogInOut(userobj);
            try {
                GU.modCallback.onListenerLeave.forEach(function(cb){cb(req)});
            } catch (err) {
                console.log(err.stack)
            }
        }
    },

 },

 mergeConfig: function(bcConfig, masterConfig, depth) {
    var bcKeys = Object.keys(bcConfig);
    var msKeys = Object.keys(masterConfig);
    for (var i = 0; i < bcKeys.length; ++i)
    {
        var curr = bcKeys[i];
        if (msKeys.indexOf(curr) == -1 || depth == 0)
        {
            masterConfig[curr] = bcConfig[curr];
        }
        else
        {
            GU.mergeConfig(bcConfig[curr], masterConfig[curr], depth - 1);
        }
    }
 },

 // Call the callback with the user as a parameter, or null if the login failed.
 login: function(config, cb) {
    if (GU.user)
    {
        cb(GU.user);
        return;
    }
    var allBroadcast = Object.keys(config.broadcasts);
    if (allBroadcast.length != 1)
    {
        console.log("Error, there must be ONE broadcast in the config file, no more (will change soon, probably), no less.");
        return;
    }
    var user = allBroadcast[0];
    var bcastConfig = config.broadcasts[user];
    GU.mergeConfig(bcastConfig.plugins_conf, config.plugins_conf, 2);
    var pass = config.broadcasts[user].password;

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
            cb(GU.user, bcastConfig.plugins_enabled);
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

 checkFirstInstall: function(cb) {
    var fs = require('fs');
    fs.exists('config.json', function(exists) {
        if (exists)
        {
            var content = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));
            cb(content);
        }
        else
        {
            require('./core/reconfigure.js').reconfigure(cb);
        }
    });
 },

 init: function() {
    GU.checkFirstInstall(function(config) {
        GU.login(config, function(userinfo, plugins_enabled) {
            if (userinfo && userinfo.userID)
            {
                console.log('Logged successfully as ' + userinfo.FName);
                GU.getFollowing();
                GU.mods = moduleloader.getList(plugins_enabled, config.plugins_conf);
                GU.modCallback = moduleloader.getCallbackList(plugins_enabled, config.plugins_conf);
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
                console.log('Error: cannot login. Probably a wrong login / password. Edit the config.json file or run the reconfigure script.');
            }
        });
    });
 }
};

GU.init();
