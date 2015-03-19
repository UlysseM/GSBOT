var trackCounter = {
 author: 'uman',
 name: 'trackCounter',
 description: 'Display the numbers of songs left in the queue.',
 config: {
    placeAfter: null,
 },
 onQueueChange: function(request) {
    if (typeof trackCounter.config.placeAfter != 'string')
        return;

    var tracksInQueue = request.getTracksInQueue();
    var addStr = ' ' + tracksInQueue.length + (tracksInQueue.length > 1 ? ' songs' : ' song') + ' left';
    if (tracksInQueue.length == 0 || tracksInQueue.length && tracksInQueue[tracksInQueue.length - 1].qid == request.getLastCollectionQueueTrackId())
        addStr = ' Playing from collection';
    var bName = request.getBroadcastName();
    bName = bName.substr(0, bName.indexOf(trackCounter.config.placeAfter)) + trackCounter.config.placeAfter;
    request.setBroadcastDesc(bName + addStr);
 },
};

module.exports = {mod: trackCounter};
