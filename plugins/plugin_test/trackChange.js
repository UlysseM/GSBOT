var trackChange = {
 author: 'uman',
 name: 'trackChange',
 description: 'Output when the playing a new track.',
 onSongChange: function(request) {
    request.sendChat('New track playing! (' + request.newSong.sN + '), previous was (' + request.oldSong.sN + '), with an upvote score of ' + (Object.keys(request.oldVote.up).length - Object.keys(request.oldVote.down).length));
 }
};

module.exports = {mod: trackChange};
