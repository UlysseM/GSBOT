var guest = {
 author: 'uman',
 name: 'guest',
 description: '- Toogle your guest status.',
 permission: ['guest', 'broadcaster'],
 onCall: function(request) {
    if (request.isGuest)
        request.makeGuest(request.userID, 0);
    else
        request.makeGuest(request.userID, 103);
 }
};

module.exports = {mod: guest};
