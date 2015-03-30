Grooveshark Broadcaster Bot
===========================

Create or takeover a broadcast with this bot, then enjoy what the bot can offer!

The Grooveshark Broadcast Bot (GS Bot) is designed to let you run a collaborative broadcast, or can handle your broadcast when you are AFK. It can be easily hosted on a dedicated server.

IMPORTANT
---------

Grooveshark just updated their service, the bot is moving from a webbrowser extension to a standalone nodejs app.

This product is in the 'Release Candidate' state. It has run multiple days without crashing and is now becoming quite stable.

If you want to create your own plugins, please open a ticket so we can discuss the easier way to implement it.

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

✓ Host Multiple Broadcast:

 -This bot will run as many broadcast as you want at the same time. You can share your configuration between all broadcast, and set particular rule to one broadcast in particular.

✓ An advanced configuration system:

 -The configuration file allows you to overload any "config" parameters builtin to a module. This can go from the permission on who can start a command, to the way the command works. No worry though, the default settings (which will be sufficient for most) do not require ANY configuration!

Instructions
------------

- Configuration
  - Make sure you have nodejs installed (and 'node' in your path).
    - You can get it from here https://nodejs.org/download/
- Start the bot
  - if you are not familiar with command line interfaces, just click on the "WindowsStart.bat" or "PosixStart.sh" depending on your operating system.
  - The configuration script will start if the config.json file is missing. It will ask you to enter your grooveshark username and password, and will by default, activate the plugin "default".
  - You can do everything you want while you're in this configuration menu, once you leave it, the config.json file will be saved for the next time and the broadcast will start.
    - It will create a broadcast based on your last one, or take over the current one.
    - With the current version of grooveshark, you can still log in as a broadcaster to broadcast. The queue will be shared between your session and the bot.

Plugin support & Configuration
------------------------------

### Concept

The raw bot (without plugins) just handles the queue and makes sure it never goes out.

Plugins are here to do everything else (animation, chat, logging...).

A **plugin** is a folder located in the plugin_available directory. It is made of one or multiple **module*.

### Configuration

The configuration file is a JSON that can be fully modified by the 'reconfigure' script. That script is called the first time the bot starts, or when the config.json file is missing.

The configuration is a tree build the following way:

```javascript
{
  broadcasts: {
    BROADCASTNAME {
      plugins_available: ["default"], // LIST OF PLUGINS ENABLED FOR THIS BROADCAST
      plugins_conf: {
        PLUGIN_NAME: {
          MODULE_NAME: {
            PARAMETER_NAME: "JSON_VALUE"
          }
        },
       whiteList: [ userid1, userid2 ]
      },
      password: BROADCASTPASSWORD,
    },
  },
  plugins_conf: {}, // Same as above, except it applies for ALL broadcasts (except when rule are overwritten locally)
  whiteList: [user3] // This whitelist will apply to ALL broadcasts
}
```

As you can see, this configuration can store multiple broadcast info, each of them can have custom parameters for their modules, and choose different plugin.

Regarding the "plugins_conf", each plugins stores it's own default configuration. This goes from permission check to variable used to run the plugin.

Setting it to a value will allow it to be active (editing the broadcast description to tell you how many tracks are left in the queue). You can see it in action at http://grooveshark.com/#!/masterofsoundtrack/broadcast/current/overview

### Development

The Grooveshark API might be subject to change, as well as this code. There is a strict separation between the core of the program that talks to grooveshark and the plugins. The interface is defined by the file [core/request.js](core/request.js).

You mustn't use the "require" function to include something other than other file from your plugin. If you cannot do something, you may ask for an API update in the bug tracker.

In order to be called back when you want to do some work, your module can implement one (or many) of these functions:

- onCall: will be called when a user (with the right permissions) will run a "/YOURMODULENAME".
  - The object passed as a parameter will be a "request" object, filled with:
    - 'userID' the id of the user that calls the function.
    - 'isGuest' a boolean telling whether the user is a guest.
    - 'isFollowing' a bollean telling whether the user is being followed by you.
    - 'params' the rest of the string after "/YOURMODULENAME", or undefined if empty.
- onChatMessageRcv: Will be called whenever any user other than the broadcaster writes something in the chat.
  - The object passed as a parameter will be a request object, with the same parameters as 'onCall'.
- onSongChange: will be called when the a new song is being played.
  - The object passed as a parameter will be a "request" object, filled with:
    - 'oldSong' an object containing all the info (name, id, artist, artistid, album, albumid, etc.) from the song that just ended.
    - 'oldVote' an object containing all the votes from the song that just ended.
    - 'newSong' an object containing all the info about the song from the song that just started.
- onQueueChange: will be called when the queue is getting updated.
  - The object passed as a parameter will be an empty "request" object.
  - Note that they may be false positive (callback called with no queue modification).
