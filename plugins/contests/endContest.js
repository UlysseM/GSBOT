var endContest = {
    author: 'pironic',
    name: 'endContest',
    description: '- Will draw a new random winner from the last contest that was conducted. Call this multiple times to draw more than one winner.',
    config: {
        permission: ['guest']
    },
    winnersName: null,
    shared: {},
    init: function(obj) {
        endContest.shared = obj.sharedObject;
    },
    onCall: function(request) {
        endContest.shared.status = false;
        request.sendChat("Drumroll please...")
        endContest.shared.attempts = 0;

        while(endContest.winnersName === null) {
            if (endContest.shared.attempts >= endContest.shared.users.length) {
                request.sendChat("...We couldn't find anyone who is still online that entered the contest. Sorry about that :(");
                return;
            }
            endContest.drawWinner(request); // make sure the user is still logged in.
        }
        setTimeout(function() {
            request.sendChat("...And the winner is"+endContest.winnersName+"! Congratulations!");
        }, 4000);
    },
    drawWinner: function(request) {
        endContest.shared.attempts++;
        endContest.shared.lastWinner = endContest.shared.users[Math.floor(Math.random()*endContest.shared.users.length)];
        endContest.winnersName = request.getListenerNameFromId(endContest.shared.lastWinner);
        console.log("contest: winner selected. userid: "+endContest.shared.lastWinner+ " name: "+endContest.winnersName);
    }
};

module.exports = {mod: endContest};
