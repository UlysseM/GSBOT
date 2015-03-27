var wa = {
 author: 'pironic',
 name: 'wa',
 description: '- ask the bot a question, via Wolfram|Alpha.',
 config: {
     url: null,
     permission: ['isListener']
 },
 onCall: function(request) {
    var http = require('http');

    if (wa.config.url !== null
        && wa.config.url.length > 0)
    {
        console.log("wa|Alpha query:");
        http.get(wa.config.url+encodeURIComponent(request.params), function(res) {
            console.log("/wa: Got response: " + res.statusCode);
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                request.sendChat(chunk);
            });
        }).on('error', function(e) {
            request.sendChat("/wa: Got error: " + e.message);
        });
    }
 }
};

module.exports = {mod: wa};
