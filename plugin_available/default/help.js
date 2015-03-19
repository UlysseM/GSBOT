var help = {
 author: 'uman',
 name: 'help',
 description: '- Display this help.',
 config: {
    permission: ['isListener']
 },
 mods: {},
 onCall: function(request) {
    if (request.params != undefined)
    {
        var action = help.mods[request.params];
        if (action && action.description)
        {
            request.sendChat('Help: /' + action.name + ' ' + action.description);
            return;
        }
    }
    var msg;
    msg = 'Command available:';
    Object.keys(help.mods).forEach(function (actionName) {
        msg += ' ' + actionName;
    });
    msg += '. Type /help [command name] for in depth help.';
    request.sendChat(msg);
 },
 init: function(mods) {
    help.mods = mods;
 }
};

module.exports = {mod: help};
