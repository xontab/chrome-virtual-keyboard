// Settings live in chrome.storage.local (service workers have no localStorage).
// Values are kept as strings so existing "true"/"false" comparisons keep working.

var vkeyboard_ready = vkeyboard_migrateLocalStorage();

// One-time copy of settings saved by the Manifest V2 background page's localStorage.
// Only an extension document can read that localStorage, so an offscreen document does it.
async function vkeyboard_migrateLocalStorage() {
    var flag = await chrome.storage.local.get("mv3Migrated");
    if (flag.mv3Migrated) {
        return;
    }
    try {
        await chrome.offscreen.createDocument({
            url: "migrate.html",
            reasons: ["LOCAL_STORAGE"],
            justification: "Migrate settings saved by the previous version of the extension"
        });
        var data = await chrome.runtime.sendMessage({ target: "offscreen", method: "readLocalStorage" });
        if (data) {
            var existing = await chrome.storage.local.get(null);
            for (var key in existing) {
                delete data[key];
            }
            await chrome.storage.local.set(data);
        }
        await chrome.offscreen.closeDocument();
    } catch (e) {
        console.warn("Virtual Keyboard: localStorage migration skipped", e);
    }
    await chrome.storage.local.set({ mv3Migrated: true });
}

async function vkeyboard_getSettings() {
    await vkeyboard_ready;
    return chrome.storage.local.get(null);
}

async function vkeyboard_set(key, value) {
    await vkeyboard_ready;
    var item = {};
    item[key] = String(value);
    await chrome.storage.local.set(item);
}

async function vkeyboard_targetTabId(sender) {
    if (sender.tab) {
        return sender.tab.id;
    }
    var tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tabs.length ? tabs[0].id : undefined;
}

function vkeyboard_sendToTab(tabId, message, frameId) {
    if (tabId == undefined) {
        return;
    }
    var options = frameId == undefined ? {} : { frameId: frameId };
    chrome.tabs.sendMessage(tabId, message, options).catch(function () { });
}

async function vkeyboard_setKeyboardEnabled(value, message, sender) {
    await vkeyboard_set("keyboardEnabled", value);
    var tabId = await vkeyboard_targetTabId(sender);
    if (tabId != undefined) {
        await vkeyboard_loadPageIcon(tabId);
    }
    vkeyboard_sendToTab(tabId, message);
}

async function vkeyboard_handleRequest(request, sender) {
    var s;
    if (request.method == "whenReady") {
        await vkeyboard_ready;
        return {};
    }
    else if (request.method == "openFromIframe" || request.method == "clickFromIframe") {
        // The keyboard lives in the top frame; tell it which frame the field is in.
        request.frameId = sender.frameId;
        vkeyboard_sendToTab(await vkeyboard_targetTabId(sender), request, 0);
        return {};
    }
    else if (request.method == "keyToFrame") {
        vkeyboard_sendToTab(await vkeyboard_targetTabId(sender), request, request.frameId);
        return {};
    }
    else if (request.method == "toogleKeyboard") {
        s = await vkeyboard_getSettings();
        if (s["keyboardEnabled"] != "false") {
            await vkeyboard_setKeyboardEnabled("false", "closeKeyboard", sender);
        } else {
            await vkeyboard_setKeyboardEnabled("true", "openKeyboard", sender);
        }
        return { data: "ok" };
    }
    else if (request.method == "toogleKeyboardOn") {
        await vkeyboard_setKeyboardEnabled("true", "openKeyboard", sender);
        return { data: "ok" };
    }
    else if (request.method == "toogleKeyboardDemand") {
        await vkeyboard_setKeyboardEnabled("demand", "openKeyboard", sender);
        return { data: "ok" };
    }
    else if (request.method == "toogleKeyboardOff") {
        await vkeyboard_setKeyboardEnabled("false", "closeKeyboard", sender);
        return { data: "ok" };
    }
    else if (request.method == "openUrlBar") {
        vkeyboard_sendToTab(await vkeyboard_targetTabId(sender), "openUrlBar");
        return { data: "ok" };
    }
    else if (request.method == "openOptions") {
        await chrome.runtime.openOptionsPage();
        return {};
    }
    else if (request.method == "createTab") {
        await chrome.tabs.create({ url: request.url });
        return {};
    }
    return {};
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request && request.target == "offscreen") {
        return false;
    }
    vkeyboard_handleRequest(request, sender).then(sendResponse, function (e) {
        console.error(e);
        sendResponse({});
    });
    return true;
});

async function vkeyboard_loadPageIcon(tabId) {
    var s = await vkeyboard_getSettings();
    var path;
    var state;
    if (s["keyboardEnabled"] == "demand") {
        state = "demand";
    } else if (s["keyboardEnabled"] != "false") {
        state = "on";
    } else {
        state = "off";
    }
    path = {
        "16": "images/toolbar-" + state + "-16.png",
        "24": "images/toolbar-" + state + "-24.png",
        "32": "images/toolbar-" + state + "-32.png"
    };
    try {
        await chrome.action.setIcon({ tabId: tabId, path: path });
    } catch (e) {
        // Tab may have closed in the meantime.
    }
}

// Hosts such as Electron implement only part of the extension APIs.
chrome.tabs.onUpdated && chrome.action && chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    try {
        // The button is always available; versions before 2.0 could hide it with a setting.
        await chrome.action.enable(tabId);
        await vkeyboard_loadPageIcon(tabId);
    } catch (e) {
        // Tab may have closed in the meantime.
    }
});

chrome.storage.onChanged && chrome.storage.onChanged.addListener(async function (changes, areaName) {
    if ((areaName != "local") || (changes.keyboardEnabled == undefined) || !chrome.action) {
        return;
    }
    var tabs = await chrome.tabs.query({});
    tabs.forEach(function (tab) {
        vkeyboard_loadPageIcon(tab.id);
    });
});
