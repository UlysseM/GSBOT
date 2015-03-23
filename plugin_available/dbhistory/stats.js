var stats = {
    author: 'pironic',
    name: 'stats',
    description: 'Get play stats from the php database.',
    config: {
        url: null,
        permission: ['isListener']
    },
    onCall: function(request) {
        var http = require('http');

        if (typeof stats.config.url !== 'undefined'
            && stats.config.url.length > 0 )
        {
            request.sendChat(request.getTracksInQueue());
            console.log("rawr:")
            console.log(request.getTracksInQueue())
            if (typeof stats.config.url == 'undefined' && request.tracks[request.currentQueueTrackId] == null)
                return;

/*
            var currSongID = request.tracks[request.currentQueueTrackId].songID;
            var songID = parseInt(request.params);
            if (songID.length < 1)
                songID = currSongID;
            var userID = request.userID; // TODO: needs to be the id of the  broadcaster, not the user.

            var url = stats.config.url + "?songid=" + encodeURIComponent(songID) + "&userid=" + encodeURIComponent(userID);
            console.log("/stats query:")
            http.get(url, function(res) {
                console.log("/stats: Got response: " + res.statusCode);
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    request.sendChat(chunk);
                });
            }).on('error', function(e) {
                console.log("/stats: Got error: " + e.message);
            });*/
        }
    }
};

module.exports = {mod: stats};
