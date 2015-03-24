var about = {
 author: 'uman',
 name: 'about',
 description: '- About this software.',
 config: {
    permission: ['isListener']
 },
 onCall: function(request) {
    request.sendChat('This broadcast is currently running "Grooveshark Broadcast Bot" ' + GLOBAL.GSBOTVERSION + ', created by grooveshark.com/uman42 and grooveshark.com/pironic, which is open source! Got a feature or code fix? Submit it to our open repository via pull request at github.com/UlysseM/GSBOT/');
 }
};

module.exports = {mod: about};
