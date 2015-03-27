var loggedInUser = {
 author: 'uman',
 name: 'loggedInUser',
 description: 'Output when the playing a new track.',
 onCall: function(request) {
    var listeners = 'Here is a list of the current logged in users : ';
    request.getListenersId().forEach(function(userid) {
        listeners += request.getListenerNameFromId(userid) + ' ';
    });
    listeners += ' (' + request.getAdvancedListenerCount().anonymous + ' anonymous)';
    request.sendChat(listeners);
 },
 onListenerJoin: function(request) {
    var name = request.anonymous ? 'anonymous' : request.username;
    request.sendChat('Welcome listener: ' + name);
 },
 onListenerLeave: function(request) {
    var name = request.anonymous ? 'anonymous' : request.username;
    request.sendChat('Goodbye listener: ' + name + ' (' + request.getListenerCount() + ' listeners left, with ' + request.getAdvancedListenerCount().anonymous + ' anonymous.)');
 }
};

module.exports = {mod: loggedInUser};
