// This module is used to handle the "suggestions"

function Suggestions(manatee) {
    this.manatee = manatee;
    this.blackList = [];
    this.songs = {};
}

// Print this object neatly.
Suggestions.prototype.toString = function() {
    return 'blocked song: ' + this.blackList + ' ~~ ' + 'Song in suggestion: ' + Object.keys(this.songs);
}

// process the 'sgc' from any source, to Refresh the Suggestion item.
Suggestions.prototype.processSgc = function(sgc) {
    if (sgc instanceof Array)
    {
        this.blackList = [];
        this.songs = {};
        var that = this;
        sgc.forEach(function(suggestion) {
            if (suggestion.u)
            {
                var song = suggestion.s;
                if (song)
                    song = song.b;
                that.addSuggestion(suggestion.s, song, suggestion.u);
            }
            else
            {
                delete that.songs[suggestion.s];
                if (suggestion.bl)
                    that.blackList.push(suggestion.s);
            }
        });
    }
};

// Get the suggestion list and clear the cache.
Suggestions.prototype.refreshList = function(cb) {
    var that = this;
    this.manatee.get({sub:'bcast:p:'+this.manatee.currentBroadcastId,  keys:['sgc']}, function(res) {
        if (res && res.values)
        {
            that.processSgc(res.values[0]);
            if (typeof cb == 'function')
                cb(true);
        }
        else if (typeof cb == 'function')
            cb(false);
    });
};

// Call this when you want to approve a suggestion
Suggestions.prototype.approveSuggestion = function(songid, cb) {
    if (songid in this.songs)
    {
        this.manatee.pub({
            type:"data",
            value:{
                action:"approveSuggestion",
                songID:songid,
            },
            subs: [{
                type:"sub",
                name:this.manatee.getQueue().channel
            }],
            "async":false,
            "persist":false
        }, cb);
    }
    else if (typeof cb == 'function')
        cb(false);
};

// Call this when you want to refuse a suggestion, YET not blocking the track
Suggestions.prototype.removeSuggestion = function(songid, cb) {
    if (songid in this.songs)
    {
        this.manatee.pub({
            type:"data",
            value:{
                action:"rejectSuggestion",
                songID:songid,
                block: false,
            },
            subs: [{
                type:"sub",
                name:this.manatee.getQueue().channel
            }],
            "async":false,
            "persist":false
        }, cb);
    }
    else if (typeof cb == 'function')
        cb(false);
};

// Call this when you want to refuse a suggestion, blocking the track.
Suggestions.prototype.banSuggestion = function(songid, cb) {
    if (songid in this.songs)
    {
        this.manatee.pub({
            type:"data",
            value:{
                action:"rejectSuggestion",
                songID:songid,
            },
            subs: [{
                type:"sub",
                name:this.manatee.getQueue().channel
            }],
            "async":false,
            "persist":false
        }, cb);
    }
    else if (typeof cb == 'function')
        cb(false);
}

// Called when we receive a message from the broadcast
Suggestions.prototype.removeSong = function(songid) {
    var song = this.songs[songid];
    delete this.songs[songid];
    return song;
}

// Called when a user is adding or upvoting a suggestion
Suggestions.prototype.addSuggestion = function(songid, songData, userid) {
    var added = false;
    if (!(songid in this.songs))
    {
        this.songs[songid] = {data: songData, users: []};
        added = true;
    }
    if (userid)
    {
        var song = this.songs[songid];
        var users = this.songs[songid].users;
        if (!song.data && songData)
            song.data = songData;
        if (users.indexOf(userid) == -1)
            song.users.push(userid);
    }
    return added;
}

// Called when a user is removing his vote on a suggestion
Suggestions.prototype.delSuggestion = function(songid, userid) {
    var song = this.songs[songid];
    if (song)
    {
        var index = song.users.indexOf(userid);
        if (index != -1)
            song.users.slice(index, 1);
        if (song.users.length == 0)
        {
            delete this.songs[songid];
            return true;
        }
    }
    return false;
}

module.exports = {Suggestions: Suggestions};
