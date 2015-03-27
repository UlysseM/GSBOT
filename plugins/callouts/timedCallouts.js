var timedCallouts = {
    author: 'pironic',
    name: 'callouts',
    description: '- Callouts Administration. valid arguments are view|add|del or do not pass anything to view how many callouts there are.',
    config: {
        shoutOutInterval: 30,
        callouts: [
            "Welcome to our broadcast! We are running the \"Grooveshark Broadcast Bot\" " + GLOBAL.GSBOTVERSION + ", created by grooveshark.com/uman42, with the Callouts plugin created by grooveshark.com/pironic.",
            "Join your fellow listeners and broadcasters on the Grooveshark Community Forums now! http://sharkcommunity.com/"
        ],
        permission: ['guest']
    },
    timeoutID: null,
    storedRequest: null,
    onCall: function(request) {
        if (request.params === undefined) {
            // output the current callout count
            request.sendChat("There are currently "+timedCallouts.config.callouts.length+" entries in the list of valid callouts. To see each, please type /callouts view #");
        }
        else {
            var args = request.params.split(' ');
            if (args[0] == "view") {
                if (!isNaN(args[1])) {
                    // rettrieve a certain number
                    request.sendChat(timedCallouts.config.callouts[args[1]-1]);
                }
                else {
                    request.sendChat("Invalid callout number. The correct format for this command is /callouts view #");
                }
            }
            else if(args[0] == "add") {
                // add a callout
                args.splice(0,1);
                var newCallout = args.join(' ');
                //timedCallouts.config.timedCallouts.push(newCallout);
                request.sendChat("Added a callout: " + newCallout);
            }
            else if (args[0] == "del") {
                if (!isNaN(args[1])) {
                    // remove a callout
                    timedCallouts.config.callouts.splice(args[1]-1,1);
                    request.sendChat("Removed 1 callout.")
                }
                else {
                    request.sendChat("Invalid callout number. The correct format for this command is /callouts del #");
                }
            }
            else {
                request.sendChat("That command was not understood. The valid commands for /callouts are view|add|del")
            }
        }

    },
    init: function(mods, request) {
        timedCallouts.scheduleShoutout();
        timedCallouts.storedRequest = request;
    },
    scheduleShoutout: function()
    {
        if (timedCallouts.timeoutID !== null) {
            // We've got a timeout scheduled already, let's clear it.
            clearTimeout(timedCallouts.timeoutID);
        }

        var shoutOutInterval = timedCallouts.config.shoutOutInterval * 1000 * 60; // Conversion from minutes -> milliseconds

        // Schedule a single timeout
        timedCallouts.timeoutID = setTimeout(timedCallouts.doShoutout, shoutOutInterval);
    },
    doShoutout: function()
    {
        // The timeout has executed, we don't need the handle anymore.
        timedCallouts.timeoutID = null;

        var message = timedCallouts.config.callouts[Math.floor(Math.random()*timedCallouts.config.callouts.length)];
        if (message && message.trim().length) {
            console.log("scheduledShoutout: " + message);
            timedCallouts.storedRequest.sendChat(message);
        }

        // Reschedule ourselves
        timedCallouts.scheduleShoutout();
    }
};

module.exports = {mod: timedCallouts};
