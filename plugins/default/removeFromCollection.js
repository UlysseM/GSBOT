var removeFromCollection = {
 author: 'uman',
 name: 'removeFromCollection',
 description: '- Remove the song currently playing from the broadcaster\'s collection.',
 config: {
    permission: ['isWhiteListed']
 },
 onCall: function(request) {
    var userId = request.getBroadcastInfo().userID;
    var song = request.getCurrentSongPlaying();
    request.moreCmd({
        method:'userRemoveSongsFromLibrary',
        parameters: {
            userID: userId,
            songIDs: [song.id],
            albumIDs: [],
            artistIDs: []            
        }
    }, function(cb) {
        if (cb)
        {
            request.sendChat(song.sN + ' is no longer in the collection (if it has ever been there in the first place)!');
            request.refreshLocalCollection();
        }
    });
 }
};

module.exports = {mod: removeFromCollection};
