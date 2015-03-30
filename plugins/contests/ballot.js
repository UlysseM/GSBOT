var ballot = {
    author: 'pironic',
    name: 'ballot',
    description: '- Will output the number of ballots if called by a guest, but will enter you into the contest if you are not.',
    config: {
        permission: ['isListener']
    },
    shared: {},
    init: function(obj) {
        ballot.shared = obj.sharedObject;
    },
    onCall: function(request) {
        if (ballot.shared.status) {
            if (request.isGuest) {
                request.sendChat("There are currently "+ballot.shared.users.length+" entries int he current contest. Type /ballot to enter too!");
            }
            else {
                if (ballot.shared.users.indexOf(request.userID) == -1) ballot.shared.users.push(request.userID);
                console.log(ballot.shared.users);
            }
        }
        else {
            request.sendChat("There is no contest currently running.");
        }
    }
};

module.exports = {mod: ballot};
