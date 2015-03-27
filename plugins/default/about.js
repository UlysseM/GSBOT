var about = {
 author: 'uman',
 name: 'about',
 description: '- About this software.',
 config: {
    permission: ['isListener']
 },
 onCall: function(request) {
    var contributors = '';
    if (GLOBAL.GSBOT_CONTRIBUTORS)
        contributors = ' ~ Contributors : ' + GLOBAL.GSBOT_CONTRIBUTORS.join(' ');
    request.sendChat('This broadcast is currently running "Grooveshark Broadcast Bot" ' + GLOBAL.GSBOTVERSION + ', created by grooveshark.com/uman42 ~ github.com/UlysseM/GSBOT/' + contributors);
 }
};

module.exports = {mod: about};
