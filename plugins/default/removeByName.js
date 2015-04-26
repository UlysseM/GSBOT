var removeByName = {
 author: 'uman',
 name: 'removeByName',
 description: '[FILTER] - Removed all songs that matches the filter (also matches the album\'s name), you may test with /findInQueue.',
 config: {
    permission: ['guest'],
 },
 onCall: function(request) {
    var list = this.neighbors.findInQueue.getMatch(request);

    request.removeSongsFromQueue(list);
    var str = 'Song removed: ' + list.length;
    request.sendChat(str);
 }
};

module.exports = {mod: removeByName};
