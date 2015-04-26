var findInQueue = {
 author: 'uman',
 name: 'findInQueue',
 description: '[FILTER] - Check whether the song is in the queue (also matches the album\'s name).',
 config: {
    permission: ['guest'],
    maxDisplay: 10
 },
 getMatch: function(req) {
    var regex = RegExp(req.params, 'i');
    var list = [];

    req.getTracksInQueue().forEach(function(track){
        if (regex.test(track.alN) || regex.test(track.sN))
            list.push(track);
    });
    return list;
 },
 onCall: function(request) {
    var list = this.getMatch(request);
    var str = 'Song matched: ';
    if (list.length == 0 || list.length > findInQueue.config.maxDisplay)
    {
        str += list.length;
    }
    else
    {
        list.forEach(function(track){
            str += track.sN + ' {' + track.alN + '} ~ ';
        });
        str = str.substring(0, str.length - 3);
    }
    request.sendChat(str);
 }
};

module.exports = {mod: findInQueue};
