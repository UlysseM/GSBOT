var findInQueue = {
 author: 'uman',
 name: 'findInQueue',
 description: '[FILTER] - Check whether the song is in the queue (also matches the album\'s name).',
 config: {
    permission: ['guest'],
    maxDisplay: 10
 },
 onCall: function(request) {
    var regex = RegExp(request.params, 'i');
    var list = [];

    request.getTracksInQueue().forEach(function(track){
        if (regex.test(track.alN) || regex.test(track.sN))
            list.push(track);
    });

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
