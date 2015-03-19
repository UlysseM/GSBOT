var removeLast = {
 author: 'uman',
 name: 'removeLast',
 description: '[NUMBER]- Remove the last (NUMBER) song(s) from the queue.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    var tracks = request.getTracksInQueue();
    var nbr = 1;
    if (request.params != undefined)
    {
        nbr = parseInt(request.params);
        if (nbr < 1)
            nbr = 1;
    }
    var arr = [];
    nbr = tracks.length - nbr;
    if (nbr < 0)
        nbr = 0;
    for (; nbr < tracks.length; ++nbr)
        arr.push(tracks[nbr].qid);
    request.removeSongsFromQueue(arr);
 }
};

module.exports = {mod: removeLast};
