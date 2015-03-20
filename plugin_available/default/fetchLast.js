var fetchLast = {
 author: 'uman',
 name: 'fetchLast',
 description: '[[!]NUMBER]- Make the last [NUMBER] songs added to the queue the first song to play. If a "!" is specified before the number, it reverses their order.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    var tracks = request.getTracksInQueue();
    var invert = false;
    if (request.params && request.params[0] == '!')
    {
        request.params = request.params.slice(1);
        invert = true;
    }
    var nbr = parseInt(request.params);
    if (!(nbr > 0))
        nbr = 1;
    if (nbr >= tracks.length)
        return;
    var arr = [];
    for (var i = tracks.length - nbr; i < tracks.length; ++i)
        arr.push(tracks[i].qid);
    if (invert)
        arr.reverse();
    if (tracks.length > 1)
    {
        request.moveTracks(arr, 0);
    }
 }
};

module.exports = {mod: fetchLast};
