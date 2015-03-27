var endContest = {
    author: 'pironic',
    name: 'endContest',
    description: '- Will draw a new random winner from the last contest that was conducted. Call this multiple times to draw more than one winner.',
    config: {
        permission: ['guest']
    },
    winnersName: null,
    onCall: function(request) {
        var contestCore = require('./contestCore.js');

        contestCore.status = false;
        request.sendChat("Drumroll please...")

        while(endContest.winnersName === null) {
            endContest.drawWinner(request); // make sure the user is still logged in.
        }
        setTimeout(function() {
            request.sendChat("...And the winner is"+endContest.winnersName+"! Congratulations!");
        }, 4000);
    },
    drawWinner: function(request) {
        var contestCore = require('./contestCore.js');

        contestCore.lastWinner = contestCore.users[Math.floor(Math.random()*contestCore.users.length)];
        endContest.winnersName = request.getListenerNameFromId(contestCore.lastWinner);
        console.log("contest: winner selected. userid: "+contestCore.lastWinner+ " name: "+endContest.winnersName);
    }
};

module.exports = {mod: endContest};
