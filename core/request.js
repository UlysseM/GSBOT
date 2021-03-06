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

Request.prototype.shuffle = function() {
    manatee.getQueue().shuffle();
}

Request.prototype.moveTrack = function(queueSongId, newRelativePos) {
    manatee.getQueue().moveTracks([queueSongId], newRelativePos);
}

Request.prototype.moveTracks = function(queueSongIds, newRelativePos) {
    manatee.getQueue().moveTracks(queueSongIds, newRelativePos);
}

Request.prototype.getBroadcastInfo = function() {
    return manatee.getBroadcastInfo();
}

Request.prototype.setBroadcastDesc = function(name) {
    if (typeof name == 'string')
        manatee.setBroadcastDesc(name);
}

Request.prototype.getCurrentSongPlaying = function() {
    return manatee.getQueue().getCurrentSongPlaying();
}

Request.prototype.getTracksInQueue = function() {
    var tracksCpy = manatee.getQueue().tracks.slice();
    if (tracksCpy.length)
        tracksCpy.shift();
    return tracksCpy;
}

Request.prototype.refreshLocalCollection = function() {
    manatee.getQueue().refreshCollection();
}

Request.prototype.removeSongsFromQueue = function(queueSongIDs) {
    manatee.getQueue().removeSongs(queueSongIDs);
}

Request.prototype.getLastCollectionQueueTrackId = function() {
    return manatee.getQueue().lastCollectionQueueTrackId;
}

Request.prototype.getListenerCount = function() {
    return manatee.getListeners().getListenerCount();
}

Request.prototype.getAdvancedListenerCount = function() {
    var listeners = manatee.getListeners();
    return {
        anonymous: listeners.getAnonymousCount(),
        logged: listeners.getUserCount(),
        total: listeners.getListenerCount()
    };
}

Request.prototype.getListenersId = function() {
    return manatee.getListeners().getListenersId();
}

// Return the name of the listener, or null if the user isn't listening to the broadcast.
Request.prototype.getListenerNameFromId = function(userid) {
    return manatee.getListeners().getNameFromId(userid);
}

Request.prototype.getSuggestions = function() {
    return manatee.getSuggestions().songs;
}

Request.prototype.getBlockedSongsId = function() {
    return manatee.getSuggestions().blackList.slice();
}

Request.prototype.approveSuggestion = function(sid, cb) {
    manatee.getSuggestions().approveSuggestion(sid, cb);
}

Request.prototype.removeSuggestion = function(sid, cb) {
    manatee.getSuggestions().removeSuggestion(sid, cb);
}

Request.prototype.banSuggestion = function(sid, cb) {
    manatee.getSuggestions().banSuggestion(sid, cb);
}

/********* CONSTRUCTORS *********/

function defaultConstructor()
{
    return new Request();
}

function onCall(userID, followingList, whiteList, params)
{
    var req = new Request();
    req.userID = userID;
    req.isGuest = manatee.getQueue().guests.indexOf(userID) != -1;
    req.isFollowing = followingList.indexOf(userID) != -1;
    req.isWhiteListed = whiteList.indexOf(userID) != -1;
    req.params = params;
    return req;
}

function onUserAction(userobj)
{
    var req = new Request();
    req.anonymous = !userobj.userid;
    req.userID = userobj.userid;
    req.username = req.anonymous ? null : userobj.app_data.n;
    return req;
}

function onSongChange(oldSong, oldVote, newSong)
{
    var req = new Request();
    req.oldSong = oldSong;
    req.oldVote = oldVote;
    req.newSong = newSong;
    return req;
}

function onListenerVote(allVotes, userid, uservote)
{
    var req = new Request();
    req.votes = allVotes;
    req.userID = userid;
    req.userVote = uservote;
    return req;
}

module.exports = {defaultConstructor: defaultConstructor, onCall: onCall, onSongChange: onSongChange, onUserAction: onUserAction, onListenerVote: onListenerVote};
