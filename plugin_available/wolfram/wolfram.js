var wolfram = {
 author: 'pironic',
 name: 'wa',
 description: '- ask the bot a question, via Wolfram|Alpha.',
 config: {
     url: null,
     permission: ['isListener']
 },
 onCall: function(request) {
    var http = require('http');

    if (typeof wolfram.config.url !== 'undefined'
        && wolfram.config.url.length > 0)
    {
        console.log("wolfram|Alpha query:")
        http.get(wolfram.config.url+encodeURIComponent(request.params), function(res) {
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

module.exports = {mod: wolfram};
