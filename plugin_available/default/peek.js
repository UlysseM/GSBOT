var peek = {
 author: 'uman',
 name: 'peek',
 description: ' - Preview the songs that are in the queue.',
 permission: ['guest'],
 onCall: function(request) {
    var tracks = request.getTracksInQueue();
    var str = '';
    tracks.forEach(function(track) {
        str += track.sN + '{' + track.alN + '} ~ ';
    });
    if (str.length)
        str = str.substring(0, str.length - 3);
    request.sendChat('Next songs are: ' + str);
 }
};

module.exports = {mod: peek};
