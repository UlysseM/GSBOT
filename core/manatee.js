// This modules contains most of the logic of the program.
// This is where we connect with Manatee.

var manatee = {
 blackboxId: 0,
 manateeSocket: null,
 gsConfig: null,
 currentBroadcastId: '',
 userInfo: null,
 manateeReconstruction: '',
 blackboxCallback: [],
 subCallback: {},
 queue: null,
 currentTrack: null,
 broadcastDesc: '',

 // Needs to be set somewhere else.
 callback: {
    OnSocketClose: null,
    OnChatMessageRcv: null,
    OnSongChange: null,
    OnQueueChange: null
 },

 getQueue: function() {
    if (!manatee.queue)
    {
        var Queue = require('./queue.js').Queue;
        manatee.queue = new Queue(manatee);
    }
    return manatee.queue;
 },

 manateeCallBackOnMessage: function(message) {
     console.log("\033[31m" + JSON.stringify(message) + '\033[0m');
    if (message.blackbox && message.blackbox._cid)
    {
        var id = message.blackbox._cid;
        if (typeof manatee.blackboxCallback[id] === 'function')
            manatee.blackboxCallback[id](message);
        delete manatee.blackboxCallback[id];
    }
    if (message.command == 'push')
    {
        switch (message.type) {
        case 'publish':
            if (message.publish && message.publish.destination && manatee.subCallback[message.publish.destination] != undefined)
            {
                manatee.subCallback[message.publish.destination](message.type, message.publish);
            }
            break;
        case 'subinfo_change':
            if (message.subinfo_change && message.subinfo_change.sub && manatee.subCallback[message.subinfo_change.sub] != undefined)
            {
                manatee.subCallback[message.subinfo_change.sub](message.type, message.subinfo_change);
            }
            break;
        case 'sub_alert':
            if (message.sub_alert && message.sub_alert.sub && manatee.subCallback[message.sub_alert.sub] != undefined)
            {
                manatee.subCallback[message.sub_alert.sub](message.type, message.sub_alert);
            }
            break;
        case 'unsub_alert':
            if (message.unsub_alert && message.unsub_alert.sub && manatee.subCallback[message.unsub_alert.sub])
            {
                console.log('Not sure why getting an unsub alert, let\'s resub...');
                manatee.sub([{overwrite_params:false,sub:message.unsub_alert.sub}], [manatee.subCallback[message.unsub_alert.sub]]);
            }
            break;
        default:
            console.log("************************************WARNING************************** Push not parsed!"); // todo
        }
    }
 },

 rebuildData: function() {
    var newLine = manatee.manateeReconstruction.indexOf('\n');
    if (newLine != -1)
    {
        var newStr = manatee.manateeReconstruction.substring(0, newLine);
        manatee.manateeReconstruction = manatee.manateeReconstruction.substring(newLine + 1);
        manatee.manateeCallBackOnMessage(JSON.parse(newStr));
        manatee.rebuildData();
    }
 },

 getSocket: function(cb) {
    if (manatee.manateeSocket)
    {
        cb(manatee.manateeSocket);
    }
    else
    {
        require('./grooveshark.js').getGsConfig(function(gsConfig) {
            manatee.gsConfig = gsConfig;
            var manateeServerUrl = Object.keys(gsConfig.chatServersWeighted)[0];
            manatee.manateeSocket = require('net').createConnection(443, manateeServerUrl, function() {
                manatee.manateeSocket.on('data', function(chunk) {
                    manatee.manateeReconstruction += chunk;
                    manatee.rebuildData();
                });
                manatee.manateeSocket.on('close', function() {
                    if (manatee.callback.OnSocketClose)
                        manatee.callback.OnSocketClose();
                });
                cb(manatee.manateeSocket);
            });
        });
    }
 },

 sendManateeMessage: function (command, params, cb) {
     manatee.getSocket(function (socket) {
        var blackboxId = ++manatee.blackboxId;
        manatee.blackboxCallback[blackboxId] = cb;
        var msg = JSON.stringify({command: command, params:params, blackbox: {_cid: blackboxId}});
        console.log("\033[32m" + msg + "\033[0m");
        socket.write(msg+"\n");
    });
 },

 // login matinee
 identify: function (cb) {
    manatee.sendManateeMessage('identify', {
        app_data: manatee.userInfo.chatUserData,
        invisible: false,
        userid: '' + manatee.userInfo.userID,
        app_sig: manatee.userInfo.chatUserDataSig,
        sessionid: manatee.gsConfig.sessionID
    }, function (message) {
        if (typeof cb === 'function')
        {
            if (message.type == 'success')
            {
                manatee.gsConfig.uid = message.success.id.uid;
                cb(message.success.loggedin);
            }
            else
                cb(false);
        }
    });
 },

 set: function(params, cb) {
    manatee.sendManateeMessage('set', params, function (message) {
        if (typeof cb === 'function')
            cb(message.type == 'success');
    });
 },

 meta_sub: function(params, cb) {
    manatee.sendManateeMessage('meta_sub', params, function (message) {
        if (typeof cb === 'function')
        {
            cb(message.type == 'success', message.success);
        }
    });
 },

 sub: function(params, callback_on_push, cb) {
    manatee.sendManateeMessage('sub', {
        add:true,
        subs: params
    }, function (message) {
        if (message.type == 'success')
            for (var i = 0; i < callback_on_push.length; ++i)
            {
                if (typeof callback_on_push[i] === 'function')
                {
                    manatee.subCallback[params[i].sub] = callback_on_push[i];
                }
            }
        if (typeof cb === 'function')
            cb(message.type == 'success' || (message.type == 'return' && message.return[0].return == 'success'), message.success);
    });
 },

 unsub: function(params, cb) {
    manatee.sendManateeMessage('sub', {
        rm: true,
        subs: params
    }, function (message) {
        if (message.type == 'success' && params.rm == true)
            for (var i = 0; i < params.length; ++i)
            {
                delete manatee.subCallback[params[i].sub];
            }
        if (typeof cb === 'function')
            cb(message.type == 'success' || (message.type == 'return' && message.return[0].return == 'success'));
    });
 },

 pub: function(params, cb) {
    manatee.sendManateeMessage('pub', params, function (message) {
        if (typeof cb === 'function')
            cb(message.type == 'success' || (message.type == 'return' && message.return[0].return == 'success'));
    });
 },

 get: function(params, cb) {
    if (typeof cb === 'function')
        manatee.sendManateeMessage('get', params, function (message) {
            cb(message.return);
        });
 },

sendChatMessage: function(msg, cb) {
    manatee.pub({
        type:"data",
        value: {
            type:"chat",
            data: msg,
            ignoreTag: false,
            playingSongID: manatee.getQueue().getCurrentSongPlaying()
        },
        subs: [{
                type:"sub",
                name:"bcast:p:" + manatee.currentBroadcastId
        }],
        async:false,
        persist:true
    }, cb);
},

 globalCallback: function(type, msg) {
     console.log('{global callback}');
 },

 queueCallback: function(type, msg) {
    console.log('{queue callback}');
    switch (type)
    {
    case "subinfo_change":
        if (msg.params && msg.params.publishers)
            manatee.getQueue().updatePublisher(msg.params.publishers);
        break;
    case 'publish':
        if (msg.value)
        {
            switch (msg.value.action) {
            case 'pendingDestruction':
                manatee.getQueue().playRandom();
                break;
            case 'complianceIssue':
                manatee.pub({
                    type:"data",
                    value: {
                        action:"disableMobileCompliance",
                    },
                    subs: [{
                        type:"sub",
                        name: manatee.getQueue().channel
                    }],
                    async:false,
                    persist:false
                });
                break;
            case 'queueUpdate':
                if (msg.value.type == 'add')
                {
                    var addPos = msg.value.options.index;
                    msg.value.songs.forEach(function(song) {
                        manatee.getQueue().qAdd(song.b.sID, song.queueSongID, addPos++, song.b.sN, song.b.arN, song.b.alN);
                    });
                    if (!manatee.getQueue().currentlyPlayingSong)
                    {
                        manatee.getQueue().forcePlay();
                    }
                }
                else if (msg.value.type == 'remove')
                {
                    msg.value.songs.forEach(function(song) {
                        manatee.getQueue().qDel(song.queueSongID);
                    });
                }
                else if (msg.value.type == 'move')
                {
                    manatee.getQueue().moveSongs(msg.value.songs, msg.value.options.index);
                }
                if (typeof manatee.callback.OnQueueChange == 'function')
                    manatee.callback.OnQueueChange();
                break;
            case 'addSongs':
            case 'removeSongs':
                break; // handled through queueUpdate
            case 'queueReset':
                if (msg.value.songs)
                {
                    manatee.getQueue().qAddSongs(msg.value.songs);
                    if (typeof manatee.callback.OnQueueChange == 'function')
                        manatee.callback.OnQueueChange();
                }
                break;
            case 'updateSettings':
                if (msg.value.settings && msg.value.settings.description)
                    manatee.broadcastDesc = msg.value.settings.description;
                break;
            case undefined:
            case 'getQueue':
                if (msg.value.response && msg.value.response.songs)
                    manatee.getQueue().qAddSongs(msg.value.response.songs);
                break;
            default:
                console.log("NOT CHECKING " + msg.value.action); // todo
                break;
            }
        }
        break;
    }
  },

 broadcastCallback: function(type, msg) {
    console.log('{broadcast callback}');
    switch (type)
    {
    case "subinfo_change":
        if (msg.params && msg.params.s)
        {
            if (msg.params.s.active)
            {
                manatee.getQueue().qClean(msg.params.s.active.queueSongID);
                if (typeof manatee.callback.OnSongChange == 'function' && manatee.currentTrack && manatee.currentTrack.active.queueSongID != msg.params.s.active.queueSongID)
                {
                    manatee.callback.OnSongChange(manatee.currentTrack.active.b, manatee.currentTrack.votes, msg.params.s.active.b);
                }
                if (typeof manatee.callback.OnQueueChange == 'function')
                    manatee.callback.OnQueueChange();
                manatee.currentTrack = msg.params.s;
            }
            if (msg.params.s.next == null)
            {
                console.log("NEXT IS NULL! Adding track for smooth transition.");
                manatee.getQueue().playRandom();
            }
        }
        break;
    default:
        break;
    }
 },

 broadcastChatCallback: function(type, msg) {
    console.log('{broadcast chat callback}');
    switch (type)
    {
    case 'publish':
        if (msg.value && msg.value.type == 'chat')
        {
            if (manatee.callback.OnChatMessageRcv)
                manatee.callback.OnChatMessageRcv(parseInt(msg.id.userid), msg.value.data);
            return;
        }
        if (msg.value && msg.value.type == 'activeSongVote')
        {
            var data = msg.value.data;
            if (manatee.currentTrack && manatee.currentTrack.votes && manatee.currentTrack.votes.queueSongID == data.queueSongID)
            {
                delete manatee.currentTrack.votes.up[msg.id.userid];
                delete manatee.currentTrack.votes.down[msg.id.userid];
                if (data.vote == 1)
                    manatee.currentTrack.votes.up[msg.id.userid] = 1;
                else if (data.vote == -1)
                    manatee.currentTrack.votes.down[msg.id.userid] = 1;
            }
        }
        break;
    }
 },

 subToBroadcast: function(bcast, cb) {
    if (manatee.currentBroadcastId == bcast)
    {
        if (typeof cb === 'function')
            cb(true);
    }
    else
    {
        if (manatee.currentBroadcastId != '')
        {
            manatee.unsub([
                {
                    sub:"bcast:" + manatee.currentBroadcastId
                },
                {
                    sub:"bcast:p:" + manatee.currentBroadcastId
                }
            ]);
        }
        manatee.currentBroadcastId = bcast;
        manatee.sub([
            {
                create_when_dne:false,
                overwrite_params:false,
                sub:"bcast:" + manatee.currentBroadcastId
            },
            {
                create_when_dne:false,
                overwrite_params:false,
                sub:"bcast:p:" + manatee.currentBroadcastId
            }
        ], [manatee.broadcastCallback, manatee.broadcastChatCallback], cb);
    }
 },

 userCallback: function(type, msg) {
    console.log('{user callback}');
    switch (type)
    {
    case "publish":
        if (msg.value.type == 'masterPromotion')
        {
            manatee.getQueue().currentlyPlayingSong = (msg.value.params.currentlyPlayingSong == 1);
            // Subscribe to the broadcast here, and Force start it.
            if (msg.value.params.currentBroadcast)
            {
                manatee.subToBroadcast(msg.value.params.currentBroadcast);
                if (!manatee.getQueue().currentlyPlayingSong)
                {
                    if (manatee.getQueue().tracks.length)
                        manatee.getQueue().playRandom();
                    else
                        manatee.getQueue().forcePlay();
                }
                return;
            }
        }
        break;
    }
 },

 setBroadcastDesc: function(newDesc, cb) {
    manatee.pub({
        "type":"data",
        "value": {
            "action":"updateSettings",
            "settings": {
                "description":newDesc,
            },
        },
        subs: [{
            type:"sub",
            name:this.getQueue().channel
        }],
        async:false,
        persist:false
    });
 },

 getBroadcastDesc: function() {
    return manatee.broadcastDesc;
 },

 connectQueueToBroadcast: function(lastBroadcast, ownerID, cb) {
    manatee.pub({
        type:"data",
        value: {
            setupQueue: manatee.getQueue().channel,
            ownerID: ownerID,
            queue:{
                userID: manatee.userInfo.userID,
                name: lastBroadcast.Name,
                isRandomName: lastBroadcast.IsRandomName,
                description: lastBroadcast.Description,
                image:"",
                privacy: lastBroadcast.Privacy,
                tag: lastBroadcast.Tag,
                version:4,
                vipUsers:[],
                bannedUserIDs:[],
                attachType:"user",
                attachID: manatee.userInfo.userID,
                settings: {
                    "suggestionsEnabled":true,
                    "chatEnabled":true
                },
                clientVersion:1.1,
                queueChannel: manatee.getQueue().channel,
                isBroadcast:true
            }
        },
        subs: [{
            type:"sub",
            name:manatee.gsConfig.remoraChannel
        }]
    }, cb)
 },

 takeOverBroadcast: function(cb) {
    manatee.sub([
        {
            overwrite_params:false,
            sub: manatee.getQueue().channel
        }
    ], [function(type, data) {
        if (type == 'publish' && data.value && data.value.blackbox && data.value.blackbox.getFullQueue == 1)
        {
            if (data.value.response && data.value.response.songs instanceof Array)
            {
                manatee.getQueue().qReset();
                if (manatee.getQueue().currentQueueTrackId)
                {
                    manatee.getQueue().qAddSongs(data.value.response.songs);
                }
                if (typeof manatee.callback.OnQueueChange == 'function')
                    manatee.callback.OnQueueChange();

                // Create the pub_uuid in order to takeover!
                var sha1sum = require('crypto').createHash('sha1');
                sha1sum.update(manatee.gsConfig.uid);
                var pub_uuid  = sha1sum.digest('hex').substr(0, 12);
                manatee.pub({
                    type:"data",
                    value: {
                        action:"takeover",
                        uuid:pub_uuid,
                        clientVersion:1.1
                    },
                    subs: [{
                        type:"sub",
                        name:manatee.getQueue().channel
                    }],
                    async:false,
                    persist:false
                }, function(success) {
                    if (!manatee.getQueue().currentQueueTrackId)
                        manatee.getQueue().playRandom();
                    cb(success);
                });
            }
        }
        else
            manatee.queueCallback(type, data);
    }], function() {
        manatee.pub({
            type:"data",
            value: {
                action:"getQueue",
                blackbox:{getFullQueue:true}
            },
            subs: [{
                type:"sub",
                name:manatee.getQueue().channel
            }],
            "async":false,
            "persist":false
        });
    });
 },

 createBroadcast: function(lastBroadcast, cb) {
     // subscribe to queueChannel
    manatee.sub([
        {
            overwrite_params:false,
            sub: manatee.getQueue().channel
        }
    ], [function(type, data) {
        if (type == 'publish' && data.value.available)
        {
            manatee.connectQueueToBroadcast(lastBroadcast, data.value.available, cb);
        }
        else
            manatee.queueCallback(type, data);
    }], function() {
        manatee.set({
            sub: manatee.getQueue().channel,
            keyvals: [
                {
                    key:"owners",
                    value: [{
                        type:"userid",
                        name: manatee.userInfo.userID
                    }]
                },
                {
                    key:"sub_alert",
                    value:true
                }
            ]
        }, function () {
            // callback for when the ownerid is ready !
            manatee.pub({
                type:"data",
                value: {
                    setup: manatee.getQueue().channel
                },
                subs:[{
                    type:"sub",
                    name: manatee.gsConfig.remoraChannel
                }]
            });
        });
    });
 },

 broadcast: function(lastBroadcast, cb) {
    manatee.broadcastDesc = lastBroadcast.Description;
    manatee.get({keys:["s"],userid:manatee.userInfo.userID}, function(res) {
        if (res.values && res.values[0] && res.values[0].bcastOwner == 1)
        {
            manatee.subToBroadcast(res.values[0].bcast, function(success, ret) {
                if (!success || ret[0].params.qc == undefined)
                {
                    manatee.createBroadcast(lastBroadcast, cb);
                    return;
                }
                manatee.broadcastDesc = ret[0].params.d;
                console.log("AFTER " + manatee.broadcastDesc);
                manatee.getQueue().channel = ret[0].params.qc;
                manatee.getQueue().updatePublisher(ret[0].params.publishers);
                if (ret[0].params.h && ret[0].params.h.s)
                {
                    for (var i = 0; i < ret[0].params.h.s.length; ++i)
                        manatee.getQueue().pushAvailableQueueTrackId(ret[0].params.h.s[i].queueSongID);
                }
                if (ret[0].params.s.active)
                {
                    manatee.getQueue().currentQueueTrackId = ret[0].params.s.active.queueSongID;
                }
                manatee.takeOverBroadcast(cb);
            });
        }
        else
        {
            manatee.createBroadcast(lastBroadcast, cb);
        }
    });
 },

 ping: function(cb) {
    manatee.pub({
        type:"data",
        value: {
            action:"ping",
            idle:false,
            away:false,
            blackbox:{"remoraRespID":3}
        },
        subs: [{
            type:"sub",
            name: manatee.getQueue().channel
            }],
        sync:false,
        persist:false
    }, cb);
 },

 init: function(userInfo, mancallback, cb) {
    manatee.userInfo = userInfo;
    manatee.callback.OnSocketClose = mancallback.OnSocketClose;
    manatee.callback.OnChatMessageRcv = mancallback.OnChatMessageRcv;
    manatee.callback.OnSongChange = mancallback.OnSongChange;
    manatee.callback.OnQueueChange = mancallback.OnQueueChange;

    manatee.getQueue(); // preload the queue now.
    manatee.getSocket(function() {
        manatee.identify(function(valid) {
            if (valid)
            {
                manatee.set({
                    keyvals: [
                        {
                            key:"i",
                            readable:"global",
                            value: {
                                p:manatee.userInfo.Picture,
                                n:manatee.userInfo.FName,
                                y:false
                            }
                        }
                    ]
                }, function(valid) {
                    manatee.sub([{"overwrite_params":false,"sub":"global"},{"overwrite_params":false,"sub":"user:" + manatee.userInfo.userID}], [manatee.globalCallback, manatee.userCallback], cb);
                });
            }
            else
                cb(false);
        });
    });
 }
};

// We only need to export more, let's keep the program simple :)
module.exports = {
 broadcast: manatee.broadcast,
 getQueue: manatee.getQueue,
 init: manatee.init,
 ping: manatee.ping,
 sendChatMessage: manatee.sendChatMessage,
 setBroadcastDesc: manatee.setBroadcastDesc,
 getBroadcastDesc: manatee.getBroadcastDesc
};
