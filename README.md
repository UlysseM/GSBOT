Grooveshark Broadcaster Bot
===========================

Create or takeover a broadcast with this bot, then enjoy what the bot can offer!

The Grooveshark Broadcast Bot (GS Bot) is designed to let you run a collaborative broadcast, or can handle your broadcast when you are AFK. It can be easily hosted on a dedicated server.

IMPORTANT
---------

Grooveshark just updated their service, the bot is moving from a webbrowser extension to a standalone nodejs app.

Due to the complete refactoring, **this is a BETA version, expect bugs, crashes, and other annoyances**. If you want to create your own plugins, please open a ticket so we can discuss the easier way to implement it.

Featuring
---------

✓ An interactive chat with "command line interface":

 -Typing /help will give you the list of all available commands

✓ An automatic takeover feature:

 -Can easily takeover your broadcast, without having to disconnect all your listeners. If you don't have a broadcast running, no worries, it will copy the settings of your last broadcast.

✓ A never ending broadcast:

 -If the queue runs out, the bot will just pick a random song from your collection.

✓ A plugin system:

 -In order to add new features to the bot, just add a folder in the plugin, run the EnablePlugin script and restart the bot!

✓ An advanced configuration system:

 -The configuration file allows you to overload any "config" parameters builtin to a module. This can go from the permission on who can start a command, to the way the command works. No worry though, the default settings (which will be sufficient for most) do not require ANY configuration!

Instructions
------------

-Configuration

  -Make sure you have nodejs installed (and 'node' in your path).

    -You can get it from here https://nodejs.org/download/

  -Before starting the bot, run the script "EnablePlugins", by going over the windows or posix file.

    -If you are on windows, it will ask you for admin rights, and this will only work if you are on an NTFS filesystem. A workaround would be to copy the plugins you want to start from the "plugin_available" to the "plugin_enabled" directory.

    -You will be prompted a list of plugin available, if you wish to install those, press 'y' and 'enter', if you do not, press 'n'.

    -If you want a "raw" experience, just install the "default" one.

    -The "plugin_test" is only here to show the functionalities of the bot to devs. It is NOT intended to run in production.

  -Start the program a first time

    -if you are not familiar with command line interfaces, just click on the "WindowsStart.bat" or "PosixStart.sh" depending on your operating system.

    -Launching the program a first time will add the file "config.js" in your directory, just fill the username and password!

-Start the bot and enjoy!

  -It will create a broadcast based on your last one, or take over the current one.

  -With the current version of grooveshark, you can still log in as a broadcaster to broadcast. The queue will be shared between your session and the bot.

Plugin support & Configuration
------------------------------

### Concept

The raw bot (without plugins) just handles the queue and makes sure it never goes out.

Plugins are here to do everything else (animation, chat, logging...).

A **plugin** is a folder located in the plugin_available directory. It is made of one or multiple **module*.

### Configuration

Each module should contain its own default configuration, located under the key "config".

Each configuration parameter can be individually overwritten by the config file.

For instance, the module '[peek](plugin_available/default/peek.js)' in the plugin 'default' has the following configuration:
```javascript
 config: {
    peekNumber: 10,
    peekLimit: 25,
    peekArtist: false,
    permission: ['guest']
 },
```

Meaning that if you are not ok with the default value, and want to change the peekLimit to 15, and allow the 'isFollowed' to run the peek command (in addition of the 'guest'), you have to write in your config file:
```javascript
module.exports = {
  username: 'XXXX',                 // Fill this with your grooveshark email / username
  password: 'XXXX',                 // Fill this with your grooveshark password
  plugins: {
    default: {                      // name of the plugin
      peek: {                       // name of the module
        peekLimit: 15,
        permission: ['isFollowed', 'guest']
      },
      trackCounter: {               // name of the module
        placeAfter: '{GS Bot}'
      }
    }
 }
};

```

Note that on this example, the value of [trackCounter](plugin_available/default/trackCounter.js)'s placeAfter was set to '{GS Bot}' (by default, it is at null).

Setting it to a value will allow it to be active (editing the broadcast description to tell you how many tracks are left in the queue). You can see it in action at http://grooveshark.com/#!/masterofsoundtrack/broadcast/current/overview

### Development

The Grooveshark API might be subject to change, as well as this code. There is a strict separation between the core of the program that talks to grooveshark and the plugins. The interface is defined by the file [core/request.js](core/request.js).

You mustn't use the "require" function to include something other than other file from your plugin. If you cannot do something, you may ask for an API update in the bug tracker.

In order to be called back when you want to do some work, your module can implement one (or many) of these functions:

-onCall: will be called when a user (with the right permissions) will run a "/YOURMODULENAME".

  -The object passed as a parameter will be a "request" object, filled with:

    -'userID' the id of the user that calls the function.

    -'isGuest' a boolean telling whether the user is a guest.

    -'isFollowing' a bollean telling whether the user is being followed by you.

    -'params' the rest of the string after "/YOURMODULENAME", or undefined if empty.

-onChatMessageRcv: Will be called whenever any user other than the broadcaster writes something in the chat.

  -The object passed as a parameter will be a request object, with the same parameters as 'onCall'.

-onSongChange: will be called when the a new song is being played.

  -The object passed as a parameter will be a "request" object, filled with:

    -'oldSong' an object containing all the info (name, id, artist, artistid, album, albumid, etc.) from the song that just ended.

    -'oldVote' an object containing all the votes from the song that just ended.

    -'newSong' an object containing all the info about the song from the song that just started.

-onQueueChange: will be called when the queue is getting updated.

  -The object passed as a parameter will be an empty "request" object.

  -Note that they may be false positive (callback called with no queue modification).
