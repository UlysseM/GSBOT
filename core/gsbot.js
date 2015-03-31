var grooveshark = require('./grooveshark.js');
var manatee = require('./manatee.js')
var moduleloader = require('./moduleloader.js');
var request = require('./request.js');

GLOBAL.GSBOT_QUIET = false;

var GU = {
 user: null,
 pingInterval: null,
 isFollowed: [],
 isWhiteListed: [],
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
    isWhiteListed: function(userid) {
        return GU.isWhiteListed.indexOf(userid) != -1;
    },
    isListener: function(userid) {
        return !GLOBAL.GSBOT_QUIET;
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
            var req = request.onCall(userid, GU.isFollowed, GU.isWhiteListed, regResult[3]);
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
                    manatee.sendChatMessage("BOT WARNING: The extension " + mod.name + " by " + mod.author + " threw an error...", true);
                    console.log(err.stack);
                }
            }
            else if (mod)
            {
                if (!GLOBAL.GSBOT_QUIET)
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
            var req = request.onUserAction(userobj);
            try {
                GU.modCallback.onListenerLeave.forEach(function(cb){cb(req)});
            } catch (err) {
                console.log(err.stack)
            }
        }
    },
    OnListenerVote: function(allVotes, userid, uservote) {
        if (GU.modCallback.onListenerVote.length)
        {
            var req = request.onListenerVote(allVotes, userid, uservote);
            try {
                GU.modCallback.onListenerVote.forEach(function(cb){cb(req)});
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
 login: function(user, pass, cb) {
    if (user == '' || pass == '')
    {
        cb(null);
        return;
    }

    grooveshark.more({
        method: 'authenticateUser',
        parameters: {
            username: user,
            password: pass
        }
    }, true, function(message) {
        if (message == undefined)
        {
            cb(null);
        }
        else
        {
            GU.user = message;
            cb(GU.user);
        }
    });
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

 init: function(obj) {
    GU.login(obj.user, obj.config.password, function(userinfo) {
        if (userinfo && userinfo.userID)
        {
            console.log('Logged successfully as ' + userinfo.FName);
            GU.getFollowing();
            GU.isWhiteListed = obj.whiteList;
            GU.mods = moduleloader.getList(obj.config.plugins_enabled, obj.config.plugins_conf);
            GU.modCallback = moduleloader.getCallbackList(obj.config.plugins_enabled, obj.config.plugins_conf);
            GU.getLastBroadcast(function(lastBroadcast) {
                manatee.init(userinfo, GU.manateeCallback, function(boolres) {
                    manatee.broadcast(lastBroadcast, function(success){
                        if (success)
                            console.log("We are now broadcasting!");
                        else
                        {
                            console.log("Something wrong happened, please submit a bug report containing the logs.");
                            process.exit(0);
                        }
                    });
                    GU.pingInterval = setInterval(function(){manatee.ping()}, 30000);
                });
            });
        }
        else
        {
            console.log('Error: cannot login. Probably a wrong login / password. Edit the config.json file or run the reconfigure script.');
            process.exit(0);
        }
    });
 }
};

process.on('message', function(obj) {
    GLOBAL.GSBOTVERSION = obj.version;
    GU.init(obj);
});
