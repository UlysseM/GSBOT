var queueChange = {
 author: 'uman',
 name: 'queueChange',
 description: 'Output when the queue is changing (might have false positive).',
 onQueueChange: function(request) {
    var tracksid = [];
    request.getTracksInQueue().forEach(function(track) {
        tracksid.push(track.id);
    });
    request.sendChat('The queue might have change. There it is: ' + tracksid);
 }
};

module.exports = {mod: queueChange};
