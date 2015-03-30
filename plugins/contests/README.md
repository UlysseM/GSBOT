# contests plugin for GSBOT

This plugin set provides a few different commands to you and your listeners. First off is the ability to run contests, the second is the ability for listeners to roll some dice for entertainment purposes.

# Configuration

The only configuration change available with this set is the permissions and the number of dice to roll by default. NOTE: This is not between 1-100, this is 1 dice with 100 sides.

    "contests": {
        "roll": {
            "defaultDice": [1,100]
        }
    }

You can also change the permissions requires to call any of the command by overriding the default permission, as you would any other plugin:

    "contests": {
        "roll": {
            "permission": ["guest", "isFollowed"]
        },
        "startContest": {
            "permission": ["guest"]
        },
        "endContest": {
            "permission": ["guest"]
        }
    }

You may notice in this example we do not suggest that you edit the permissioins of /ballot. This is because we do different actions based on permissions as definned below. Check the commands section for more info.

# Commands

- /startContest: You can use this command to start a contest.

- /endContest: Will draw a single person from the list of entries and declare a winner. If you would like to draw more than one winner, just type /endContest again.

- /ballot: If a guest calls this command, it will output the number of ballots currently captures. If a listener types it, it will enter them into the contest. Ballot will only output anything if a guest calls it.

- /roll <#d#>: Will roll a series of dice in order to output their total value. By default this will output 1 dice with 100 sides, but you can customize this in the configuration. It is important to note that the number of dice and the number of sides each dice has has been limited to no larger than 1000 and no less than 1. This avoids unneeded computer cycles calculating things of little to no importance.
