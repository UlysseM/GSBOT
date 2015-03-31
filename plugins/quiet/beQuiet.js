var beQuiet = {
 author: 'uman',
 name: 'beQuiet',
 description: '- Toogle the quiet mode, where listeners cannot run modules that require the permission isListener.',
 config: {
    permission: ['isWhiteListed']
 },
 onCall: function(request) {
    GLOBAL.GSBOT_QUIET = !GLOBAL.GSBOT_QUIET;
    request.sendChat('Quiet mode is now ' + (GLOBAL.GSBOT_QUIET ? 'enabled.' : 'disabled.'));
 }
};

module.exports = {mod: beQuiet};
