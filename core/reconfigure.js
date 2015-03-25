#!/usr/bin/env node

var fs = require('fs');

function get_rl()
{
    try {
        var rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
    } catch (err) {
        if (err.code == 'EINVAL')
        {
            console.log('ERROR: Cygwin isn\'t supported by nodeJS, thus GSBOT (at least, for the configuration).');
            return;
        }
        else
            throw err;
    }
    rl.title = function(title) {
        console.log("");
        console.log("");
        console.log("");
        console.log("==== " + title + " ====");
        console.log("");
    };
    rl.yesno = function(str, callback) {
        var that = this;
        this.question(str + " (y/n): ", function(answer) {
            if (answer[0] == 'y' || answer[0] == 'Y')
                callback(true);
            else if (answer[0] == 'n' || answer[0] == 'N')
                callback(false);
            else
            {
                console.log('Please, answer "y" or "n".');
                that.yesno(str, callback);
            }
        });
    };
    rl.menu = function(title, keys, callback) {
        var that = this;
        this.title(title);
        console.log("Select an option:");
        for (var pos = 0; pos < keys.length; ++pos)
        {
            console.log("[" + (pos + 1) + "] " + keys[pos]);
        }
        this.question("Your selection: ", function (choice) {
            var val = parseInt(choice);
            if (val > 0 && val <= keys.length)
            {
                callback(val - 1);
            }
            else
            {
                console.log("Please enter a value between 1 and " + keys.length);
                that.menu(title, keys, callback);
            }
        });
    };
    return rl;
}

function Config()
{
    this.config = {broadcasts:{}, plugins_conf:{}};
    this.plugins = require('./moduleloader.js').getAllPluginsObj();
    this.pluginsName = Object.keys(this.plugins);
    this.rl = get_rl();

    if (fs.existsSync('config.json'))
        try {
            this.config = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));
        } catch(err) {
            console.log('ERROR: There was an error in the JSON file, fix it or delete it before continuing.');
            throw err;
        }
}

Config.prototype.save = function() {
    fs.writeFileSync('config.json', JSON.stringify(this.config,null, '  '));
}

Config.prototype.addBroadcast = function(cb) {
    var that = this;
    that.rl.title('Adding a broadcast');
    that.rl.question("Please write your grooveshark username (or email) : ", function(bcast) {
        if (that.config.broadcasts[bcast])
        {
            console.log("Error, that broadcast already exists!");
            that.mainMenu(cb);
        }
        else
        {
            that.rl.question("Please write your grooveshark password : ", function(password) {
                console.log("Your username is \'" + bcast + "' and your password is '" + password + "'.");
                that.rl.yesno("Is that correct?", function(res) {
                    if (res)
                    {
                        if (that.config.broadcasts[bcast] == undefined)
                            that.config.broadcasts[bcast] = {plugins_enabled:['default'], plugins_conf:{}};
                        that.config.broadcasts[bcast].password = password;
                        that.broadcastConfig(bcast, cb);
                    }
                    else
                        that.addBroadcast(cb);
                });
            });
        }
    });
}

Config.prototype.changePassword = function(bcast, cb) {
    var that = this;
    console.log("");
    console.log("==== Changing the password of a broadcast ====");
    that.rl.question("Please write the password of the user " + bcast + " : ", function(password) {
        that.config.broadcasts[bcast].password = password;
        console.log("Password changed successfully.");
        that.broadcastConfig(bcast, cb);
    });
}

