var removeNext = {
 author: 'uman',
 name: 'removeNext',
 description: '[NUMBER]- Remove the next (NUMBER) song(s) from the queue.',
 permission: ['guest'],
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
    for (var i = 0; i < nbr && i < tracks.length; ++i)
        arr.push(tracks[i].qid);
    request.removeSongsFromQueue(arr);
 }
};

module.exports = {mod: removeNext};
