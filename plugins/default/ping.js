var ping = {
 author: ['uman', 'pironic'],
 name: 'ping',
 description: '- Ping the BOT, also prints your USERID and Access Levels.',
 config: {
    permission: ['isListener']
 },
 onCall: function(request) {
    // a little more verbose ping/pong response. Tell the user what access they have too.
    var strAccess = " isListener";
    if (request.isGuest)
        strAccess += ", isGuest";
    if (request.isFollowing)
        strAccess += ", isFollowed";
    if (request.isWhiteListed)
        strAccess += ', isWhiteListed';
    request.sendChat('Pong! Your ID is ' + request.userID + ' and you have the following permissions: ' + strAccess + '.');
 },
};

module.exports = {mod: ping};
