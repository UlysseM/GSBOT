var fetchLast = {
 author: 'uman',
 name: 'fetchLast',
 description: '[NUMBER]- Make the last [NUMBER] songs added to the queue the first song to play.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    var tracks = request.getTracksInQueue();
    var nbr = parseInt(request.params);
    if (!(nbr > 0))
        nbr = 1;
    if (nbr >= tracks.length)
        return;
    var arr = [];
    for (var i = tracks.length - nbr; i < tracks.length; ++i)
        arr.push(tracks[i].qid);
    if (tracks.length > 1)
    {
        request.moveTracks(arr, 0);
    }
 }
};

module.exports = {mod: fetchLast};
