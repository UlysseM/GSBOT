var grooveshark = require('./grooveshark.js');
var manatee = require('./manatee.js')

function Request()
{}

Request.prototype.getCurrentGuests = function() {
    return manatee.getQueue().guests;
}

Request.prototype.addSong = function(songid) {
    manatee.getQueue().AddSong();
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
