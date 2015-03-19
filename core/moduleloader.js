var moduleLoader = {
 loaded: false,
 moduleList: {},
 callback: {
    onChatMessageRcv: [],
    onQueueChange: [],
    onSongChange: []
 },

 loadModule: function(path) {
    var module = require(path);
    if (module.mod && typeof module.mod.name == 'string')
    {
        var init = false;
        if (typeof module.mod.onCall == 'function')
        {
            moduleLoader.moduleList[module.mod.name] = module.mod;
            init = true;
        }
        // Add the mod to the "callback array" it wishes a subscription.
        Object.keys(moduleLoader.callback).forEach(function(cbName) {
            if (typeof module.mod[cbName] == 'function')
            {
                moduleLoader.callback[cbName].push(module.mod[cbName]);
                init = true;
            }
        });
        if (init && typeof module.mod.init == 'function')
        {
            module.mod.init(moduleLoader.moduleList);
        }
    }
 },

 init: function() {
    if (moduleLoader.loaded)
        return;
    moduleLoader.loaded = true;

    var fs = require('fs');
    var path = require('path');

    var modpath = path.resolve('.', 'plugin_enabled');
    fs.readdir(modpath, function(err, moduledirs) {
        moduledirs.forEach(function(moduledir) {
            moduledir = path.resolve(modpath, moduledir);
            fs.lstat(moduledir, function(err, stat) {
                var mDir;
                if (stat.isDirectory())
                    mDir = moduledir;
                else if (stat.isSymbolicLink())
                    mDir = fs.readlinkSync(moduledir);
                else
                    return;
                fs.readdir(mDir, function(err, files) {
                    files.forEach(function(file) {
                        file = path.resolve(mDir, file);
                        fs.stat(file, function(err, stat) {
                            if (stat.isFile())
                                moduleLoader.loadModule(file);
                        });
                    });
                });
            });
        });
    });
 },

 getList: function() {
    moduleLoader.init();
    return moduleLoader.moduleList;
 },

 getCallbackList: function() {
    moduleLoader.init();
    return moduleLoader.callback; 
 }
};

module.exports = { getList: moduleLoader.getList, getCallbackList: moduleLoader.getCallbackList };