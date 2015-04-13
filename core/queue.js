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

    // If we can't load the collection soon enough for some reason, we have at least one song to start the broadcast with...
    this.collection = [25032044];
    // The list of current Guest
    this.guests = [];

    // This list will be filled whenever a song is played OR was added randomly.
    this.playedRecently = [];
    // The max size of the playRecently array.
    this.playedRecentlyLimit = 50;

    // We don't store any played track in the queue, so we use this offset.
    this.offsetTrack = 0;
    // set it to the higher queueTrackID encountered.
    this.availableQueueTrackId = 1;
    // The local queue
    this.tracks = [];
    // the queueTrackID of the song currently playing
    this.currentQueueTrackId = null;
    // The last value returned by the broadcast. Are we currently playing songs?
    this.currentlyPlayingSong = false;
    // This counts the number of track we are currently adding (aka waiting for callback).
    this.addingTrack = 0;
    this.playingTrack = 0;
    // This represents the queueTrackId of the last song added to the collection.
    this.lastCollectionQueueTrackId = -1;

    // recover the collection
    this.refreshCollection();
}

Queue.prototype.refreshCollection = function() {
    var more = require('./grooveshark.js').more;
    var that = this;
    more({
        method:'userGetSongIDsInLibrary',
        parameters: {}
    }, false, function(data) {
        if (!(data && data.SongIDs))
            data = {SongIDs: []}; // create the data.SongIDs array
        more({
            method:'userGetFavoriteSongsSongIDs',
            parameters: {}
        }, false, function(favs) {
            if (favs && favs instanceof Array)
            {
                favs.forEach(function(fav) {
                    if (data.SongIDs.indexOf(fav) == -1)
                        data.SongIDs.push(fav);
                });
            }
            if (data.SongIDs.length)
                that.collection = data.SongIDs;
            else
                console.log('Your collection AND favorite are empty, going to play the default song...');
        });
    });
};

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
};

// submit to the server a song to be added at the end of the queue
Queue.prototype.addSong = function(songid, cb) {
    this.addingTrack++;
    var that = this;
    this.manatee.pub({
        type:"data",
        value: {
            action:"addSongs",
            songIDs:[songid],
            queueSongIDs:[ this.availableQueueTrackId++ ],
            index: this.getLastIndex() + 1,
        },
        subs: [{
            type:"sub",
            name: this.channel
        }],
        async:false,
        persist:false
    }, function(res) {
        that.addingTrack--;
        if (typeof cb == 'function')
            cb(res);
    });
};

// add multiple songs
Queue.prototype.addSongs = function(songsid, cb) {
    this.addingTrack++;
    var queuesongsids = [];
    for (var i = 0; i < songsid.length; i++)
    {
        queuesongsids.push(this.availableQueueTrackId++);
    }
    var that = this;
    this.manatee.pub({
        type:"data",
        value: {
            action:"addSongs",
            songIDs:songsid,
            queueSongIDs:queuesongsids,
            index: this.getLastIndex() + 1,
        },
        subs: [{
            type:"sub",
            name: this.channel
        }],
        async:false,
        persist:false
    }, function(res) {
        that.addingTrack--;
        if (typeof cb == 'function')
            cb(res);
    });
}

Queue.prototype.shuffle = function(cb) {
    if (this.tracks.length == 0)
        return;

    var m = this.tracks.length - 1, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = this.tracks[m + 1];
        this.tracks[m + 1] = this.tracks[i + 1];
        this.tracks[i + 1] = t;
    }
    this.resetQueue(cb);
}

// Ask server to remove song in the array
Queue.prototype.removeSongs = function(queueSongIDs, cb) {
    if (queueSongIDs instanceof Array && queueSongIDs.length)
    {
        this.manatee.pub({
            type:"data",
            value: {
                "action":"removeSongs",
                "queueSongIDs":queueSongIDs,

            },
            subs: [{
                type:"sub",
                name:this.channel
            }],
            async:false,
            persist:false
        }, cb);
    }
    else if (typeof cb == 'function')
        cb(false);
}

