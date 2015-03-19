#!/usr/bin/env node

var readline = require('readline');
var fs = require('fs');
var path = require('path');

var available_folder = path.resolve('.', 'plugin_available');
var enabled_folder = path.resolve('.', 'plugin_enabled');

console.log("Running the GSBOT plugin configuration!");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function install(directory, cb)
{
    var dest = path.resolve(enabled_folder, directory);
    var origin = path.resolve(available_folder, directory);    
    fs.symlinkSync(origin, dest);
    console.log("Installed " + directory + " successfully!");

    cb();
}

function promptInstall(installList, cb)
{
    if (!installList.length)
    {
        cb();
    }
    else
    {
        rl.question('Do you want to install "' + installList[0] + '"? (y/n):', function(answer) {
            if (answer == 'y' || answer == 'Y')
            {
                install(installList[0], function() {
                    installList.shift();
                    promptInstall(installList, cb);
                });
            }
            else if (answer == 'n' || answer == 'N')
            {
                installList.shift();
                promptInstall(installList, cb);
            }
            else
            {
                console.log("Please answer Y or N.");
                promptInstall(installList, cb);                
            }
        });
    }
}

fs.readdir(available_folder, function(err, moduledirs) {
    var plugins = [];

    if (fs.existsSync(enabled_folder))
    {
        fs.readdirSync(enabled_folder).forEach(function(elem) {
            elem = path.resolve(enabled_folder, elem);
            fs.unlinkSync(elem);
        });
    }
    else
        fs.mkdirSync(enabled_folder);
    
    moduledirs.forEach(function(module) {
        moduledir = path.resolve(available_folder, module);
        if (fs.statSync(moduledir).isDirectory())
            plugins.push(module);
    });
    
    promptInstall(plugins, function(){
        console.log('Configuration completed, enjoy!')
        rl.close();
    });
});
