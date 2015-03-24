var echo = {
 author: 'uman',
 name: 'echo',
 description: 'Repeat all chat messages.',
 onChatMessageRcv: function(request) {
    request.sendChat('Echo: ' + request.params);
 }
};

module.exports = {mod: echo};
