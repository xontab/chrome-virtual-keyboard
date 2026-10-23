// Offscreen document: hands the Manifest V2 localStorage settings to the service worker.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request && request.target == "offscreen" && request.method == "readLocalStorage") {
        var data = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        sendResponse(data);
    }
});