// Ask the server to play a random track from the collection
Queue.prototype.playRandom = function(cb) {
    if (this.collection.length == 0)
    {
        console.log('Collection is empty!');
        return;
    }
    if (this.addingTrack > 0)
        return;
    var trackId;
    for (var i = 0; i < 10; ++i)
    {
        trackId = Math.floor(Math.random() * this.collection.length);
        if (this.playedRecently.indexOf(trackId) == -1)
            break;
    }
    this.addPlayedRecently(trackId);
    this.addSong(this.collection[trackId], cb);
    this.lastCollectionQueueTrackId = this.availableQueueTrackId - 1;
};

Queue.prototype.addPlayedRecently = function(songid) {
    var pos = this.playedRecently.indexOf(songid);
    if (pos != -1)
        this.playedRecently.splice(pos, 1);
    this.playedRecently.push(songid);
    if (this.playedRecently.length > this.playedRecentlyLimit)
        this.playedRecently.shift();
};

// Ask the server to skip the current song
Queue.prototype.skip = function() {
    if (this.tracks.length <= 1)
        return false;
    var that = this;
    that.playingTrack += 1;
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
    }, function() {
        that.playingTrack -= 1;
    });
    return true;
}

// Ask the server to move tracks at some relative position, 0 being the song after the current being played.
Queue.prototype.moveTracks = function(queueSongIds, relativeIndex, cb) {
    this.manatee.pub({
        type:"data",
        value: {
            action:"moveSongs",
            queueSongIDs:queueSongIds,
            index:relativeIndex + this.offsetTrack + 1
        },
        subs: [{
            type:"sub",
            name:this.channel
        }],
        async:false,
        persist:false
    }, cb);
}

// Send OUR VERSION of the queue to the server.
Queue.prototype.resetQueue = function(cb) {
    var songid = [];
    var queuesongid = [];
    this.getTracksArray(songid, queuesongid)
    if (songid.length == 0)
        return;
    this.offsetTrack = 0;
    this.manatee.pub({
        type:"data",
        value: {
            action:"resetQueue",
            songIDs: songid,
            queueSongIDs: queuesongid,
        },
        subs: [{
            type:"sub",
            name: this.channel
        }],
        async:false,
        persist:false
    }, cb);
}

// Submit to the server the queue we have stored locally
Queue.prototype.forcePlay = function(cb) {
    if (this.tracks.length == 0 || this.playingTrack > 0)
        return;
    var that = this;
    this.playingTrack += 1;
    var firstSongId = this.tracks[0].qid;
    that.manatee.pub({
        type:"data",
        value: {
            action:"playSong",
            queueSongID: firstSongId,
            country: that.manatee.gsConfig.country,
            sourceID:1,
            streamType:0,
            position:0.0,
            options:{},
        },
        subs: [{
            type:"sub",
            name: that.channel
        }],
        async:false,
        persist:false
    }, function(params) {
        that.playingTrack -= 1;
        if (typeof cb == 'function')
            cb(params);
    });
}

// Add to the local queue a track with its index
Queue.prototype.qAdd = function(trackId, queueid, index, name, artist, album) {
    // If the track with the queueid is in the list, remove it (as we might move it)
    this.qDel(queueid);

    var relativeIndex = index - this.offsetTrack;
    this.tracks.splice(relativeIndex, 0, {id: trackId, qid: queueid, sN:name, arN: artist, alN: album});
    this.pushAvailableQueueTrackId(queueid);
}

// Add to the local queue at the end of the list
Queue.prototype.qPush = function(trackId, queueid, name, artist, album) {
    this.tracks.push({id: trackId, qid: queueid, sN:name, arN: artist, alN: album});
    this.pushAvailableQueueTrackId(queueid);
}

// Delete from the local queue
Queue.prototype.qDel = function(queueid) {
    var idx = this.findQidIdx(queueid);
    if (idx != -1)
        this.tracks.splice(idx, 1);
}

