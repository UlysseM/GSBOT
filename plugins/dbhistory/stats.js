var stats = {
    author: 'pironic',
    name: 'stats',
    description: '- Get play stats from the php database.',
    config: {
        url: null,
        key: null,
        permission: ['isListener']
    },
    onCall: function(request) {
        var http = require('http');

        if (stats.config.url !== null
            && stats.config.url.length > 0 )
        {
            if (request.params == null && request.getCurrentSongPlaying() == null)
                return;

            var currSongID = request.getCurrentSongPlaying().id;
            var songID = parseInt(request.params);
            if (isNaN(songID))
                songID = currSongID;
            var userID = request.getBroadcastInfo().userID;

            var url = stats.config.url + "?getStats&key=" + encodeURIComponent(stats.config.key) + "&userid=" + encodeURIComponent(userID) + "&songid=" + encodeURIComponent(songID);
            console.log("/stats query:" + url);
            http.get(url, function(res) {
                console.log("/stats response code: " + res.statusCode);
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    request.sendChat(chunk);
                });
            }).on('error', function(e) {
                console.log("/stats ERROR: " + e.message);
            });
        }
    }
};

module.exports = {mod: stats};
