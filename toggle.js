window.addEventListener('load', function() {
	document.getElementById("toggleOn").onclick = function() {
		chrome.runtime.sendMessage({method: "toogleKeyboardOn"}, function(response) {
			window.close();	
		});
	}
	document.getElementById("settings").onclick = function() {
		chrome.runtime.openOptionsPage();
		window.close();
	}
	document.getElementById("toggleOff").onclick = function() {
		chrome.runtime.sendMessage({method: "toogleKeyboardOff"}, function(response) {
			window.close();	
		});
	}
	document.getElementById("toggleDemand").onclick = function() {
		chrome.runtime.sendMessage({method: "toogleKeyboardDemand"}, function(response) {
			window.close();	
		});
	}
	document.getElementById("goToUrl").onclick = function() {
		chrome.runtime.sendMessage({method: "openUrlBar"}, function(response) {
			window.close();
		});
	}
	chrome.storage.local.get("keyboardEnabled", function(items) {
		if (items["keyboardEnabled"] == "demand") {
			document.getElementById("toggleDemand").classList.add("active");
		} else if (items["keyboardEnabled"] != "false") {
			document.getElementById("toggleOn").classList.add("active");
		} else {
			document.getElementById("toggleOff").classList.add("active");
		}
	});

}, false);
