var removeNext = {
 author: 'uman',
 name: 'removeNext',
 description: '- Remove the next song in the queue.',
 permission: ['guest'],
 onCall: function(request) {
    var tracks = request.getTracksInQueue();
    if (tracks.length)
        request.removeSongFromQueue([tracks[0].qid]);
 }
};

module.exports = {mod: removeNext};
