var shuffle = {
 author: 'uman',
 name: 'shuffle',
 description: '- Shuffle the current queue.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    request.shuffle();
 }
};

module.exports = {mod: shuffle};
