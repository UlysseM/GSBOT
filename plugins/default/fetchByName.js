var fetchByName = {
 author: 'uman',
 name: 'fetchByName',
 description: '[FILTER]- The first song that matches the filter will be next in the queue.',
 config: {
    permission: ['guest']
 },
 onCall: function(request) {
    var list = this.neighbors.findInQueue.getMatch(request);

    if (list.length == 0)
        return;
    var arr = [list[0].qid];
    request.moveTracks(arr, 0);
 }
};

module.exports = {mod: fetchByName};
