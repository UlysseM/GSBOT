/*
# dbhistory plugin for GSBOT

This plugin provides you the ability to save song play stats, keep records, voting history and listener counts over extended periods of time.

You have two options for the backend of this plugin. You can choose to use the sharkcommunity.com shared stats database hosted by WritheM Web Solutions, or you can host it yourself on your own mysql database/php web server.

To host your data on the sharkcommunity.com shared stats database, you will need an api key. This key can be obtained by emailing michael [at] writhem [dot] com and providing the user id of your broadcast account, as well as your sharkcommunity.com forum username. You will be asked to create a playlist on grooveshark with a name we determine to verify that you are the owner of that userid, and then a key will be emailed to you. You may have as many accounts associated to a single forum account as necessary, but 1 key will be used for each grooveshark user. An automated system is currently being built, but until it is finished, this will be the only method to obtaining an api key.

To host this on your own server, you will need the dbhistory module provided as part of the GSBOT-php-lib located at: https://github.com/WritheM/GSBOT-php-lib . Once you have your server configured and the .sql files inserted into your database, you can point the lower url to the dbhistory/index.php file on your webserver. Don't forget to generate yourself a key in the users table as well.


# Components

saveSong: when a song changes, the vote history, listener count and song data is sent to the database for saving.
stats: when a user issues /stats it will return the stats for the currently playing song from the last 30 days. An optional argument of a songID can be passed for those who know what the songID is of the song they would like to look up.

# Configuration

Make sure to include the following under the plugins: { section of your config.js

    dbhistory: {
        stats: {
            url: 'http://stats.sharkcommunity.com/api/',
            key: 'your api key'
        },
        saveSong: {
            url: 'http://stats.sharkcommunity.com/api/',
            key: 'your api key'
        }

    }
    
If you'd like to disable any portion of this script, then leave the url blank in that associated section. A blank url will disable that section. For example, if you wanted to enable stats saving, but disable lookup, you can do that by keeping the url blank in stats, but setting it in saveSong.
You can also change the permissions requires to call the /stats command by overriding the default permission, as you would any other plugin:

    saveSong: {
        url: 'http://stats.sharkcommunity.com/api/',
        key: 'your api key',
        permission: ['guest', 'isFollowed']
    }
    
# Commands

users can lookup the stats for the currently playing song by issuing a /stats command. An optional argument can also be passed of a SongID to override the currently playing song, and look up any song in the database. The results will only be returned for data from the last 30 days.

*/