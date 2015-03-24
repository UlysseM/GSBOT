var saveSong = {
    author: 'pironic',
    name: 'saveSong',
    description: 'Send to the php database when a song changes.',
    config: {
        url: null,
        key: null,
        permission: ['guest']
    },
    onSongChange: function(request) {
        var http = require('http');
        var url = require('url');

        if (saveSong.config.url !== null
            && saveSong.config.url.length > 0)
        {
            var songToSave = request.oldSong;
            songToSave['key'] = saveSong.config.key;
            songToSave['uID'] = request.getBroadcastInfo().userID;
            songToSave['h'] = request.oldVote;
            songToSave['bcSID'] = request.getBroadcastInfo().broadcastID+':'+request.oldVote.queueSongID;
            songToSave['l'] = request.getListenerCount();
            console.log(songToSave);
            var payload = JSON.stringify(songToSave);

            console.log("saveSong query:" + saveSong.config.url + '?saveSong');
            var link = url.parse(saveSong.config.url, true, true);
            var options = {
                host: link.hostname,
                port: link.port,
                path: link.pathname + '?saveSong',
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    'Content-Length': payload.length
                }
            };
            link = null;

            var req = http.request(options, function(resp) {
                console.log('saveSong response code: '+resp.statusCode);
                resp.on('data', function(chunk) {
                    request.sendChat('BODY: '+chunk);
                    console.log('HEADERS: '+JSON.stringify(resp.headers));
                })


            })
            req.write(payload);
            req.end();
        }
    }
};

module.exports = {mod: saveSong};
