chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
	{
		sendResponse({data: localStorage[request.key]});
	} 
	else if (request.method == "getSmallKeyboardCoords")
	{
		sendResponse({smallKeyboard: localStorage["smallKeyboard"], smallKeyboardTop: localStorage["smallKeyboardTop"], smallKeyboardBottom: localStorage["smallKeyboardBottom"], smallKeyboardRight: localStorage["smallKeyboardRight"], smallKeyboardLeft: localStorage["smallKeyboardLeft"]});
	}
	else if (request.method == "loadKeyboardSettings")
	{
		sendResponse({openedFirstTime: localStorage["openedFirstTime"], 
					capsLock: localStorage["capsLock"],
					smallKeyboard: localStorage["smallKeyboard"],
					touchEvents: localStorage["touchEvents"],
					keyboardLayout1: localStorage["keyboardLayout1"],
					urlButton: localStorage["urlButton"],
					keyboardEnabled: localStorage["keyboardEnabled"]});
	}
	else if (request.method == "initLoadKeyboardSettings")
	{
		sendResponse({hardwareAcceleration: localStorage["hardwareAcceleration"], 
					zoomLevel: localStorage["zoomLevel"],
					autoTrigger: localStorage["autoTrigger"],
					repeatLetters: localStorage["repeatLetters"],
					intelligentScroll: localStorage["intelligentScroll"],
					autoTriggerLinks: localStorage["autoTriggerLinks"],
					autoTriggerAfter: localStorage["autoTriggerAfter"]});
	}
	else if (request.method == "setLocalStorage")
	{
		localStorage[request.key] = request.value;
		sendResponse({data: "ok"});
	}	
	else if (request.method == "openFromIframe")
	{
		chrome.tabs.getSelected(null, function(tab) { 
			chrome.tabs.sendRequest(tab.id, request);
		});
	}
	else if (request.method == "clickFromIframe")
	{
		chrome.tabs.getSelected(null, function(tab) { 
			chrome.tabs.sendRequest(tab.id, request);
		});
	}
	else if (request.method == "toogleKeyboard")
	{
		if (localStorage["keyboardEnabled"] != "false") {
			localStorage["keyboardEnabled"] = "false";
		} else {
			localStorage["keyboardEnabled"] = "true";
		}
		chrome.tabs.getSelected(null, function(tab) { 
			vkeyboard_loadPageIcon(tab.id);
			if (localStorage["keyboardEnabled"] == "false") {
				chrome.tabs.sendRequest(tab.id, "closeKeyboard");
			} else {
				chrome.tabs.sendRequest(tab.id, "openKeyboard");
			}
		})
		sendResponse({data: "ok"});
	} 
	else if (request.method == "toogleKeyboardOn")
	{
		localStorage["keyboardEnabled"] = "true";
		chrome.tabs.getSelected(null, function(tab) { 
			vkeyboard_loadPageIcon(tab.id);
			chrome.tabs.sendRequest(tab.id, "openKeyboard");
		})
		sendResponse({data: "ok"});
	} 
	else if (request.method == "toogleKeyboardDemand")
	{
		localStorage["keyboardEnabled"] = "demand";
		chrome.tabs.getSelected(null, function(tab) { 
			vkeyboard_loadPageIcon(tab.id);
			chrome.tabs.sendRequest(tab.id, "openKeyboard");
		})
		sendResponse({data: "ok"});
	} 
	else if (request.method == "toogleKeyboardOff")
	{
		localStorage["keyboardEnabled"] = "false";
		chrome.tabs.getSelected(null, function(tab) { 
			vkeyboard_loadPageIcon(tab.id);
			chrome.tabs.sendRequest(tab.id, "closeKeyboard");
		})
		sendResponse({data: "ok"});
	} 
	else if (request.method == "openUrlBar")
	{
		chrome.tabs.getSelected(null, function(tab) { 
			chrome.tabs.sendRequest(tab.id, "openUrlBar");
			sendResponse({data: "ok" });
		});
	} else if (request.method == "createTab") {
		chrome.tabs.create({ url: request.url });
	}
    else {
      sendResponse({});
	}
});

function vkeyboard_loadPageIcon(tabId) {
	if (localStorage["keyboardEnabled"] == "demand") {
		chrome.pageAction.setIcon({ tabId: tabId, path: "buttons/keyboard_2.png" }, function() { })
	} else if (localStorage["keyboardEnabled"] != "false") {
		chrome.pageAction.setIcon({ tabId: tabId, path: "buttons/keyboard_1.png" }, function() { })
	} else {
		chrome.pageAction.setIcon({ tabId: tabId, path: "buttons/keyboard_3.png" }, function() { })
	}
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (localStorage["toogleKeyboard"] != "false") {
		chrome.pageAction.show(tabId);
		vkeyboard_loadPageIcon(tabId);
	} else {
		localStorage["keyboardEnabled"] = "true";
		chrome.pageAction.hide(tabId);
	}
});
