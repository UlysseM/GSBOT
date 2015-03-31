var clearSuggestions = {
 author: 'uman',
 name: 'clearSuggestions',
 description: '- Remove all suggestions without blocking them.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    Object.keys(request.getSuggestions()).forEach(function(sid) {
        request.removeSuggestion(sid);
    });
 }
};

module.exports = {mod: clearSuggestions};
