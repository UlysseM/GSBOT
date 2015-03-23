var saveSong = {
    author: 'pironic',
    name: 'saveSong',
    description: 'Send to the php database when a song changes.',
    config: {
        url: null,
        secret: null,
        permission: ['guest']
    },
    onSongChange: function(request) {
        var http = require('http');
        var qs = require('querystring');
        var url = require('url');

        if (typeof saveSong.config.url !== 'undefined'
            && saveSong.config.url.length > 0)
        {
            var songToSave = request.oldSong;
            songToSave['uID'] = request.userID +':'+saveSong.config.secret; // TODO add the userid:config.secret to this value.
            songToSave['h'] = request.oldVote;
            songToSave['bcSID'] = 'testValue:'+request.oldVote.queueSongID; //TODO when uman adds built in functionality for bcid.
            songToSave['l'] = request.getListenerCount();
            console.log(songToSave);
            var payload = qs.stringify(songToSave);

            var link = url.parse(saveSong.config.url, true, true);
            var options = {
                host: link.hostname,
                port: link.port,
                path: link.pathname,
                method: 'POST',
                headers: {
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Content-Length': payload.length
                }
            };
            link = null;

            var req = http.request(options, function(resp) {
                console.log('STATUS: '+resp.statusCode);
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
