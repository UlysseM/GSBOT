var contestCore = {
    author: 'pironic',
    name: 'contestCore',
    description: '- Retains the variables and data needed to run the contests',
    users: [],
    status: false,
    lastWinner: null,
    init: function(mods, request) {
        contestCore.storedRequest = request;
    }
};

module.exports = {mod: contestCore};
