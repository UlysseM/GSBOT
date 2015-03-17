// This module constitute the API accessible by the modules/plugins.
//
// A Request is sent to every plugin's callback.

var grooveshark = require('./grooveshark.js');
var manatee = require('./manatee.js')

function Request()
{}

Request.prototype.getCurrentGuests = function() {
    return manatee.getQueue().guests;
}

Request.prototype.addSong = function(songid) {
    manatee.getQueue().addSong(songid);
}

Request.prototype.addSongs = function(songsid) {
    manatee.getQueue().addSongs(songsid);
}

Request.prototype.sendChat = function(message) {
    manatee.sendChatMessage(message);
}

Request.prototype.makeGuest = function(userid, permission) {
    manatee.getQueue().makeGuest(userid, permission);
}

Request.prototype.skip = function() {
    manatee.getQueue().skip();
}

Request.prototype.moreCmd = function(obj, cb) {
    grooveshark.more(obj, false, cb);
}

Request.prototype.getTracksInQueue = function() {
    var tracksCpy = manatee.getQueue().tracks.slice();
    if (tracksCpy.length)
        tracksCpy.shift();
    return tracksCpy;
}

Request.prototype.removeSongFromQueue = function(queueSongIDs) {
    manatee.getQueue().removeSongs(queueSongIDs);
}

/********* CONSTRUCTORS *********/

function onCall(userID, followingList, params)
{
    var req = new Request();
    req.userID = userID;
    req.isGuest = manatee.getQueue().guests.indexOf(userID) != -1;
    req.isFollowing = followingList.indexOf(userID) != -1;
    req.params = params;
    return req;
}

module.exports = {onCall: onCall};
