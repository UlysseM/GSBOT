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

var store = function(param, value) {
	localStorage.setItem(param, value);
};

var retreive = function(param) {
	return localStorage.getItem(param);
};

// Saves options to localStorage.
var defValue = [
	['separator', 'This string will be insered between each songs, when doing /songPreview.', ' --- '],
	['prefixRename', 'Will try to find this string in the description of the broadcast, and write " {GS Bot} X songs left." after it. If there is no match, it will remove the entire description, so be careful!', 'Broadcaster:'],
	['welcomeMessage', 'Place this in chat after the activation.', 'Server mode enabled. Let\'s take over the world!'],
	['defaultSongPreview', 'The number of songs that will be displayed on /songPreview.', 10],
	['maxSongPreview', 'Since a user can do "/songPreview X" to preview X songs, we need a limit, it is defined here.', 25],
	['closeAllTabsOnStartup', 'If this is checked, all grooveshark tabs will be close upon activation of the bot', true],
	['forceLoginUsername', 'If this field is filled, the bot will try to login with this username. This is overriden by starting the bot with http://broadcast/MY_USERNAME/MY_PASSWORD . If this is blank, grooveshark will use the bot will use the current sessnion.', ''],
	['forceLoginPassword', 'Same as forceLoginUsername, only this is the password.', ''],
	['whitelist', 'The ID of the grooveshark users that can /guest. Separate each ID with a comma.', []],
	['whitelistIncludesFollowing', 'If checked, all the people you follow will have the ability to /guest.', true],
	['blacklist', 'The ID of the grooveshark user in this list will not be able to /guest, even if they are being followed by you, and if you checked whitelistIncludesFollowing. Separate each ID with a comma.', []],
	['whiteListName', 'The rank of person in the whitelist, used when non whitelist people try to guest "Only [this name] can use that feature, sorry!"', 'broadcaster'],
	['historyLength', 'The number of tracks that will be saved in a local "history". When playing from collection, the bot will TRY (no promises) to get a song that was not in this history.', '50']
];

var content = document.getElementById('content');

function save_options() {
  defValue.forEach(function(element) {
	if (typeof(element[2]) == 'boolean')
		store(element[0], document.getElementById(element[0]).checked);
	else
		store(element[0], document.getElementById(element[0]).value);
  });
  
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  content.innerHTML = '';
  defValue.forEach(function(element) {
	if (retreive(element[0]) == undefined)
		store(element[0], element[2]);

	var tmp = '<tr><td>' + element[0] + '</td><td>';
	switch (typeof(element[2]))
	{
		case 'boolean':
			tmp += '<input disabled type="checkbox" ' + (element[2] ? 'checked' : '')  + ' /></td><td>';
			tmp += '<input type="checkbox" id="' + element[0] + '" ' + (retreive(element[0]) == 'true' ? 'checked' : '')  + ' />';
			break;
		case 'object':
			tmp += '<textarea disabled cols="37"></textarea></td><td>';
			tmp += '<textarea id="' + element[0] + '"  cols="37">' + retreive(element[0]) + '</textarea>';
			break;
		default:
			tmp += '<input disabled size="50" type="name" value="'+ element[2] +'" /></td><td>';
			tmp += '<input size="50" type="name" id="' + element[0] + '" value="'+ retreive(element[0]) +'" />';
			break;
	}
	tmp += '</td><td>' + element[1] + '</td></tr>';
	content.innerHTML += tmp;
	});
}

function reset_all() {
	if (confirm('Are you sure you want to reset your setting?'))
	{
		var version = retreive('lastest_version');
		localStorage.clear();
		store('lastest_version', version);
		restore_options();
	}
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#factoryreset').addEventListener('click', reset_all);
document.getElementById('version').innerHTML = chrome.app.getDetails().version;
