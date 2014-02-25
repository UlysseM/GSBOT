/*
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2014 Ulysse Manceron
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */
 
var songleft;
var allSongsId = [];
var lastPlayedSongs = [];
var actionTable = {};
var lastPlay;
var forcePlay = false;
var playingRandom = false;

// GroovesharkUtils
var GU = {
 'inBroadcast': function()
    {
        return $('#bc-take-over-btn').hasClass('hide');
    },
 'sendMsg': function(msg)
    {
        var broadcast = GS.getCurrentBroadcast();
        if (broadcast === false)
            return;

        var maxMsgLength = 256; // the max number of caracters that can go in the gs chat
        var index = 0;

        msg = '[BOT]: ' + msg;
        while ((Math.floor(msg.length / maxMsgLength) + (msg.length % maxMsgLength != 0)) >= ++index)
        {
            broadcast.sendChatMessage(msg.substr((index - 1) * maxMsgLength, maxMsgLength));
        }
    },
 'songInQueue': function()
    {
        return $('#queue-num-total').text() - $('#queue-num').text();
    },
 'removeMsg': function()
    {
        $('.chat-message').addClass('parsed');
    },
 'openSidePanel': function()
    {
         if ($('.icon-sidebar-open-m-gray')[0])
            $('.icon-sidebar-open-m-gray').click()
    },
 'renameBroadcast': function(bdcName)
    {
        var attributes = GS.getCurrentBroadcast().attributes;
        if (attributes == undefined)
            return;
        var maxDescriptionLength = 145;
    
        var defName = attributes.Description;
        defName = defName.substr(0, defName.indexOf(GUParams.prefixRename)) + GUParams.prefixRename + ' {GS Bot} ';
        if (playingRandom)
        {
            defName += 'Playing from collection';
        }
        else
        {
            defName += GU.songInQueue() + ' song' + (GU.songInQueue() != 1 ? 's' : '') +' left';
        }
        if (bdcName == null)
            bdcName = defName;
        GS.Services.SWF.changeBroadcastInfo(GS.getCurrentBroadcastID(), {'Description': bdcName.substr(0, maxDescriptionLength)});
    },
 'getPlaylistNextSongs': function()
    {
        var songs = GS.Services.SWF.getCurrentQueue().songs;
        var index = GS.Services.SWF.getCurrentQueue().activeSong.queueSongID;
        while (songs[0] != null && songs[0].queueSongID <= index)
        {
            songs.shift();
        }
        return songs;
    },
 'previewSongs': function(msg, parameter)
    {
        var nbr = parseInt(parameter);
        if (nbr <= 0 || isNaN(nbr))
            nbr = GUParams.defaultSongPreview;
        if (nbr > GUParams.maxSongPreview)
            nbr = GUParams.maxSongPreview;
        songs = GU.getPlaylistNextSongs();
        
        var i = -1;
        var string = '';
        while (++i <= nbr)
        {
            var curr = songs[i];
            if (curr == null)
                break;
            string = string + '#' +i + ': ' + curr.SongName + ' ~ From: ' + curr.AlbumName + GUParams.separator;
        }
        GU.sendMsg('Next songs are: ' + string.substring(0, string.length - GUParams.separator.length));
    },
 'showPlaylist': function(message, stringFilter)
    {
        GU.openSidePanel();
        var string = '';
        var regex = RegExp(stringFilter, 'i');
        $('#sidebar-playlists-grid').find('.sidebar-playlist').each(function() {
            var playlistName = $(this).find('.name').text();
            if (regex.test(playlistName))
                string = string + '#' + $(this).index() + ': ' + playlistName + GUParams.separator;
        });
        if (string == '')
            string = 'No match found for ' + stringFilter;
        else
            string = 'Playlist matched:' + string.substring(0, string.length - GUParams.separator.length);
        GU.sendMsg(string);
    },
 'playPlaylist': function(message, playlistId)
    {
        GU.openSidePanel();
        var playlistToPlay = $('#sidebar-playlists-grid').find('.sidebar-playlist')[playlistId];
        if (playlistToPlay == null)
        {
            GU.sendMsg('Cannot find playlist: ' + playlistId);
        }
        else
        {
            var playlistId = $(playlistToPlay).children(0).attr('data-playlist-id');
            Grooveshark.addPlaylistByID(playlistId);
            GU.sendMsg('Playlist \'' + $(playlistToPlay).find('.name').text() + '\' added to the queue.');
        }
    },
 'playRandomSong': function()
    {
        playingRandom = true;
        var nextSong = allSongsId[Math.floor(Math.random() * allSongsId.length)];
        if (nextSong != undefined)
        {
            var nextSongIndex = lastPlayedSongs.indexOf(nextSong);
            var maxTry = 5;
            while (nextSongIndex != -1 && maxTry-- > 0)
            {
                var tmpSong = allSongsId[Math.floor(Math.random() * allSongsId.length)];
                if (tmpSong != undefined)
                {
                    var tmpIndex = lastPlayedSongs.indexOf(tmpSong);
                    if (tmpIndex < nextSongIndex)
                        nextSong = tmpSong;
                }
            }
            Grooveshark.addSongsByID([nextSong]);
        }
    },
 'skip': function()
    {
        Grooveshark.removeCurrentSongFromQueue();
    },
 'deletePlayedSong': function()
    {
        var previousSong;
        while (true)
        {
            previousSong = GS.Services.SWF.getCurrentQueue().previousSong;
            if (previousSong != null)
                GS.Services.SWF.removeSongs([previousSong.queueSongID]);
            else
                break;
        }
    },
 'removeNextSong': function()
    {
        var nextSong = GS.Services.SWF.getCurrentQueue().nextSong;
        if (nextSong != null)
        {
            GS.Services.SWF.removeSongs([nextSong.queueSongID]);
        }
    },
 'removeLastSong': function()
    {
        var songs = GS.Services.SWF.getCurrentQueue().songs;
        var id = songs[songs.length - 1].queueSongID;
        if (id != GS.Services.SWF.getCurrentQueue().activeSong.queueSongID)
        {
            GS.Services.SWF.removeSongs([id]);
        }
    },
 'getRemoveSongsList': function(stringFilter)
    {
        var regex = RegExp(stringFilter, 'i');
        var songs = GU.getPlaylistNextSongs();
        var listToRemove = [];
        songs.forEach(function(element){
            if (regex.test(element.AlbumName) ||
                // regex.test(element.ArtistName) ||
                regex.test(element.SongName))
                listToRemove.push(element);
        });
        return listToRemove;
    },
 'previewRemoveByName': function(message, stringFilter)
    {
        var listToRemove = GU.getRemoveSongsList(stringFilter);
        if (listToRemove.length > 10 || listToRemove.length == 0)
            GU.sendMsg('' + listToRemove.length + 'Songs matched.');
        else
        {
            var string = 'Song matched: ';
            listToRemove.forEach(function(element) {
                string = string + element.SongName + ' ~ From: ' + element.AlbumName + GUParams.separator;
            });
            GU.sendMsg(string.substring(0, string.length - GUParams.separator.length));            
        }
    },
 'removeByName': function(message, stringFilter)
    {
        var listToRemove = GU.getRemoveSongsList(stringFilter);
        var idToRemove = [];
        listToRemove.forEach(function (element){
            idToRemove.push(element.queueSongID);
        });
        GS.Services.SWF.removeSongs(idToRemove);
        GU.sendMsg('Removed ' + idToRemove.length + ' songs.');
    },
 'shuffle': function()
    {
        $('.shuffle').click();
        GU.sendMsg('The queue has been shuffled!');
    },
 'guestCheck': function(current)
    {
        if (!current.hasClass('chat-vip'))
        {
            GU.sendMsg('Only Guests can use that feature, sorry!');
            return false;
        }
        return true;    
    },
 'inListCheck': function(current, list)
    {
        console.log(current.find('a.favorite').attr('data-user-id'));
        return list.split(',').indexOf(current.find('a.favorite').attr('data-user-id')) != -1;
    },
 'followerCheck': function(current)
    {
        return (current.find('a.favorite').hasClass('btn-success'));
    },
 'whiteListCheck': function(current)
    {
        if (GU.inListCheck(current, GUParams.whitelist)) // user in whitelist
        {
            return true;
        }
        else if (GUParams.whitelistIncludesFollowing && !GU.inListCheck(current, GUParams.blacklist) && GU.followerCheck(current))
        {
            return true;
        }
        GU.sendMsg('Only ' + GUParams.whiteListName + ' can use that feature, sorry!');        
        return false;
    },
 'ownerCheck': function(current)
    {
        if (!current.hasClass('chat-owner'))
        {
            GU.sendMsg('Only the Master can use that feature, sorry!');
            return false;
        }
        return true;    
    },
 'doParseMessage': function(current)
    {
        var string = current.find('.message').text();
        var regexp = RegExp('^/([a-zA-Z]*)([ ]+([a-zA-Z0-9 ]+))?$');
        var regResult = regexp.exec(string);
        if (regResult != null)
        {
            var currentAction = actionTable[regResult[1]];
            if (currentAction instanceof Array && currentAction[0].every(function(element){return element(current);}))
                currentAction[1](current, regResult[3]);
        }
    },
 'parseMessages': function()
    {
        $('.chat-message:not(.parsed)').each(function() {
            $(this).addClass('parsed');
            GU.doParseMessage($(this));
        });
    },
 'forcePlay': function()
    {
        if (Grooveshark.getCurrentSongStatus().status != 'playing')
        {
            if (new Date() - lastPlay > 4000 && !forcePlay)
            {
                forcePlay = true;
                Grooveshark.play();
            }
            if (new Date() - lastPlay > 8000)
            {
                Grooveshark.removeCurrentSongFromQueue();
                forcePlay = false;
                lastPlay = new Date();
            }
        }
        else
        {
            forcePlay = false;
            lastPlay = new Date();
        }
    },
 'addSongToHistory': function()
    {
        if (Grooveshark.getCurrentSongStatus().song == null)
            return;
        var currSongID = Grooveshark.getCurrentSongStatus().song.songID;
        if (lastPlayedSongs.length == 0 || lastPlayedSongs[lastPlayedSongs.length - 1] != currSongID)
        {
            var posToRemove = lastPlayedSongs.indexOf(currSongID);
            // Remove the song in the list
            if (posToRemove != -1)
                lastPlayedSongs.splice(posToRemove, 1);
            lastPlayedSongs.push(currSongID);
            // Remove the oldest song in the list if it goes over the limit.
            if (GUParams.historyLength < lastPlayedSongs.length)
                lastPlayedSongs.shift();
        }
    },
 'callback': function()
    {
        if (songleft != GU.songInQueue())
        {
            songleft = GU.songInQueue();
            if (songleft >= 2)
                playingRandom = false;
            GU.renameBroadcast();
        }
        GU.addSongToHistory();
        if (songleft < 1)
            GU.playRandomSong();
        GU.parseMessages();
        GU.deletePlayedSong();
        GU.forcePlay();
        /*
            Idea for later:
            To remove this callback, we can extends both GS.Services.SWF.handleBroadcastChat and GS.Services.SWF.queueChange.
        */
    },
 'guest': function(current)
    {
        var userID = current.find('a.favorite').attr('data-user-id');
        
        if (GS.getCurrentBroadcast().getPermissionsForUserID(userID) != undefined) // is guest
            GS.Services.SWF.broadcastRemoveVIPUser(userID);
        else
            GS.Services.SWF.broadcastAddVIPUser(userID,0,63); // 63 seems to be the permission mask
    },
 'ping': function()
    {
        GU.sendMsg('Ping resp!');
    },
 'about': function()
    {
        GU.sendMsg('This broadcast is currently running "Grooveshark Broadcast Bot" v' + GUParams.version + ', created by grooveshark.com/uman42 . Extensions: goo.gl/v4YW7b (google), goo.gl/aAX4dr (firefox), goo.gl/gR3YfW (source code)');
    },
 'help': function(message, parameter)
    {
        if (parameter != undefined)
        {
            var currentAction = actionTable[parameter];
            if (currentAction instanceof Array)
            {
                GU.sendMsg('Help: /' + parameter + ' ' + currentAction[2]);
                return;
            }
        }
        var helpMsg = 'Command available:';
        Object.keys(actionTable).forEach(function (actionName) {
            helpMsg = helpMsg + ' ' + actionName;
        });
        helpMsg = helpMsg + '. Type /help [command name] for in depth help.';
        GU.sendMsg(helpMsg);
    },
 'startBroadcasting': function(bc)
    {
        var properties = { 'Description': bc.Description, 'Name': bc.Name, 'Tag': bc.Tag };
        if (!GS.isBroadcaster()) {
            GS.Services.SWF.startBroadcast(properties);
            setTimeout(GU.startBroadcasting, 3000, bc);
            return;
        }
        GU.renameBroadcast();
        setTimeout(function() {
            GU.sendMsg(GUParams.welcomeMessage);
        }, 1000);
        // Remove all the messages in chat
        GU.removeMsg();
        GU.openSidePanel();
        GS.Services.API.userGetSongIDsInLibrary().then(function (result){
            allSongsId = result.SongIDs;
        });
        lastPlay = new Date();
        // Check if there are msg in the chat, and process them.
        setInterval(GU.callback, 1000);
    },
 'broadcast': function()
    {
        if (GS.getLoggedInUserID() <= 0)
            alert('Cannot login!');
        else
        {
            GS.Services.API.getUserLastBroadcast().then(function(bc) {
                if ($('#lightbox-close').length == 1)
                {
                    $('#lightbox-close').click();
                }
                GS.Services.SWF.resumeBroadcast(bc.BroadcastID);
                setTimeout(GU.startBroadcasting, 3000, bc);
            });
        }
    }
};

