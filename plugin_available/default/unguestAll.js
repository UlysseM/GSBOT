var unguestAll = {
 author: 'uman',
 name: 'unguestAll',
 description: '- Unguest all current guest.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    request.getCurrentGuests().forEach(function(guestid) {
        request.makeGuest(guestid, 0);
    });
 }
};

module.exports = {mod: unguestAll};
