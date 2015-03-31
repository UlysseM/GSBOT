# callouts plugin for GSBOT

This plugin provides you the ability to set a single or multiple scheduled messages that will be said on an interval you specify into your GS Broadcast.

# Configuration

Make sure to include the following under the plugins_conf: { section of your config.json or use the automated config script provided with the GSBOT core.

    "callouts": {
        "timedCallouts": {
            "shoutOutInterval": 30,
            "callouts": [
              "This is the first message that will be announced in the broadcast chat",
              "The bot will output a random message every time the shoutOutInterval is reached"
            ]
        }
    }

You can also change the permissions requires to call the /callouts command by overriding the default permission, as you would any other plugin:

    "callouts": {
        "timedCallouts": {
            "permission": ["guest", "isFollowed"]
        }
    }

# Commands

- /callouts: You can use this command to see how many callouts exist in rotation.

- /callouts view #: when you provide a number with the view argument, it will output the callout immediately. This will not reset the timer, so its just a manual way of viewing the callouts.

- /callout del #: this will allow the admins to remove a callout from rotation. There is no way to edit a callout, so you must remove existing ones and add new ones in order to edit them.
- /callout add <text>: everything provided after the add argument will be constructed and added to the callout rotation.
