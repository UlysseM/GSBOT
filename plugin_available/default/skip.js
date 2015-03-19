var skip = {
 author: 'uman',
 name: 'skip',
 description: '- Skip the current song.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    request.skip();
 }
};

module.exports = {mod: skip};
