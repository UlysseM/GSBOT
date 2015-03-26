var addToCollection = {
 author: 'uman',
 name: 'addToCollection',
 description: '- Add the song currently playing to the broadcaster\'s collection.',
 config: {
    permission: ['isWhiteListed']
 },
 onCall: function(request) {
    var song = request.getCurrentSongPlaying();
    request.moreCmd({
        method:'getQueueSongListFromSongIDs',
        parameters: {
            songIDs: [song.id]
        }
    }, function(songData) {
        if (songData instanceof Array && songData.length)
        {
            var newSong = {
                albumID: songData[0].AlbumID,
                albumName: songData[0].AlbumName,
                artFilename: (songData[0].CoverArtFilename ? songData[0].CoverArtFilename : ''),
                artistID: songData[0].ArtistID,
                artistName: songData[0].ArtistName,
                isVerified: songData[0].IsVerified,
                songID: songData[0].SongID,
                songName: songData[0].Name,
                track: parseInt(songData[0].TrackNum)
            };
            request.moreCmd({
                method:'userAddSongsToLibrary',
                parameters: {
                    songs: [ newSong ]
                }
            }, function(cb) {
                if (cb && cb.Timestamps.affectedRows == 1)
                    request.sendChat(song.sN + ' was added to the broadcaster\'s collection!');
                else if (cb)
                    request.sendChat(song.sN + ' already is in the broadcaster\'s collection!');
            });
        }
    });
 }
};

module.exports = {mod: addToCollection};
