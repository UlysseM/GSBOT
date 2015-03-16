var ping = {
 author: 'uman',
 name: 'ping',
 description: '- Ping the BOT, also prints your USERID.',
 onCall: function(request) {
    request.sendChat('Ping resp! Oh, and your ID is ' + request.userID);
 },
};

module.exports = {mod: ping};
