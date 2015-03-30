var saveSong = {
    author: 'pironic',
    name: 'saveSong',
    description: 'Send to the php database when a song changes.',
    config: {
        url: null,
        key: null,
        verboseErrors: false
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
                    if (resp.statusCode == 403 && saveSong.config.verboseErrors) {
                        request.sendChat('The song vote history was not saved to the database. It looks as though your api key needs to be updated in your GSBOT config.')
                    }
                    else if (saveSong.config.verboseErrors) {
                        request.sendChat('There was an error code '+resp.statusCode+' encountered while saving the song vote history.')
                        console.log('BODY: ' + chunk);
                    }
                    console.log('HEADERS: '+JSON.stringify(resp.headers));
                })


            });
            req.on('error', function(e) {
                console.log('saveSong error caught: ' + e.message);
            });
            req.write(payload);
            req.end();
        }
    }
};

module.exports = {mod: saveSong};
