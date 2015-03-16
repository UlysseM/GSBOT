// This module is used to handle the "queue"
// Here, the queue stands for two things:
//  - The grooveshark object with the channelID
//  - The local queue of song that are going to be played.
//
// This part is closely linked to manatee.

function Queue(manatee) {
    this.manatee = manatee;

    // create queueChannel
    var md5sum = require('crypto').createHash('md5');
    md5sum.update(manatee.userInfo.userID + Date.now() + "");
    this.channel = md5sum.digest('hex');
    
     // If we can't load the collection soon enough for some reason, we have at least one song to start the broadcast with.
    this.collection = [25032044];
    // The list of current Guest
    this.guests = [];

    // We don't store any played track in the queue, so we use this offset.
    this.offsetTrack = 0;
    // The local queue
    this.tracks = [];
    // The last value returned by the broadcast. Are we currently playing songs?
    this.currentlyPlayingSong = false;
    
    // recover the collection
    {
        var params = {method:'userGetSongIDsInLibrary',parameters: {}};
        var more = require('./grooveshark.js').more;
        var callback;
        var that = this;
        var retry = 5;
        callback = function(data) {
            if (data && data.SongIDs)
            {
                if (data.SongIDs.length)
                {
                    that.collection = data.SongIDs;
                }
                else
                    console.log('Your collection is empty, it will play the default song.');
            }
            else if (--retry > 0)
                more(params, false, callback);
        };
        more(params, false, callback);
    }
}


/**************************************/
/**************************************/
/******* NOW BUILDING THE QUEUE *******/
/**************************************/
/**************************************/

// Guest someone (or unguest if permission == 0)
Queue.prototype.makeGuest = function(userID, permission, cb) {
    var value;
    if (permission != 0)
    {
        value = {
            action:"addSpecialGuest",
            userID: parseInt(userID),
            permission:permission
        };
    }
    else
    {
        value = {
            action:"removeSpecialGuest",
            userID: parseInt(userID),
        };
    }
    this.manatee.pub({
        type:"data",
        value: value,
        subs: [{
            type:"sub",
            name: this.channel
        }],
        async:false,
        persist:false
    }, cb);
}

// submit to the server a song to be added at the end of the queue
Queue.prototype.addSong = function(songid, cb) {
    this.manatee.pub({
        type:"data",
        value: {
            action:"addSongs",
            songIDs:[songid],
            queueSongIDs:[ this.getLastQueueId() + 1],
            index: this.getLastIndex() + 1,
        },
        subs: [{
            type:"sub",
            name: this.channel
        }],
        async:false,
        persist:false
    }, cb);
};

Queue.prototype.playRandom = function(cb) {
    if (this.collection.length == 0)
    {
        console.log('Collection is empty!');
        return;
    }
    var trackId = Math.floor(Math.random() * this.collection.length);
    this.addSong(this.collection[trackId], cb);
}

Queue.prototype.skip = function() {
    if (this.tracks.length <= 1)
        return false;
    this.manatee.pub({
        type:"data",
        value: {
            action:"playSong",
            queueSongID: this.tracks[1].qid,
            country: this.manatee.gsConfig.country,
            sourceID:1,
            streamType:0,
            position:0,
            options: {
                fromUserNext:true,
                noReset:false,
                skipShuffle:true,
                params: {
                    prefetch:false,
                    country: this.manatee.gsConfig.country,
                    type:0,
                    songID:this.tracks[1].id 
                },
                fastFetch:false
            }
        },
        subs: [{
            type:"sub",
            name:this.channel
        }],
        async:false,
        persist:false
    });
    return true;
}

// Submit to the server the queue we have stored locally
Queue.prototype.forcePlay = function(cb) {
    var songid = [];
    var queuesongid = [];
    this.getTracksArray(songid, queuesongid)
    this.offsetTrack = 0;

    if (songid.length == 0)
    {
        console.log('Cannot force play if the queue is empty');
        return;
    }
    this.manatee.pub({
        type:"data",
        value: {
            action:"resetQueue",
            songIDs: songid,
            queueSongIDs: queuesongid,
            blackbox:{"remoraRespID":1}
        },
        subs: [{
            type:"sub",
            name: this.channel
        }],
        async:false,
        persist:false
    });
    this.manatee.pub({
        type:"data",
        value: {
            action:"playSong",
            queueSongID: queuesongid[0],
            country: this.manatee.gsConfig.country,
            sourceID:1,
            streamType:0,
            position:0.0,
            options:{},
            blackbox:{"remoraRespID":2}
        },
        subs: [{
            type:"sub",
            name: this.channel
        }],
        async:false,
        persist:false
    }, cb);
}

// Add to the local queue a track with its index
Queue.prototype.qAdd = function (trackId, queueid, index) {
    // If the track with the queueid is in the list, remove it (as we might move it)
    var posInQueue = -1;
    if (this.tracks.some(function(t){++posInQueue;return t.qid == queueid;}))
        this.tracks.splice(posInQueue);

    var relativeIndex = index - this.offsetTrack;
    this.tracks.splice(relativeIndex, 0, {id: trackId, qid: queueid});
}

// Remove all tracks previously played from the local queue
Queue.prototype.qClean = function(currentPlayingQueueId) {
    while (this.tracks.length && this.tracks[0].qid != currentPlayingQueueId)
    {
        this.tracks.shift();
        ++this.offsetTrack;
    }
    console.log('LOCAL QUEUE STATUS: offset:' + this.offsetTrack + ', inside:');
    console.log(this.tracks);
}

// Get the ID of the track we are playing right now, 0 if none
Queue.prototype.getCurrentSongPlaying = function() {
    if (this.tracks.length)
        return this.tracks[0].id;
    return 0;
}

// Fills the two empty array passed as a parameter. On the first one, we fill the trackId, on the second one the queueTrackId.
Queue.prototype.getTracksArray = function(tid, qid) {
    this.tracks.forEach(function(track) {
        tid.push(track.id);
        qid.push(track.qid);
    });
}

// Get the last queueTrackId from the queue
Queue.prototype.getLastQueueId = function() {
    var last = 0;
    this.tracks.forEach(function(track) {
        if (track.qid > last)
            last = track.qid;
    });
    return last;
}

// Get the last Index from the queue
Queue.prototype.getLastIndex = function() {
    return this.tracks.length + this.offsetTrack;
}

module.exports = {Queue: Queue};
