var peek = {
 author: 'uman',
 name: 'peek',
 description: '[NUMBER] - Preview the songs that are in the queue.',
 config: {
    peekNumber: 10,
    peekLimit: 25,
    peekArtist: false,
    permission: ['guest']
 },
 onCall: function(request) {
    var tracks = request.getTracksInQueue();
    var str = '';

    var trackToPeek = parseInt(request.params);
    if (!(trackToPeek > 0))
        trackToPeek = peek.config.peekNumber;
    if (trackToPeek > peek.config.peekLimit)
        trackToPeek = peek.config.peekLimit;
    if (trackToPeek > tracks.length)
        trackToPeek = tracks.length;
    for (var i = 0; i < trackToPeek; ++i)
        str += tracks[i].sN + ' {' + (peek.config.peekArtist ? tracks[i].arN : tracks[i].alN) + '} ~ ';
    if (str.length)
        str = str.substring(0, str.length - 3);
    request.sendChat('Next songs are: ' + str);
 }
};

module.exports = {mod: peek};
