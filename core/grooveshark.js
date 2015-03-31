// This module creates a session and provide easy access to the grooveshark private API through "more.php".

var grooveshark = {
 client: 'htmlshark',
 clientRevision: '20130520',
 secret: 'nuggetsOfBaller',
 url: 'grooveshark.com',
 tokenData: null,

 genToken: function(method, tokenData) {
    var salt = '';
    var hex = '0123456789abcdef';
    for (var i = 0; i < 6; ++i)
        salt += hex[Math.round(Math.random() * 15)];
    var shasum = require('crypto').createHash('sha1');
    shasum.update(method + ':' + tokenData.getCommunicationToken + ':' + grooveshark.secret + ':' + salt);
    return salt + shasum.digest('hex');
 },

 // The callback will be called with the headers in the first param, and the body in the
 callback: function(res, cb) {
    var ret = '';
    res.on('data', function(chunk) { ret += chunk; });
    res.on('end', function(chunk) {cb(ret); });
 },

 callbackJson: function(res, cb) {
    grooveshark.callback(res, function(str) {
        cb(JSON.parse(str));
    });
 },

 getTokenData: function(cookie, cb) {
    var options = {
        hostname: grooveshark.url,
        path: '/preload.php?getCommunicationToken=1',
        method: 'GET',
        headers: {
            Cookie: cookie
        },
    };

    require('http').get(options, function(res) {
        grooveshark.callback(res, function(content) {
            var tokenData = JSON.parse(content.substring(content.indexOf('{'), content.indexOf('\n') - 1));
            var md5sum = require('crypto').createHash('md5');
            md5sum.update(tokenData.getGSConfig.sessionID);
            tokenData.getGSConfig.sessionPart = md5sum.digest('hex').substr(0, 6);
            cb(tokenData);
        })
    }).on('error', function(e) {
        console.log('ERROR while creating the session, please restart the bot.', e.message);
        throw e;
    });
 },

 // Callback the cb with the SSID as a parameter.
 getSession: function(cb, force) {
    if (grooveshark.tokenData != null && force !== true)
    {
        cb(grooveshark.tokenData);
    }
    else
    {
        if (grooveshark.tokenData)
        {
            grooveshark.getTokenData('PHPSESSID=' + grooveshark.tokenData.getGSConfig.sessionID, function (tokenData) {
                grooveshark.tokenData.getCommunicationToken = tokenData.getCommunicationToken;
                cb(grooveshark.tokenData);
            });
        }
        else
        {
            grooveshark.getTokenData('', function (tokenData) {
                grooveshark.tokenData = tokenData;
                cb(grooveshark.tokenData);
            });
        }
    }
 },

 getGsConfig: function(cb) {
    grooveshark.getSession(function (tokenData) {
        cb(tokenData.getGSConfig);
    });
 },

 more: function(obj, secure, cb) {
    grooveshark.getSession(function (tokenData) {
        var options = {
            hostname: grooveshark.url,
            path: '/more.php?' + obj.method,
            method: 'POST',
            headers: {
                Cookie: 'PHPSESSID=' + tokenData.getGSConfig.sessionID
            },
        };

        var payload = {
            header: {
                client: grooveshark.client,
                clientRevision: grooveshark.clientRevision,
                collectStats: true,
                country: tokenData.getGSConfig.country,
                privacy: 0,
                session: tokenData.getGSConfig.sessionID,
                token: grooveshark.genToken(obj.method, tokenData),
            },
            method: obj.method,
            parameters: obj.parameters
        };

        var request = (secure ? require('https') : require('http')).request(options, function(res){
            grooveshark.callbackJson(res, function(jsonData) {
                if (jsonData.fault)
                {
                    if (jsonData.fault.code == 256) // expired token
                    {
                        grooveshark.getSession(function(tokenData) {
                            grooveshark.more(obj, secure, cb);
                        }, true); // force new token
                    }
                    else
                    {
                        cb(jsonData.fault); // could create a crash if the plugin author isn't careful, but it could also provide good debug info.
                    }
                }
                else
                    cb(jsonData.result);
            });
        });

        request.on('error', function(err) {console.log('MORE ERROR: ', err.message, ' With request ', payload); cb();});
        request.write(JSON.stringify(payload));
        request.end();
    });
 },
};

module.exports = { more: grooveshark.more, getGsConfig: grooveshark.getGsConfig };