actionTable = {
    'help':                [[GU.inBroadcast],                    GU.help,                '- Display this help.'],
    'ping':                [[GU.inBroadcast],                    GU.ping,                '- Ping the BOT.'],
    'removeNext':          [[GU.inBroadcast, GU.guestCheck],     GU.removeNextSong,      '- Remove the next song in the queue.'],
    'removeLast':          [[GU.inBroadcast, GU.guestCheck],     GU.removeLastSong,      '- Remove the last song of the queue.'],
    'previewRemoveByName': [[GU.inBroadcast, GU.guestCheck],     GU.previewRemoveByName, '[FILTER] - Get the list of songs that will be remove when calling \'removeByName\' with the same FILTER.'],
    'removeByName':        [[GU.inBroadcast, GU.guestCheck],     GU.removeByName,        '[FILTER] - Remove all songs that matches the filter. If the filter if empty, remove everything. Use the \'previewRemoveByName\' first.'],
    'showPlaylist':        [[GU.inBroadcast, GU.guestCheck],     GU.showPlaylist,        '[FILTER] - Get the ID of a particular playlist.'],
    'playPlaylist':        [[GU.inBroadcast, GU.guestCheck],     GU.playPlaylist,        'PLAYLISTID - Play the playlist from the ID given by \'showPlaylist\'.'],
    'skip':                [[GU.inBroadcast, GU.guestCheck],     GU.skip,                '- Skip the current song.'],
    'shuffle':             [[GU.inBroadcast, GU.guestCheck],     GU.shuffle,             '- Shuffle the current queue.'],
    'peek':                [[GU.inBroadcast, GU.whiteListCheck], GU.previewSongs,        '[NUMBER] - Preview the songs that are in the queue.'],
    'guest':               [[GU.inBroadcast, GU.whiteListCheck], GU.guest,               '- Toogle your guest status.'],
    'about':               [[GU.inBroadcast],                    GU.about,               '- About this software.']
};

if (GUParams.userReq != '' && GUParams.passReq != '')
{
    GS.Services.API.logoutUser().then(function(){
        GS.Services.API.authenticateUser(GUParams.userReq, GUParams.passReq).then(function(user) { document.body.innerHTML = ''; setTimeout(function(){window.location = "http://broadcast-nologin/";}, 200); } );
    });
}
else
    GU.broadcast();
