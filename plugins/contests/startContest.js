var startContest = {
    author: 'pironic',
    name: 'startContest',
    description: '- start a new contest. This will clear the last contests stats and begin accepting /ballot commands.',
    config: {
        permission: ['guest']
    },
    onCall: function(request) {
        contestCore.status = true;
        contestCore.users = [];
        contestCore.lastWinner = null;
        request.sendChat("A Broadcast Contest has been started! Please type /ballot to join the contest!")
    }
};

module.exports = {mod: startContest};
