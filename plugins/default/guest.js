var guest = {
 author: 'uman',
 name: 'guest',
 description: '- Toogle your guest status.',
 config: {
    permission: ['guest', 'isFollowed', 'isWhiteListed']
 },
 onCall: function(request) {
    if (request.userID == request.getBroadcastInfo().userID)
        return;
    if (request.isGuest)
        request.makeGuest(request.userID, 0);
    else
        request.makeGuest(request.userID, 103);
 }
};

module.exports = {mod: guest};
