#!/usr/bin/env node

GLOBAL.GSBOTVERSION = '2.0.13-RC_1';

var child_process = require('child_process');


var broadcasts = {};

function mergeConfig(bcConfig, masterConfig, depth)
{
    var bcKeys = Object.keys(bcConfig);
    var msKeys = Object.keys(masterConfig);
    for (var i = 0; i < bcKeys.length; ++i)
    {
        var curr = bcKeys[i];
        if (msKeys.indexOf(curr) == -1 || depth == 0)
        {
            masterConfig[curr] = bcConfig[curr];
        }
        else
        {
            mergeConfig(bcConfig[curr], masterConfig[curr], depth - 1);
        }
    }
}

function printChunk(base, chunk)
{
	console.log(base + chunk.toString().replace(/\n$/, '').replace(/\n/g, '\n' + base));
}

function startBroadcast(bcast)
{
	var child = child_process.fork('./core/gsbot.js', [], {
		cwd: __dirname,
		silent:true,
	});
	child.send(bcast);
	child.stdout.on('data', function (chunk) {
		printChunk(bcast.user + ': ', chunk);
	});
	child.stderr.on('data', function (chunk) {
		printChunk('[ERR]' + bcast.user + ': ', chunk);
	});
	child.on('exit', function(code) {
		console.log('!!!! User ' + bcast.user + ' exited with code ' + code + (code ? 'Restarting...' : ''));
		if (code)
			setTimeout(function() {
				delete bcast.child;
				startBroadcast(bcast);
			}, 1000);
	});
	bcast.child = child;
}

function BroadcastManager(config, cb)
{
    var allBroadcast = Object.keys(config.broadcasts);
	if (allBroadcast.length == 0)
	{
		console.log('You need at least one broadcast to start.');
	}
	for (var i = 0; i < allBroadcast.length; ++i)
	{
		var user = allBroadcast[i];
		var bcastConfig = config.broadcasts[user];
		var whiteList = [];
		var merged_conf = JSON.parse(JSON.stringify(config.plugins_conf));
	
		mergeConfig(bcastConfig.plugins_conf, merged_conf, 2);
		delete bcastConfig.plugins_conf;
		bcastConfig.plugins_conf = merged_conf;
	    if (config.whiteList instanceof Array)
			Array.prototype.push.apply(whiteList, config.whiteList);
		if (bcastConfig.whiteList instanceof Array)
			Array.prototype.push.apply(whiteList, bcastConfig.whiteList);
		broadcasts[user] = { user: user, config: bcastConfig, whiteList: whiteList, version: GLOBAL.GSBOTVERSION };
		startBroadcast(broadcasts[user]);
	}
}

function checkFirstInstall(cb)
{
    var fs = require('fs');
    fs.exists('config.json', function(exists) {
        if (exists)
        {
            var content = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));
            cb(content);
        }
        else
        {
            require('./core/reconfigure.js').reconfigure(cb);
        }
    });
}

checkFirstInstall(function (config) {
	BroadcastManager(config, function() {
		console.log('Done !');
	});
});

//GU.init();

// var cp = require('child_process');
// var child = cp.fork('./core/gsbot.js', [], {
// 	cwd: __dirname,
// 	silent:true,
// });
// child.stdout.on('data', function(chunk) {
// 	console.log('RECEIVED: ', '' + chunk);
// });
// child.send('TOTORO');
// child.on('exit', function(err) {console.log('Closed process');console.log(err)});