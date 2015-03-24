// This module handles the listener currently connected to the broadcast.

function Listeners(manatee)
{
//    this.manatee = manatee;
    this.listeners = {};
    this.users = {};
    this.anonymous = 0;
}

// [INTERNAL] Add a listener with the id object from unsub
Listeners.prototype.add = function(idObj)
{
    if (idObj == undefined || idObj.userid == undefined) // just in case...
        return false;
    if (idObj.sudo) // This is the remora server from GS. Not a listener :)
        return false;
    if (this.listeners[idObj.uid])
        this.del(this.listeners[idObj.uid]);

    this.listeners[idObj.uid] = idObj;
    if (idObj.userid == false) // Anonymous following the BC
        this.anonymous += 1;
    else if (this.users[idObj.userid] == undefined)
        this.users[idObj.userid] = [idObj.uid]; // first login from user
    else
        this.users[idObj.userid].push(idObj.uid); // user is already logged in
    return true;
}

// [INTERNAL] Delete a listener with the id object from unsub
Listeners.prototype.del = function(idObj)
{
    if (idObj == undefined || idObj.userid == undefined || idObj.sudo)
        return false;
    var elem = this.listeners[idObj.uid];
    if (elem && elem.userid != idObj.userid)
        return false;
    if (idObj.userid != false)
    {
        var arr = this.users[idObj.userid];
        if (arr)
        {
            var idx = arr.indexOf(idObj.uid);
            if (idx != -1)
                arr.splice(idx, 1);
            if (arr.length == 0)
                delete this.users[idObj.userid]; // user DC
        }
    }
    else
        this.anonymous -= 1;
    delete this.listeners[idObj.uid];
    return true;
}

// [INTERNAL] Reset the listener queue
Listeners.prototype.reset = function(newList)
{
    this.listeners = {};
    this.users = {};
    this.anonymous = 0;
    var that = this;
    newList.forEach(function(user) {
        that.add(user.id);
    });
}

// Tells you how many people are listening to the broadcast.
Listeners.prototype.getListenerCount = function()
{
    return Object.keys(this.listeners).length;
}

// Tells you how many logged in people are listening to the broadcast.
Listeners.prototype.getUserCount = function()
{
    return this.getListenersId.length;
}

// Return the name of the user logged in.
Listeners.prototype.getNameFromId = function(id)
{
    var user = this.users[id];
    if (user && user.length)
    {
        return this.listeners[user[0]].app_data.n;
    }
    return null;
}

// Get the ID of all listeners logged in.
Listeners.prototype.getListenersId = function()
{
    return Object.keys(this.users);
}

Listeners.prototype.getAnonymousCount = function()
{
    return this.anonymous;
}

module.exports = {Listeners: Listeners};
