var fetchLast = {
 author: 'uman',
 name: 'fetchLast',
 description: '- Make the last song added to the queue the first song to play.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    var tracks = request.getTracksInQueue();
    if (tracks.length > 1)
    {
        request.moveTrack(tracks[tracks.length - 1].qid, 1);
    }
 }
};

module.exports = {mod: fetchLast};
