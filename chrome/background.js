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
 
 var removeAllButId = function(notThisId)
{
	chrome.tabs.query({}, function(tabArray) {
		tabArray.forEach(function(entry) {
			if (entry.id != notThisId && RegExp("^http://grooveshark.com/").test(entry.url))
			{
				// clear the webpage so the alert won't mess up the exit
				chrome.tabs.executeScript(entry.id, {file: "rem_content.js"});
				setTimeout(function(){chrome.tabs.remove(entry.id);}, 2000);
			}
		});
	});
}

var tabState = {};

var injectCode = function(tabId)
{
	console.log(tabState[tabId]);
	var regexRes = tabState[tabId];
	delete tabState[tabId];

	// prepare the injection of localStorage inside GUParams & content_script.js
	var injection = 'document.body.appendChild(document.createElement(\'script\')).innerHTML='
	+ JSON.stringify(
		'var GUParams = JSON.parse(' + JSON.stringify(JSON.stringify(localStorage)) + ');'
		+ 'GUParams.userReq = ' + JSON.stringify(regexRes[1] != undefined ? '' : (regexRes[3] != undefined ? regexRes[3] : localStorage.forceLoginUsername)) + ';'
		+ 'GUParams.passReq = ' + JSON.stringify(regexRes[1] != undefined ? '' : (regexRes[5] != undefined ? regexRes[5] : localStorage.forceLoginPassword)) + ';'
		+ 'GUParams.version = ' + JSON.stringify(chrome.app.getDetails().version) + ';'
		) + ';'
	+ "document.body.appendChild(document.createElement('script')).src='"
	+ chrome.extension.getURL("content_script.js") +"';";
	// inject the new script after 4 seconds on the new page.
	chrome.tabs.executeScript(tabId, {code: injection}, null);
}

var callbackFunction = function(tabId, changeInfo, tab) {
	var newUrl = changeInfo.url;
	console.log('Loading...' + newUrl);
	var usernameRegex = '[a-zA-Z0-9_-]+';
	var regexRes = RegExp("http://broadcast(-nologin)?(/(" + usernameRegex + ")(/(.*)$)?)?").exec(newUrl);
	if (changeInfo.status == 'loading')
	{
		if (regexRes != null)
		{
			if (localStorage.closeAllTabsOnStartup == 'true')
				removeAllButId(tabId);
	
			var updateProperties = {'url': 'http://grooveshark.com/'};
			chrome.tabs.update(tabId, updateProperties);

			console.log(tabState[tabId]);
			tabState[tabId] = regexRes;
//			chrome.tabs.update(tabId, updateProperties, injectCode);
		}
		else if (tabState.hasOwnProperty(tabId) && newUrl.indexOf('grooveshark') != -1)
		{
			injectCode(tabId);
		}
	}
};

// Add callback
chrome.tabs.onUpdated.addListener(callbackFunction);

// Launch the options page on install or update
(function(){
	var appVersion = chrome.app.getDetails().version.split('.');
	var oldVersion = JSON.parse(localStorage.getItem('lastest_version'));
	if (oldVersion == null || oldVersion[0] != appVersion[0] || oldVersion[1] != appVersion[1])
	{
		// New major or minor version, let's clean old parameters and ask for new one.
		//localStorage.clear();
		localStorage.setItem('lastest_version', JSON.stringify(appVersion));
		chrome.tabs.create({url:chrome.extension.getURL("options.html")});
	}
	else if (appVersion[2] != oldVersion[2])
	{
		localStorage.setItem('lastest_version', JSON.stringify(appVersion));
		chrome.tabs.create({url:chrome.extension.getURL("options.html")});
	}
})()