Config.prototype.confModule = function(bcast, cb) {
    var that = this;
    var bc = that.config.broadcasts[bcast];
    var menu = that.pluginsName.slice();
    for (var i = 0; i < menu.length; ++i)
    {
        var enabled = bc.plugins_enabled.indexOf(menu[i]) != -1;
        menu[i] = (enabled ? 'disable' : 'enable') + ' plugin "' + menu[i] + '" (now ' + (enabled ? 'enabled)' : 'disabled)');
    }
    menu.push("Return to Broadcast Configuration.");
    that.rl.menu('Enable / disable module', menu, function(nbr) {
        if (nbr == that.pluginsName.length)
        {
            that.broadcastConfig(bcast, cb);
        }
        else
        {
            var idx = bc.plugins_enabled.indexOf(that.pluginsName[nbr]);
            if (idx == -1)
                bc.plugins_enabled.push(that.pluginsName[nbr]);
            else
                bc.plugins_enabled.splice(idx, 1);
            that.confModule(bcast, cb);
        }
    });
}

Config.prototype.changeModuleParameter = function(parameter, module, plugin, cb, plugins_conf, bcast) {
    var that = this;
    var title = 'Modification of the parameter "' + plugin + '/' + module + '/' + parameter + ' for ' + (bcast ? 'the broadcast: ' + bcast : 'all broadcasts.');
    var menu = ['Change the parameter'];
    if (plugins_conf[plugin] && plugins_conf[plugin][module] && plugins_conf[plugin][module][parameter])
        menu.push('Revert the value to the module\'s default.');
    menu.push('Return to the parameter selection.');
    that.rl.menu(title, menu, function(res) {
        if (res != 0)
        {
            if (res != menu.length - 1)
            {
                delete plugins_conf[plugin][module][parameter];
                if (Object.keys(plugins_conf[plugin][module]).length == 0)
                    delete plugins_conf[plugin][module];
                if (Object.keys(plugins_conf[plugin]).length == 0)
                    delete plugins_conf[plugin];
            }
            that.changeModuleConfig(module, plugin, cb, plugins_conf, bcast);
        }
        else
        {
            that.rl.question('Enter the JSON formatted parameter you want to put and press enter: ', function(input) {
                var error = false;
                try {
                    var json = JSON.parse(input);
                    if (!plugins_conf[plugin])
                        plugins_conf[plugin] = {};
                    if (!plugins_conf[plugin][module])
                        plugins_conf[plugin][module] = {};
                    plugins_conf[plugin][module][parameter] = json;
                } catch (err) {
                    console.log("ERROR: the JSON was badly formatted: " + err.message);
                    error = true;
                }
                if (error)
                    that.changeModuleParameter(parameter, module, plugin, cb, plugins_conf, bcast);
                else
                    that.changeModuleConfig(module, plugin, cb, plugins_conf, bcast);
            });
        }
    });
}

Config.prototype.changeModuleConfig = function(module, plugin, cb, plugins_conf, bcast) {
    var that = this;
    var title = "Parameter selection for the module " + plugin + "/" + module + ' for ' + (bcast ? 'the broadcast: ' + bcast : 'all broadcasts.');
    var parameters = this.plugins[plugin][module].config;
    var currConfig = plugins_conf[plugin] ? plugins_conf[plugin][module] : undefined;
    var menu = [];
    var paramsName = [];
    Object.keys(parameters).forEach(function(param) {
        paramsName.push(param);
        var def = JSON.stringify(parameters[param]);
        var user = JSON.stringify((currConfig ? currConfig[param] : undefined));
        menu.push('Change parameter "' + param + '" (default: ' + def  + ') (current: ' + user + ')');
    });
    menu.push('Return to the module selection');
    that.rl.menu(title, menu, function(res) {
        if (res == paramsName.length)
            that.moduleConfiguration(plugin, cb, bcast);
        else
            that.changeModuleParameter(paramsName[res], module, plugin, cb, plugins_conf, bcast)
    });
}