// Remove all tracks previously played from the local queue
Queue.prototype.qClean = function(currentPlayingQueueId) {
    if (currentPlayingQueueId != undefined)
        this.currentQueueTrackId = currentPlayingQueueId;
    while (this.tracks.length && this.tracks[0].qid != this.currentQueueTrackId)
    {
        this.addPlayedRecently(this.tracks.shift().id);
        ++this.offsetTrack;
    }
    if (this.tracks.length == 0)
        this.askSync();
    else
        this.addPlayedRecently(this.tracks[0].id);
    console.log('LOCAL QUEUE STATUS: offset:' + this.offsetTrack + ', inside:');
    console.log(this.tracks);
    // Sometimes, the queue gets REALLY long, preventing user to re suggest a song.
    // This will flush the history after 10 plays.
    if (this.offsetTrack >= 10)
    {
        this.resetQueue();
    }
}

// Reset the current local queue
Queue.prototype.qReset = function() {
    this.offsetTrack = 0;
    while (this.tracks.length)
        this.tracks.shift();
}

Queue.prototype.qAddSongs = function(songArray) {
    this.qReset();
    var that = this;
    songArray.forEach(function(song) {
        that.qPush(song.b.sID, song.queueSongID, song.b.sN, song.b.arN, song.b.alN);
    });
    this.qClean(); // We want to make sure the broadcast knows what track we are playing.
}

// Get the ID of the track we are playing right now, 0 if none
Queue.prototype.getIdCurrentSongPlaying = function() {
    if (this.tracks.length)
        return this.tracks[0].id;
    return 0;
}

// Get the track we are playing right now, null if none
Queue.prototype.getCurrentSongPlaying = function() {
    if (this.tracks.length)
        return this.tracks[0];
    return null;
}

// Fills the two empty array passed as a parameter. On the first one, we fill the trackId, on the second one the queueTrackId.
Queue.prototype.getTracksArray = function(tid, qid) {
    this.tracks.forEach(function(track) {
        tid.push(track.id);
        qid.push(track.qid);
    });
}

// push a queue track in this to check if availableQueueTrackId needs to be incremented.
Queue.prototype.pushAvailableQueueTrackId = function(id) {
    if (id >= this.availableQueueTrackId)
        this.availableQueueTrackId = id + 1;
}

Queue.prototype.findQidIdx = function(qid) {
    for (var i = 0; i < this.tracks.length; ++i)
        if (qid == this.tracks[i].qid)
            return i;
    return -1;
}

Queue.prototype.moveSongs = function(tracks, newIdx)
{
    var arrTrack = [];
    newIdx -= this.offsetTrack;
    for (var i = 0; i < tracks.length; ++i)
    {
        var tPos = this.findQidIdx(tracks[i].queueSongID);
        if (tPos <= 0)
        {
            this.askSync(); // the track is nowhere to be found OF is the current track playing.
            return;
        }
        arrTrack.push(this.tracks[tPos])
        if (newIdx > tPos)
            newIdx -= 1;
        this.tracks.splice(tPos, 1);
    }
    if (newIdx < 1)
    {
        return; // I guess those songs were just removed.
    }
    this.tracks.splice.apply(this.tracks, [newIdx, 0].concat(arrTrack));
}

Queue.prototype.askSync = function() {
   this.manatee.pub({
        type:"data",
        value: {
            action:"getQueue",
        },
        subs: [{
            type:"sub",
            name:this.channel
        }],
        "async":false,
        "persist":false
    });
}

// Send the "publisher" object to update the current guest list
Queue.prototype.updatePublisher = function(publishers) {
    var guests = this.guests;
    guests.splice(0, guests.length);
    var broadcasterid = this.manatee.userInfo.userID;
    publishers.forEach(function(pub) {
        if (pub.name != broadcasterid)
            guests.push(parseInt(pub.name));
    });
}

// Get the last Index from the queue
Queue.prototype.getLastIndex = function() {
    return this.tracks.length + this.offsetTrack;
}

module.exports = {Queue: Queue};
