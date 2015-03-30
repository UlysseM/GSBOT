var onVote = {
 author: 'uman',
 name: 'onVote',
 description: 'Output when a listener votes',
 onListenerVote: function(request) {
    var tracksid = [];
    request.getTracksInQueue().forEach(function(track) {
        tracksid.push(track.id);
    });
    var username = '' + request.getListenerNameFromId(request.userID);
    request.sendChat(username + ' just voted: ' + request.userVote + ', score is now: ' + (Object.keys(request.votes.up).length - Object.keys(request.votes.down).length));
 }
};

module.exports = {mod: onVote};
