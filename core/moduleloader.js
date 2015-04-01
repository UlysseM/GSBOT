var request = require('./request.js');

var moduleLoader = {
 allPluginObj: null,
 loaded: false,
 moduleList: {},
 callback: {
    onChatMessageRcv: [],
    onQueueChange: [],
    onSongChange: [],
    onListenerJoin: [],
    onListenerLeave: [],
    onListenerVote: [],
 },

 addAuthor: function(author) {
     if (author instanceof Array)
        author.forEach(function(auth) {
            moduleLoader.addAuthor(auth);
        });
    else if (typeof author == 'string')
    {
        if (!GLOBAL.GSBOT_CONTRIBUTORS)
            GLOBAL.GSBOT_CONTRIBUTORS = [];
        if (GLOBAL.GSBOT_CONTRIBUTORS.indexOf(author) == -1)
            GLOBAL.GSBOT_CONTRIBUTORS.push(author);
    }
 },

 loadModule: function(module, user_conf, sharedObject) {
    if (module.config && user_conf)
    {
        var modConfig = module.config;
        Object.keys(modConfig).forEach(function(key) {
            if (user_conf[key] != undefined)
                modConfig[key] = user_conf[key];
        });
    }
    if (module.author)
    {
        moduleLoader.addAuthor(module.author);
    }
    var init = false;
    if (typeof module.onCall == 'function')
    {
        moduleLoader.moduleList[module.name] = module;
        init = true;
    }
    // Add the mod to the "callback array" it wishes a subscription.
    Object.keys(moduleLoader.callback).forEach(function(cbName) {
        if (typeof module[cbName] == 'function')
        {
            // Wrap all the callbacks so that they can be executed with
            // the correct this context.
            var cb = function() { return module[cbName].apply(module, arguments); };
            moduleLoader.callback[cbName].push(cb);
            init = true;
        }
    });
    if (init && typeof module.init == 'function')
    {
        module.init({
            modList:moduleLoader.moduleList,
            request: request.defaultConstructor(),
            sharedObject: sharedObject,
        });
    }
 },

 getAllPluginsObj: function() {
    if (moduleLoader.allPluginObj)
        return moduleLoader.allPluginObj;

    moduleLoader.allPluginObj = {};

    var fs = require('fs');
    var path = require('path');

    var pluginPath = path.resolve('.', 'plugins');
    fs.readdirSync(pluginPath).forEach(function(pluginName) {
        var plugin = {};
        var currPluginPath = path.resolve(pluginPath, pluginName);
        if (fs.statSync(currPluginPath).isDirectory())
            fs.readdirSync(currPluginPath).forEach(function(module) {
                if (path.extname(module) == '.js')
                {
                    var modulePath = path.resolve(currPluginPath, module);
                    if (fs.statSync(modulePath).isFile())
                    {
                        var module = require(modulePath);
                        if (module.mod && typeof module.mod.name == 'string')
                            plugin[module.mod.name] = module.mod;
                    }
                }
            });
        if (Object.keys(plugin).length)
            moduleLoader.allPluginObj[pluginName] = plugin;
    });
    return moduleLoader.allPluginObj;
 },

 init: function(plugins_enabled, plugins_conf) {
    if (moduleLoader.loaded)
        return;
    moduleLoader.loaded = true;
    var plugins = moduleLoader.getAllPluginsObj();
    Object.keys(plugins).forEach(function(pluginName) {
        if (plugins_enabled.indexOf(pluginName) != -1) // loading this plugin
        {
            var plugin = plugins[pluginName];
            var sharedObject = {};
            Object.keys(plugin).forEach(function(moduleName) { // loading all the module in this plugin
                moduleLoader.loadModule(plugin[moduleName], plugins_conf[pluginName] ? plugins_conf[pluginName][moduleName] : undefined, sharedObject);
            });
        }
    });
 },

 getList: function(plugins_enabled, plugins_conf) {
    moduleLoader.init(plugins_enabled, plugins_conf);
    return moduleLoader.moduleList;
 },

 getCallbackList: function(plugins_enabled, plugins_conf) {
    moduleLoader.init(plugins_enabled, plugins_conf);
    return moduleLoader.callback;
 }
};

module.exports = { getList: moduleLoader.getList, getCallbackList: moduleLoader.getCallbackList, getAllPluginsObj: moduleLoader.getAllPluginsObj };