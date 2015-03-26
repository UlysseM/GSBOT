var makeGuest = {
 author: 'uman',
 name: 'makeGuest',
 description: 'ID - Make a regular user a temporary guest.',
 config: {
    permission: ['isWhiteListed']
 },
 onCall: function(request) {
    var id = parseInt(request.params);
    if (id > 0)
        request.makeGuest(id, 103);
 }
};

module.exports = {mod: makeGuest};
