# dbhistory plugin for GSBOT

This plugin provides you the ability to save song play stats, keep records, voting history and listener counts over extended periods of time.

This plugin will rely on the dbhistory module provided as part of the GSBOT-php-lib located at: https://github.com/WritheM/GSBOT-php-lib

WritheM Web Solutions is currently working on a way to provide a free/ad supported way to save your database without access to a web server or ability to host a php script. 

# Components

saveSong: when a song changes, the vote history, listener count and song data is sent to the database for saving.
stats: when a user issues /stats it will return the stats for the currently playing song from the last 30 days. An optional argument of a songID can be passed for those who know what the songID is of the song they would like to look up.

# Configuration

Make sure to include the following under the plugins: { section of your config.js

    dbhistory: {
        stats: {
            url: 'http://path/to/gsdb.php',
            key: 'your api key'
        },
        saveSong: {
            url: 'http://path/to/gsdb.php',
            key: 'your api key'
        }

    }
    
If you'd like to disable any portion of this script, then leave the url blank in that associated section. A blank url will disable that section.
    
# Commands

users can query wolfram by issuing a /wa <input> command. The plugin will query the script and return results as they are found. This means that sometimes some questions are answered faster than others.