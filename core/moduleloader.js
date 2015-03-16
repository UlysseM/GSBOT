var moduleLoader = {
 loaded: false,
 moduleList: {},

 loadModule: function(path) {
    var module = require(path);
    if (module.mod && typeof module.mod.name == 'string' && typeof module.mod.onCall == 'function')
    {
        moduleLoader.moduleList[module.mod.name] = module.mod;
        if (typeof module.mod.init == 'function')
        {
            module.mod.init(moduleLoader.moduleList);
        }
    }
 },

 init: function() {
    var fs = require('fs');
    var path = require('path');

    var modpath = path.resolve('.', 'plugin');
    fs.readdir(modpath, function(err, moduledirs) {
        moduledirs.forEach(function(moduledir) {
            moduledir = path.resolve(modpath, moduledir);
            fs.stat(moduledir, function(err, stat) {
                if (stat.isDirectory())
                {
                    fs.readdir(moduledir, function(err, files) {
                        files.forEach(function(file) {
                            file = path.resolve(moduledir, file);
                            fs.stat(file, function(err, stat) {
                                if (stat.isFile())
                                    moduleLoader.loadModule(file);
                            });
                        });
                    });
                }
            });
        });
    });
    moduleLoader.loaded = true;
 },

 getList: function() {
    if (!moduleLoader.loaded)
    {
        moduleLoader.init();
    }
    return moduleLoader.moduleList;
 }
};

module.exports = { getList: moduleLoader.getList };