Config.prototype.moduleConfiguration = function(plugin, cb, bcast)
{
    var that = this;
    var title = 'Configuration of the plugin "' + plugin + '" for ' + (bcast ? 'the broadcast: ' + bcast : 'all broadcasts');
    var currPlugin = this.plugins[plugin];
    var configurableModule = [];
    var menu = [];
    Object.keys(currPlugin).forEach(function(moduleName) {
        if (currPlugin[moduleName].config)
        {
            configurableModule.push(moduleName);
            menu.push('Change conf of module "' + moduleName + '" (' + currPlugin[moduleName].description +')');
        }
    });
    menu.push("Return to the plugin selection");
    that.rl.menu(title, menu, function(res) {
        if (res == configurableModule.length)
            that.pluginConfiguration(cb, bcast);
        else
            that.changeModuleConfig(configurableModule[res], plugin, cb, (bcast ? that.config.broadcasts[bcast].plugins_conf : that.config.plugins_conf), bcast);
    });
}

Config.prototype.pluginConfiguration = function(cb, bcast)
{
    var that = this;
    var pluginsName = Object.keys(this.plugins);
    var title;
    if (bcast)
    {
        title = 'Broadcast plugin configuration';
        var allPluginsName = pluginsName;
        pluginsName = [];
        this.config.broadcasts[bcast].plugins_enabled.forEach(function(plugEnabled) {
            if (allPluginsName.indexOf(plugEnabled) != -1)
                pluginsName.push(plugEnabled);
        });
    }
    else
        title = 'Global plugin configuration';
    var menu = [];
    pluginsName.forEach(function(plugName) {
        menu.push('Change the configuration of the plugin "' + plugName + '"');
    });
    menu.push("Return to " + (bcast ? "broadcast configuration" : "main menu"));
    that.rl.menu(title, menu, function(res) {
        if (res == pluginsName.length)
        {
            if (bcast)
                that.broadcastConfig(bcast, cb);
            else
                that.mainMenu(cb);
        }
        else
            that.moduleConfiguration(pluginsName[res], cb, bcast);
    });
}

Config.prototype.broadcastConfig = function(bcast, cb) {
    var that = this;
    that.rl.menu('Broadcast menu of account "' + bcast + '"', ["Change password", "Enable/Disable plugins for this broadcast", "Configure plugins for this broadcast", "Return to configuration main menu"], function(res) {
        switch (res) {
        case 0:
            that.changePassword(bcast, cb);
            break;
        case 1:
            that.confModule(bcast, cb);
            break;
        case 2:
            that.pluginConfiguration(cb, bcast);
            break;
        case 3:
            that.mainMenu(cb);
            break;
        }
    });
}

Config.prototype.mainMenu = function(cb) {
    var broadcastsname = Object.keys(this.config.broadcasts);
    if (broadcastsname.length == 0)
    {
        this.addBroadcast(cb);
    }
    else
    {
        var that = this;
        var broadcasts = Object.keys(that.config.broadcasts);
        broadcasts.push('Return to main menu');
        that.rl.menu('Main menu', ["Add a broadcast", "Edit a broadcast", "Delete a broadcast", "Add General PluginConfiguration", "Save and quit"], function(choice) {
            switch (choice) {
            case 0:
                that.addBroadcast(cb);
                break;
            case 1:
                that.rl.menu('Select a broadcast to edit', broadcasts, function(nbr) {
                    if (nbr == broadcasts.length - 1)
                    {
                        that.mainMenu(cb);
                    }
                    else
                    {
                        that.broadcastConfig(broadcasts[nbr], cb);
                    }
                });
                break;
            case 2:
                that.rl.menu('Select a broadcast to delete', broadcasts, function(nbr) {
                    if (nbr != broadcasts.length - 1)
                    {
                        delete that.config.broadcasts[broadcasts[nbr]];
                        console.log('Broadcast ' + broadcasts[nbr] + ' deleted!');
                    }
                    that.mainMenu(cb);
                });
                break;
            case 3:
                that.pluginConfiguration(cb);
                break;
            case 4:
                cb();
            }
        });
    }
}

function reconfigure(cb)
{
    var conf = new Config();
    conf.mainMenu(function() {
        conf.rl.close();
        conf.save();
        if (typeof cb == 'function')
            cb(conf.config);
    });
}

if (require.main === module)
{
    reconfigure();
}

module.exports = {reconfigure: reconfigure};