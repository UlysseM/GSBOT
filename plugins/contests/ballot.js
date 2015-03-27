var ballot = {
    author: 'pironic',
    name: 'ballot',
    description: '- Will output the number of ballots if called by a guest, but will enter you into the contest if you are not.',
    config: {
        permission: ['isListener']
    },
    onCall: function(request) {
        var contestCore = require('./contestCore.js');

        if (contestCore.status) {
            if (request.isGuest) {
                request.sendChat("There are currently "+contestCore.users.length+" entries int he current contest. Type /ballot to enter too!");
            }
            else {
                if (contestCore.users.indexOf(request.userID) == -1) contestCore.users.push(request.userID);
                console.log(contestCore.users);
            }
        }
        else {
            request.sendChat("There is no contest currently running.");
        }
    }
};

module.exports = {mod: ballot};
