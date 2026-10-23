 var virtualKeyboardChromeExtensionClickedElem = null;
var virtualKeyboardChromeExtensionElemType = "input";
var virtualKeyboardChromeExtensionPagePadding = false;
var virtualKeyboardChromeExtensionSavedMarginBottom = "";
var virtualKeyboardChromeExtensionScrollRestore = new Map();
var virtualKeyboardChromeExtensionResizeObserver = null;
var virtualKeyboardChromeExtensionPaddedContainers = new Map();
var virtualKeyboardChromeExtensionState = false;
var virtualKeyboardChromeExtensionShift = false;
var virtualKeyboardChromeExtensionFormat = false;
var virtualKeyboardChromeExtensionClickedYPos = undefined;
var virtualKeyboardChromeExtensionClickedXPos = undefined;
var virtualKeyboardChromeExtensionClickedMenuBtn = false;
var virtualKeyboardChromeExtensionMenuSticky = false;
var virtualKeyboardChromeExtensionOffsetTimeout = undefined;
var virtualKeyboardChromeExtensionElemChanged = false;
var virtualKeyboardChromeExtensionShiftBehaviour = true;
var virtualKeyboardChromeExtensionFullScreenState = true;
var virtualKeyboardChromeExtensionTouchEvents = undefined;
var virtualKeyboardChromeExtensionKeyboardElement = undefined;
var virtualKeyboardChromeExtensionUrlButton = true;
var virtualKeyboardChromeExtensionRepeatLetters = false;
var virtualKeyboardChromeExtensionKeyboardEnabled = true;
var virtualKeyboardChromeExtensionKeyboardLayout1Setting = true;
var virtualKeyboardChromeExtensionCloseTimer = null;
var virtualKeyboardChromeExtensionBackspaceTimer = null;
var virtualKeyboardChromeExtensionDraggabling = false;
var virtualKeyboardChromeExtensionDraggablingX = 0;
var virtualKeyboardChromeExtensionDraggablingY = 0;
var virtualKeyboardChromeExtensionRequestRefresh = false;
var virtualKeyboardChromeExtensionKeyboardLoaded1 = "";
var virtualKeyboardChromeExtensionRemoteFrameId = undefined;
var virtualKeyboardChromeExtensionRemoteElemType = "input";
// Elements that already have the keyboard's listeners. A WeakSet rather than a marker
// attribute, because cloneNode() copies attributes but not listeners (issue #5).
var virtualKeyboardChromeExtensionBound = new WeakSet();

function vk_isBound(e) {
    return virtualKeyboardChromeExtensionBound.has(e);
}

function vk_markBound(e) {
    virtualKeyboardChromeExtensionBound.add(e);
}

var hardwareAcceleration = true;
var autoTrigger = false;
var intelligentScroll = true;
var autoTriggerLinks = false;
var autoTriggerAfter = 1;
var lastHovered = null;
var lastHoveredTO = null;
var refreshTime = 500;
var dialogs =[];

// When the extension is reloaded or updated, scripts already running in open tabs lose access to the
// extension ("Extension context invalidated"). Such an orphaned script removes its keyboard and stops;
// the page gets a fresh one on its next load.
var vk_orphaned = false;
var vk_intervals = [];

function vk_contextValid() {
    if (!vk_orphaned) {
        try {
            vk_orphaned = !(chrome.runtime && chrome.runtime.id);
        } catch (e) {
            vk_orphaned = true;
        }
        if (vk_orphaned) {
            vk_shutdown();
        }
    }
    return !vk_orphaned;
}

function vk_shutdown() {
    vk_intervals.forEach(clearInterval);
    clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
    clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
    document.removeEventListener("focusin", vk_document_focusin, true);
    document.removeEventListener("mouseover", vk_document_link_mouseover, true);
    document.removeEventListener("mouseout", vk_document_link_mouseout, true);
    document.removeEventListener("pointerup", vk_document_mouseup, false);
    if (virtualKeyboardChromeExtensionResizeObserver != null) {
        virtualKeyboardChromeExtensionResizeObserver.disconnect();
    }
    virtualKeyboardChromeExtension_restoreScroll();
    if ((virtualKeyboardChromeExtensionKeyboardElement != undefined) && (virtualKeyboardChromeExtensionKeyboardElement.parentNode != null)) {
        virtualKeyboardChromeExtensionKeyboardElement.parentNode.removeChild(virtualKeyboardChromeExtensionKeyboardElement);
    }
}

// Keyboard parts by id. Pages that re-render their body (single-page apps) can remove the keyboard
// from the document between uses; it is added back when it next opens, so also look inside it directly.
function vk_el(id) {
    var el = document.getElementById(id);
    if ((el == null) && (virtualKeyboardChromeExtensionKeyboardElement != undefined)) {
        el = virtualKeyboardChromeExtensionKeyboardElement.querySelector("#" + CSS.escape(id));
    }
    return el;
}

// Settings are read and written in chrome.storage.local directly; only tab-level actions go through
// the background service worker. That keeps the keyboard working where there is no background,
// such as Electron (issue #27).
var vk_storageReady = new Promise(function (resolve) {
    chrome.storage.local.get("mv3Migrated", function (items) {
        if (items.mv3Migrated) {
            resolve();
            return;
        }
        // The background copies settings saved by older versions on first start; wait for it if there is one.
        vk_sendToBackground({ method: "whenReady" }, resolve);
    });
});

var vk_settingGroups = {
    getSmallKeyboardCoords: ["smallKeyboard", "smallKeyboardTop", "smallKeyboardBottom", "smallKeyboardRight", "smallKeyboardLeft"],
    loadKeyboardSettings: ["openedFirstTime", "capsLock", "smallKeyboard", "touchEvents", "keyboardLayout1", "urlButton", "keyboardEnabled"],
    initLoadKeyboardSettings: ["hardwareAcceleration", "zoomLevel", "autoTrigger", "repeatLetters", "intelligentScroll", "autoTriggerLinks", "autoTriggerAfter", "refreshTime"]
};

function vk_sendToBackground(request, callback) {
    try {
        chrome.runtime.sendMessage(request, function (response) {
            // Reading lastError marks "no background listening" as handled.
            var failed = chrome.runtime.lastError != undefined;
            if (callback) {
                callback(response || {}, failed);
            }
        });
    } catch (e) {
        if (callback) {
            callback({}, true);
        }
    }
}

function vk_request(request, callback) {
    if (!vk_contextValid()) {
        return;
    }
    callback = callback || function () { };
    if (request.method == "getLocalStorage") {
        vk_storageReady.then(function () {
            if (!vk_contextValid()) {
                return;
            }
            chrome.storage.local.get(request.key, function (items) {
                callback({ data: items[request.key] });
            });
        });
    } else if (request.method == "setLocalStorage") {
        var item = {};
        item[request.key] = String(request.value);
        vk_storageReady.then(function () {
            if (!vk_contextValid()) {
                return;
            }
            chrome.storage.local.set(item, function () {
                callback({ data: "ok", setted_key: request.key });
            });
        });
    } else if (vk_settingGroups[request.method] != undefined) {
        vk_storageReady.then(function () {
            if (!vk_contextValid()) {
                return;
            }
            chrome.storage.local.get(vk_settingGroups[request.method], callback);
        });
    } else {
        vk_sendToBackground(request, callback);
    }
}

// Changes made in the options page or popup apply without reloading the page.
// Saved by the keyboard itself, so they never need a rebuild.
var vk_selfManagedSettings = ["smallKeyboardTop", "smallKeyboardBottom", "smallKeyboardLeft", "smallKeyboardRight", "openedFirstTime", "keyboardLayout1", "mv3Migrated"];
// Applied as they change, without a rebuild.
var vk_liveSettings = ["keyboardEnabled", "autoTrigger", "autoTriggerLinks", "autoTriggerAfter"];
var vk_rebuildPending = false;

chrome.storage.onChanged && chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName != "local") {
        return;
    }
    vk_applyHoverSettings(changes, function (change) { return change.newValue; });
    if (changes.keyboardEnabled != undefined) {
        virtualKeyboardChromeExtensionKeyboardEnabled = changes.keyboardEnabled.newValue;
        if ((top == self) && (virtualKeyboardChromeExtensionKeyboardEnabled == "false") && virtualKeyboardChromeExtensionState) {
            virtualKeyboardChromeExtension_click("Close");
        }
    }
    var needsRebuild = Object.keys(changes).some(function (key) {
        return (vk_liveSettings.indexOf(key) < 0) && (vk_selfManagedSettings.indexOf(key) < 0);
    });
    if ((top == self) && needsRebuild && (virtualKeyboardChromeExtensionKeyboardElement != undefined)) {
        // Rebuilding under the user's fingers would lose their place; wait until the keyboard closes.
        if (virtualKeyboardChromeExtensionState) {
            vk_rebuildPending = true;
        } else {
            vk_rebuildKeyboard();
        }
    }
});

// Click-by-hovering settings, from a storage read or a storage change.
function vk_applyHoverSettings(values, read) {
    read = read || function (value) { return value; };
    if (values.autoTrigger != undefined) {
        autoTrigger = read(values.autoTrigger) == "true";
    }
    if (values.autoTriggerLinks != undefined) {
        autoTriggerLinks = read(values.autoTriggerLinks) == "true";
    }
    if (values.autoTriggerAfter != undefined) {
        autoTriggerAfter = parseFloat(read(values.autoTriggerAfter)) * 1000;
    }
}

// Throws the keyboard away and loads it again with the current settings.
function vk_rebuildKeyboard() {
    vk_rebuildPending = false;
    virtualKeyboardChromeExtension_restoreScroll();
    if (virtualKeyboardChromeExtensionResizeObserver != null) {
        virtualKeyboardChromeExtensionResizeObserver.disconnect();
        virtualKeyboardChromeExtensionResizeObserver = null;
    }
    if ((virtualKeyboardChromeExtensionKeyboardElement != undefined) && (virtualKeyboardChromeExtensionKeyboardElement.parentNode != null)) {
        virtualKeyboardChromeExtensionKeyboardElement.parentNode.removeChild(virtualKeyboardChromeExtensionKeyboardElement);
    }
    virtualKeyboardChromeExtensionTouchEvents = undefined;
    virtualKeyboardChromeExtensionKeyboardLoaded1 = "";
    virtualKeyboardChromeExtensionShift = false;
    virtualKeyboardChromeExtensionFormat = false;
    vk_loadKeyboard();
}

function vk_rebuildIfPending() {
    setTimeout(function () {
        if (vk_rebuildPending && !virtualKeyboardChromeExtensionState) {
            vk_rebuildKeyboard();
        }
    }, 600);
}

// Customize default settings in local storage
var OPEN_SETTINGS = false; // Open KB settings page the first time
var ALT_LAYOUTS = [
    {"value":"en","name":"English (QWERTY)"}
];
var CAPS_LOCK = "true";
var HW_ACCEL = "true";
var INTELLISCROLL = "false";
var DEFAULT_LAYOUT = "en";
var REPEAT_LETTERS = "true";
var SMALL_KB = "false";
var TOUCH_EVENTS = "true";
var URL_BUTTON = "false";

function set_default() {
    /* Function called at the very beginning to set some default
     *  custom values in the localStorage to "customize" the keybaord
     *  when it gets loaded the first time.
     */

    // First check if the default settings are there already.
    key = "openedFirstTime";

    if (OPEN_SETTINGS) {
        last_key_to_check = "urlButton";
    } else {
        last_key_to_check = "openedFirstTime";
    }

    vk_request(
        { method: "getLocalStorage", key: key },
        function (response) {
            if (response["data"] === "true") {
                // If the defaults are already there, load the keyboard
                vk_request(
                    { method: "loadKeyboardSettings" },
                    xk_settings_load_main
                );
            } else {
                // If not, setup the defaults
                base_settings = {
                    capsLock: CAPS_LOCK,
                    hardwareAcceleration: HW_ACCEL,
                    intelligentScroll: INTELLISCROLL,
                    keyboardLayout1: DEFAULT_LAYOUT,
                    keyboardLayoutsList: JSON.stringify(ALT_LAYOUTS),
                    repeatLetters: REPEAT_LETTERS,
                    smallKeyboard: SMALL_KB,
                    touchEvents: TOUCH_EVENTS,
                    urlButton: URL_BUTTON,
                    openedFirstTime: "true"
                };
                // Store the settings
                for (var key in base_settings) {
                    if (OPEN_SETTINGS == true && key === "openedFirstTime") {
                        continue;
                    }
                    vk_request({
                        method: "setLocalStorage",
                        key: key,
                        value: base_settings[key]
                    }, function (response) {
                        // If default settings keys are set, let's load the keyboard
                        if (response.setted_key === last_key_to_check) {
                            vk_request(
                                { method: "loadKeyboardSettings" },
                                xk_settings_load_main
                            );
                        }
                    });
                }
            }
        });
}

function virtualKeyboardChromeExtension_dispatch_event(eventType = "input") {
    var keyboardEvent = document.createEvent("Event");
    keyboardEvent.initEvent(eventType, true, false);
    virtualKeyboardChromeExtensionClickedElem.dispatchEvent(keyboardEvent);
}

function virtualKeyboardChromeExtension_generate_onchange() {
    if (virtualKeyboardChromeExtensionElemChanged == true) {
        virtualKeyboardChromeExtensionElemChanged = false;
        if (virtualKeyboardChromeExtensionClickedElem != null) {
            if ("fireEvent" in virtualKeyboardChromeExtensionClickedElem)
                virtualKeyboardChromeExtensionClickedElem.fireEvent("onchange");
            else {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                virtualKeyboardChromeExtensionClickedElem.dispatchEvent(evt);
            }
        }
    }
}

function virtualKeyboardChromeExtension_getParentByTagName(el, tagName) {
    var t = el.parentNode;
    tagName = tagName.toLowerCase();
    var c = 0;
    while (c < 500) {

        if (t != undefined) {
            if (t.tagName != undefined) {
                if (t.tagName.toLowerCase() == tagName) {
                    return t;
                }
            }
            t = t.parentNode;
        }
        c++;
    }
    return null;
}

function virtualKeyboardChromeExtension_shiftButtonKeys() {
    var keys = document.getElementsByClassName("keyCaseDisplay");
    for (var i = 0; i < keys.length; i++) {
        keys[i].innerHTML = "<span>" + keys[i].getAttribute("_key" + (virtualKeyboardChromeExtensionShift ? "C" : "")) + "</span>";
    }
}

function virtualKeyboardChromeExtension_submit_buttons(form, inputType = "input") {
    var inputs = form.getElementsByTagName(inputType);
    var c = 0;
    for (var i = 0; i < inputs.length; i++) {
        if ((inputs[i].type == "submit") && (c <= 0)) {
            inputs[i].click();
            c++;
        }
    }
    return c;
}

function virtualKeyboardChromeExtension_click(key, skip) {
    if (!vk_contextValid()) {
        return;
    }
    if (top != self) {
        vk_request({ method: "clickFromIframe", key: key, skip: skip });
    } else {
        if (key != "Close") {
            if (skip == undefined) { skip = false; }
            if (!skip) {
                if (virtualKeyboardChromeExtensionClickedElem != null) {
                    virtualKeyboardChromeExtension_focusIfNeeded(virtualKeyboardChromeExtensionClickedElem);
                }
                clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
            }
        }
        switch (key) {
        case "empty":
            break;
        case "Url":
            vk_el("virtualKeyboardChromeExtensionUrlBarTextBox").focus();
            break;
        case "Settings":
            openSettings();
            break;
        case '&123':
            var lettersHeight = vk_el('virtualKeyboardChromeExtensionMainKbd').getBoundingClientRect().height;
            virtualKeyboardChromeExtensionFormat = !virtualKeyboardChromeExtensionFormat;
            vk_el('virtualKeyboardChromeExtensionMainKbd').style.display = virtualKeyboardChromeExtensionFormat ? "none" : "";
            vk_el('virtualKeyboardChromeExtensionMainNumbers').style.display = virtualKeyboardChromeExtensionFormat ? "" : "none";
            if (virtualKeyboardChromeExtensionFormat) {
                virtualKeyboardChromeExtension_matchNumbersHeight(lettersHeight);
            }
            break;
        case 'Close':
            for( let dlg of dialogs ){
                if (dlg.oldNoCancelOnOutsideClick)
                    dlg.setAttribute("no-cancel-on-outside-click", dlg.oldNoCancelOnOutsideClick );
                else
                    dlg.removeAttribute("no-cancel-on-outside-click");
            }
            dialogs = [];

            if (virtualKeyboardChromeExtensionState) {
                virtualKeyboardChromeExtensionState = false;
                if (virtualKeyboardChromeExtensionFullScreenState) {
                    if (hardwareAcceleration) {
                        vk_el('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,450px,0)");
                    } else {
                        vk_el('virtualKeyboardChromeExtension').style.bottom = "-450px";
                    }
                }
                vk_el('virtualKeyboardChromeExtension').style.opacity = "0";
                vk_el('virtualKeyboardChromeExtension').setAttribute("_state", "closed");
                setTimeout(function () {
                    if (virtualKeyboardChromeExtensionState == false) {
                        vk_el('virtualKeyboardChromeExtension').style.display = "none";
                    }
                }, 500);
                virtualKeyboardChromeExtension_restoreScroll();
            }
            vk_el("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "close");
            setTimeout(function () {
                if (virtualKeyboardChromeExtensionState == false) {
                    vk_el("virtualKeyboardChromeExtensionOverlayDemand").style.display = "none";
                }
            }, 200);
            vk_rebuildIfPending();
            break;
        case 'Enter':
            if (virtualKeyboardChromeExtensionClickedElem != null) {
                var closesKeyboard = virtualKeyboardChromeExtension_targetType() == "input";
                virtualKeyboardChromeExtension_sendKey("Enter");
                if (closesKeyboard) {
                    virtualKeyboardChromeExtension_hide();
                }
            }
            break;
        case 'Shift':
            virtualKeyboardChromeExtensionShift = !virtualKeyboardChromeExtensionShift;
            vk_el("virtualKeyboardChromeExtensionMainKbd").className = virtualKeyboardChromeExtensionShift ? "Shift" : "";
            virtualKeyboardChromeExtension_shiftButtonKeys();
            break;
        case 'Backspace':
            if (virtualKeyboardChromeExtensionClickedElem != null) {
                virtualKeyboardChromeExtension_sendKey("Backspace");
            }
            break;
        default:
            if (virtualKeyboardChromeExtensionClickedElem != undefined) {
                if (virtualKeyboardChromeExtensionShift) {
                    if ((key.charCodeAt(0) >= 97) && (key.charCodeAt(0) <= 122)) {
                        key = String.fromCharCode(key.charCodeAt(0) - 32);
                    }
                    if ((key.charCodeAt(0) >= 224) && (key.charCodeAt(0) <= 252)) {
                        key = String.fromCharCode(key.charCodeAt(0) - 32);
                    }
                    // 'ű' and 'ő'
                    if ((key.charCodeAt(0) == 337) || (key.charCodeAt(0) == 369)) {
                        key = String.fromCharCode(key.charCodeAt(0) - 1);
                    }
                }
                virtualKeyboardChromeExtension_sendKey(key);
                if ((virtualKeyboardChromeExtensionShift) && (virtualKeyboardChromeExtensionShiftBehaviour)) {
                    virtualKeyboardChromeExtensionShift = !virtualKeyboardChromeExtensionShift;
                    vk_el("virtualKeyboardChromeExtensionMainKbd").className = virtualKeyboardChromeExtensionShift ? "Shift" : "";
                    virtualKeyboardChromeExtension_shiftButtonKeys();
                }
                virtualKeyboardChromeExtensionDraggabling = false;
            }
            break;
        }
    }
}

// The numbers panel has fewer rows than the letters; stretch its rows to the letters' height so
// the keyboard keeps its size when switching between them.
function virtualKeyboardChromeExtension_matchNumbersHeight(lettersHeight) {
    var table = document.querySelector("#virtualKeyboardChromeExtensionMainNumbers table");
    if ((table == null) || (lettersHeight <= 0)) {
        return;
    }
    table.style.height = "";
    var visible = table.getBoundingClientRect().height;
    if ((visible <= 0) || (visible >= lettersHeight)) {
        return;
    }
    // Rect sizes include CSS zoom (the small keyboard is zoomed); offsetHeight does not.
    var scale = visible / table.offsetHeight;
    table.style.height = (table.offsetHeight + (lettersHeight - visible) / scale) + "px";
}

// Type of the element keys are going to; for a field inside an iframe this is the
// type reported by that frame.
function virtualKeyboardChromeExtension_targetType() {
    if (virtualKeyboardChromeExtensionElemType == "frame") {
        return virtualKeyboardChromeExtensionRemoteElemType;
    }
    return virtualKeyboardChromeExtensionElemType;
}

// Fields inside iframes are edited by the content script running in that frame, so
// this works for cross-origin frames too.
function virtualKeyboardChromeExtension_sendKey(key) {
    if (virtualKeyboardChromeExtensionElemType == "frame") {
        vk_request({ method: "keyToFrame", key: key, frameId: virtualKeyboardChromeExtensionRemoteFrameId });
    } else {
        virtualKeyboardChromeExtension_editElement(virtualKeyboardChromeExtensionClickedElem, virtualKeyboardChromeExtensionElemType, key);
    }
}

function virtualKeyboardChromeExtension_focusIfNeeded(elem) {
    // Re-focusing a contenteditable element moves the caret to the start, so leave it alone if it already has focus.
    var active = elem.getRootNode().activeElement;
    if ((active != elem) && !((active != null) && elem.contains(active))) {
        elem.focus();
    }
}

function virtualKeyboardChromeExtension_keyEvent(type, key, keyCode) {
    return new KeyboardEvent(type, {
        key: key,
        keyCode: keyCode,
        which: keyCode,
        charCode: type == "keypress" ? keyCode : 0,
        bubbles: true,
        cancelable: true,
        composed: true
    });
}

// Edits go through execCommand where possible: it fires the native beforeinput/input events
// that rich text editors (ProseMirror, Lexical, Quill, Slate, CKEditor) and framework-controlled
// inputs listen to, and it keeps the browser's undo history.
function virtualKeyboardChromeExtension_editElement(elem, elemType, key) {
    var doc = elem.ownerDocument;
    var isChar = (key != "Enter") && (key != "Backspace");
    var keyCode = key == "Enter" ? 13 : (key == "Backspace" ? 8 : key.toUpperCase().charCodeAt(0));

    virtualKeyboardChromeExtension_focusIfNeeded(elem);
    // Editors handle keys such as Enter in their own keydown handlers and cancel the event when they do.
    if (!elem.dispatchEvent(virtualKeyboardChromeExtension_keyEvent("keydown", key, keyCode))) {
        elem.dispatchEvent(virtualKeyboardChromeExtension_keyEvent("keyup", key, keyCode));
        return;
    }
    if (isChar && !elem.dispatchEvent(virtualKeyboardChromeExtension_keyEvent("keypress", key, key.charCodeAt(0)))) {
        elem.dispatchEvent(virtualKeyboardChromeExtension_keyEvent("keyup", key, keyCode));
        return;
    }
    // execCommand does not fire beforeinput, and editors such as CKEditor 5 and Slate apply typing
    // only from beforeinput, so send one first. If the editor cancels it, it has made the edit itself.
    var inputType = isChar ? "insertText" : (key == "Backspace" ? "deleteContentBackward" : (elemType == "contenteditable" ? "insertParagraph" : (elemType == "textarea" ? "insertLineBreak" : null)));
    if ((inputType != null) && !virtualKeyboardChromeExtension_dispatchBeforeInput(elem, elemType, inputType, isChar ? key : null)) {
        elem.dispatchEvent(virtualKeyboardChromeExtension_keyEvent("keyup", key, keyCode));
        return;
    }

    if (key == "Enter") {
        if (elemType == "contenteditable") {
            if (!doc.execCommand("insertParagraph")) {
                virtualKeyboardChromeExtension_insertIntoEditable(elem, "\n", "insertLineBreak");
            }
        } else if (elemType == "textarea") {
            if (!doc.execCommand("insertText", false, "\n")) {
                virtualKeyboardChromeExtension_spliceValue(elem, "\n", "insertLineBreak");
            }
        } else {
            var form = elem.form || virtualKeyboardChromeExtension_getParentByTagName(elem, "form");
            if (form != null) {
                var c = virtualKeyboardChromeExtension_submit_buttons(form);
                if (c <= 0) {
                    c = virtualKeyboardChromeExtension_submit_buttons(form, "button");
                }
                if (c <= 0) {
                    form.requestSubmit();
                }
            }
        }
    } else if (key == "Backspace") {
        if (!doc.execCommand("delete")) {
            if (elemType == "contenteditable") {
                var sel = elem.getRootNode().getSelection ? elem.getRootNode().getSelection() : doc.getSelection();
                if (sel.isCollapsed) {
                    sel.modify("extend", "backward", "character");
                }
                virtualKeyboardChromeExtension_insertIntoEditable(elem, "", "deleteContentBackward");
            } else {
                virtualKeyboardChromeExtension_spliceValue(elem, "", "deleteContentBackward");
            }
        }
    } else if (elemType == "contenteditable") {
        if (!doc.execCommand("insertText", false, key)) {
            virtualKeyboardChromeExtension_insertIntoEditable(elem, key, "insertText");
        }
    } else if ((elem.maxLength <= 0) || (elem.value.length < elem.maxLength)) {
        if (!doc.execCommand("insertText", false, key)) {
            virtualKeyboardChromeExtension_spliceValue(elem, key, "insertText");
        }
    }

    if (elemType != "contenteditable") {
        virtualKeyboardChromeExtensionElemChanged = true;
    }
    elem.dispatchEvent(virtualKeyboardChromeExtension_keyEvent("keyup", key, keyCode));
    if ((key == "Enter") && (elemType == "input")) {
        virtualKeyboardChromeExtension_generate_onchange();
    }
}

// beforeinput is dispatched by page-input.js in the page's world (see that file for why).
// Returns false when the page's editor cancelled it.
function virtualKeyboardChromeExtension_dispatchBeforeInput(elem, elemType, inputType, data) {
    return elem.dispatchEvent(new CustomEvent("virtualkeyboard-beforeinput", {
        detail: JSON.stringify({ inputType: inputType, data: data, contentEditable: elemType == "contenteditable" }),
        bubbles: true,
        cancelable: true,
        composed: true
    }));
}

// Fallback for inputs where execCommand is unavailable.
function virtualKeyboardChromeExtension_spliceValue(elem, text, inputType) {
    var pos = elem.selectionStart;
    var posEnd = elem.selectionEnd;
    if ((text == "") && (pos == posEnd)) {
        pos = Math.max(pos - 1, 0);
    }
    elem.value = elem.value.substr(0, pos) + text + elem.value.substr(posEnd);
    elem.selectionStart = pos + text.length;
    elem.selectionEnd = pos + text.length;
    elem.dispatchEvent(new InputEvent("input", { inputType: inputType, data: text || null, bubbles: true }));
}

// Fallback for contenteditable elements where execCommand is unavailable.
function virtualKeyboardChromeExtension_insertIntoEditable(elem, text, inputType) {
    var doc = elem.ownerDocument;
    var sel = doc.getSelection();
    if (sel.rangeCount == 0) {
        return;
    }
    var range = sel.getRangeAt(0);
    range.deleteContents();
    if (text != "") {
        var node = doc.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    elem.dispatchEvent(new InputEvent("input", { inputType: inputType, data: text || null, bubbles: true }));
}

function virtualKeyboardChromeExtension_hide() {
    virtualKeyboardChromeExtensionState = false;
    if (virtualKeyboardChromeExtensionFullScreenState) {
        if (hardwareAcceleration) {
            vk_el('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,450px,0)");
        } else {
            vk_el('virtualKeyboardChromeExtension').style.bottom = "-450px";
        }
    }
    vk_el('virtualKeyboardChromeExtension').style.opacity = "0";
    vk_el('virtualKeyboardChromeExtension').setAttribute("_state", "closed");
    setTimeout(function () { vk_el('virtualKeyboardChromeExtension').style.display = "none"; }, 500);
    virtualKeyboardChromeExtension_restoreScroll();
    vk_rebuildIfPending();
}


function setting_load(key, callback) {
    vk_request({ method: "getLocalStorage", key: key }, function (response) {
        callback(response.data);
    });
}

function setting_reloadKeyboardToggle(openState) {
    vk_request({ method: "getLocalStorage", key: "keyboardEnabled" }, function (response) {
        virtualKeyboardChromeExtensionKeyboardEnabled = response.data;
        if (openState && (document.activeElement.tagName == "INPUT") || (document.activeElement.tagName == "TEXTAREA")) {
            var e = document.activeElement;
            document.activeElement.blur();
            setTimeout(function () {
                e.focus();
            }, 500);
        }
    });
}

function setting_set(key, value) {
    vk_request({ method: "setLocalStorage", key: key, value: value }, function (response) { });
}

function openSettings() {
    vk_request({ method: "openOptions" }, function (response, failed) {
        if (failed) {
            window.open(chrome.runtime.getURL("options.html"));
        }
    });
}

function openUrl(url) {
    vk_request({ method: "createTab", url: url }, function (response, failed) {
        if (failed) {
            window.open(url);
        }
    });
}

function virtualKeyboardChromeExtension_open_part2(pos) {
    if (virtualKeyboardChromeExtensionCloseTimer != null) {
        clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
    }
    virtualKeyboardChromeExtensionState = true;
    vk_el('virtualKeyboardChromeExtension').style.display = "";
    vk_request({ method: "getSmallKeyboardCoords" }, function (response) {
        if (response.smallKeyboard == "true") {
            if (hardwareAcceleration) {
                vk_el('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,0,0)");
            }
            vk_el('virtualKeyboardChromeExtension').style.top = response.smallKeyboardTop != undefined ? response.smallKeyboardTop : "auto";
            vk_el('virtualKeyboardChromeExtension').style.bottom = response.smallKeyboardBottom != undefined ? response.smallKeyboardBottom : "0";
            vk_el('virtualKeyboardChromeExtension').style.right = response.smallKeyboardRight != undefined ? response.smallKeyboardRight : "0";
            vk_el('virtualKeyboardChromeExtension').style.left = response.smallKeyboardLeft != undefined ? response.smallKeyboardLeft : "auto";
            vk_el("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "opacity 0.3s");
        } else {
            vk_el('virtualKeyboardChromeExtension').style.top = "";
            vk_el('virtualKeyboardChromeExtension').style.left = "";
            vk_el('virtualKeyboardChromeExtension').style.right = "";
            if (hardwareAcceleration) {
                vk_el('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,0,0)");
            } else {
                vk_el('virtualKeyboardChromeExtension').style.bottom = "0px";
            }
            vk_el("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "");
        }
        vk_el('virtualKeyboardChromeExtension').style.display = "";
        vk_el('virtualKeyboardChromeExtension').style.opacity = "1";
    });
    vk_el('virtualKeyboardChromeExtension').setAttribute("_state", "open");
    virtualKeyboardChromeExtension_scrollFieldIntoView();
    virtualKeyboardChromeExtensionClickedYPos = undefined;
}

function virtualKeyboardChromeExtension_scrollParent(el) {
    return el.parentElement || (el.parentNode && el.parentNode.host) || null;
}

// The full-size keyboard covers the bottom of the page, so the page gets bottom padding to be
// able to scroll everything above it. With intelligent scroll on, the field is scrolled above the
// keyboard: scrollIntoView with a bottom scroll margin moves the page and every scrolling container
// around the field, such as a modal dialog. Positions are restored on close (issue #26).
function virtualKeyboardChromeExtension_scrollFieldIntoView() {
    if (!virtualKeyboardChromeExtensionFullScreenState || (virtualKeyboardChromeExtensionClickedElem == null)) {
        return;
    }
    var kb = vk_el("virtualKeyboardChromeExtension");
    var kbHeight = kb.getBoundingClientRect().height;
    if (virtualKeyboardChromeExtensionResizeObserver == null) {
        // The keyboard can still be laying out (or switch layouts) after it opens; keep the padding and scroll in step.
        virtualKeyboardChromeExtensionResizeObserver = new ResizeObserver(function () {
            if (virtualKeyboardChromeExtensionPagePadding && virtualKeyboardChromeExtensionState) {
                document.body.style.marginBottom = kb.getBoundingClientRect().height + "px";
                virtualKeyboardChromeExtension_scrollFieldIntoView();
            }
        });
        virtualKeyboardChromeExtensionResizeObserver.observe(kb);
    }
    if (!virtualKeyboardChromeExtensionPagePadding) {
        virtualKeyboardChromeExtensionSavedMarginBottom = document.body.style.marginBottom;
        document.body.style.marginBottom = kbHeight + "px";
        virtualKeyboardChromeExtensionPagePadding = true;
    }
    var elem = virtualKeyboardChromeExtensionClickedElem;
    var rect = elem.getBoundingClientRect();
    if (!intelligentScroll || ((rect.top >= 0) && (rect.bottom <= window.innerHeight - kbHeight))) {
        return;
    }
    var scrollers = [document.scrollingElement];
    for (var el = virtualKeyboardChromeExtension_scrollParent(elem); el != null; el = virtualKeyboardChromeExtension_scrollParent(el)) {
        if ((el.scrollHeight > el.clientHeight) && (el != document.scrollingElement)) {
            scrollers.push(el);
        }
    }
    // Keep the positions from before the first scroll, so moving between fields restores the original view.
    scrollers.forEach(function (el) {
        if (!virtualKeyboardChromeExtensionScrollRestore.has(el)) {
            virtualKeyboardChromeExtensionScrollRestore.set(el, { before: el.scrollTop, after: el.scrollTop });
        }
    });
    var oldMargin = elem.style.scrollMarginBottom;
    elem.style.scrollMarginBottom = (kbHeight + 20) + "px";
    elem.scrollIntoView({ block: "nearest" });
    // A container such as a fixed modal may have nothing left to scroll; pad its bottom so it can
    // scroll the field above the keyboard, like the page body.
    if (elem.getBoundingClientRect().bottom > window.innerHeight - kbHeight) {
        var container = virtualKeyboardChromeExtension_scrollContainer(elem);
        if ((container != null) && !virtualKeyboardChromeExtensionPaddedContainers.has(container)) {
            virtualKeyboardChromeExtensionPaddedContainers.set(container, container.style.paddingBottom);
            container.style.paddingBottom = (parseFloat(getComputedStyle(container).paddingBottom) + kbHeight) + "px";
            if (!virtualKeyboardChromeExtensionScrollRestore.has(container)) {
                virtualKeyboardChromeExtensionScrollRestore.set(container, { before: container.scrollTop, after: container.scrollTop });
            }
            elem.scrollIntoView({ block: "nearest" });
        }
    }
    elem.style.scrollMarginBottom = oldMargin;
    virtualKeyboardChromeExtensionScrollRestore.forEach(function (pos, el) {
        pos.after = el.scrollTop;
    });
}

// Nearest ancestor that scrolls its content (overflow auto/scroll), other than the page itself.
function virtualKeyboardChromeExtension_scrollContainer(elem) {
    for (var el = virtualKeyboardChromeExtension_scrollParent(elem); el != null; el = virtualKeyboardChromeExtension_scrollParent(el)) {
        if ((el == document.body) || (el == document.documentElement)) {
            return null;
        }
        var overflowY = getComputedStyle(el).overflowY;
        if ((overflowY == "auto") || (overflowY == "scroll")) {
            return el;
        }
    }
    return null;
}

function virtualKeyboardChromeExtension_restoreScroll() {
    virtualKeyboardChromeExtensionPaddedContainers.forEach(function (paddingBottom, el) {
        el.style.paddingBottom = paddingBottom;
    });
    virtualKeyboardChromeExtensionPaddedContainers.clear();
    if (virtualKeyboardChromeExtensionPagePadding) {
        document.body.style.marginBottom = virtualKeyboardChromeExtensionSavedMarginBottom;
        virtualKeyboardChromeExtensionPagePadding = false;
    }
    // Leave alone anything the user has scrolled since the keyboard moved it.
    virtualKeyboardChromeExtensionScrollRestore.forEach(function (pos, el) {
        if (Math.abs(el.scrollTop - pos.after) <= 50) {
            el.scrollTop = pos.before;
        }
    });
    virtualKeyboardChromeExtensionScrollRestore.clear();
}

function virtualKeyboardChromeExtension_inputTypesRender() {
    if (virtualKeyboardChromeExtensionElemType == "input") {
        if (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == undefined) {
            virtualKeyboardChromeExtensionClickedElem.setAttribute("_originalType", virtualKeyboardChromeExtensionClickedElem.type);
        }
        if (virtualKeyboardChromeExtensionClickedElem.type != "password") {
            virtualKeyboardChromeExtensionClickedElem.type = "text";
        }
    }
    if (top != self) {
        return;
    }
    vk_el("virtualKeyboardChromeExtensionMainNumbers").style.display = "none";
    vk_el("virtualKeyboardChromeExtensionNumberBarKbdInput").style.display = "none";
    vk_el("virtualKeyboardChromeExtensionMainKbd").style.display = "";

    virtualKeyboardChromeExtensionFormat = false;

    virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "none");
    if (virtualKeyboardChromeExtensionElemType != "textarea") {
        if ((virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "number")
            || (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "tel")) {
            vk_el("virtualKeyboardChromeExtensionNumberBarKbdInput").style.display = "";
            vk_el("virtualKeyboardChromeExtensionMainKbd").style.display = "none";
        } else if (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "email") {
            virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "");
        }
    }
}

function virtualKeyboardChromeExtension_open(posY, posX, force) {
    if (top != self) {
        vk_request({
            method: "openFromIframe",
            posY: posY,
            posX: posX,
            force: force,
            elemType: virtualKeyboardChromeExtensionElemType,
            inputType: virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") || virtualKeyboardChromeExtensionClickedElem.type
        });
    } else {
        if (document.webkitFullscreenElement) {
            document.webkitFullscreenElement.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
        } else {
            document.body.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
        }
        if ((virtualKeyboardChromeExtensionKeyboardEnabled == "demand") && (force == undefined) && (virtualKeyboardChromeExtensionClickedElem.id != "virtualKeyboardChromeExtensionUrlBarTextBox")) {
            virtualKeyboardChromeExtensionClickedElemDemand = virtualKeyboardChromeExtensionClickedElem;
            // posX/posY are viewport coordinates of the click; the overlay is positioned in the document.
            var elemRect = virtualKeyboardChromeExtensionClickedElem.getBoundingClientRect();
            posX = (posX == undefined ? elemRect.left : posX) + window.scrollX;
            posY = (posY == undefined ? elemRect.top : posY) + window.scrollY;
            vk_el("virtualKeyboardChromeExtensionOverlayDemand").style.display = "block";
            vk_el("virtualKeyboardChromeExtensionOverlayDemand").style.top = posY + "px";
            vk_el("virtualKeyboardChromeExtensionOverlayDemand").style.left = posX + "px";
            setTimeout(function () {
                vk_el("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "open");
            }, 50);

        } else if (virtualKeyboardChromeExtensionKeyboardEnabled != "false") {
            if (virtualKeyboardChromeExtensionKeyboardLayout1Setting == undefined) { virtualKeyboardChromeExtensionKeyboardLayout1Setting = "en"; }
            if (virtualKeyboardChromeExtensionKeyboardLoaded1 != virtualKeyboardChromeExtensionKeyboardLayout1Setting) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var data2 = xmlhttp.responseText;
                        vk_el("virtualKeyboardChromeExtensionMainKbdPH").innerHTML = data2;
                        init_virtualKeyboardChromeExtension(true);
                        virtualKeyboardChromeExtension_inputTypesRender();
                        virtualKeyboardChromeExtension_open_part2(posY);
                    }
                };
                xmlhttp.open("GET", chrome.runtime.getURL("layouts/keyboard_" + virtualKeyboardChromeExtensionKeyboardLayout1Setting + ".html"), true);
                xmlhttp.send();
                virtualKeyboardChromeExtensionKeyboardLoaded1 = virtualKeyboardChromeExtensionKeyboardLayout1Setting;
            } else {
                virtualKeyboardChromeExtension_open_part2(posY);
            }
        }
    }
}

function vk_evt_input_blur() {
    virtualKeyboardChromeExtension_generate_onchange();
    if (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") != undefined) {
        virtualKeyboardChromeExtensionClickedElem.type = virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType");
    }
    virtualKeyboardChromeExtensionClickedElem = undefined;
    virtualKeyboardChromeExtensionCloseTimer = setTimeout(function () {
        virtualKeyboardChromeExtension_click('Close');
    }, 500);
}



function vk_disable_pdclose(element) {
    let el = element;
    while (el != null) {
        if (el.parentElement)
            el = el.parentElement;
        else if (el.parentNode)
            el = el.parentNode;
        else
            el = el.host;

        if (el && el.nodeName == "PAPER-DIALOG"){
            if (dialogs.indexOf(el)<0) {
                let old = el.getAttribute("no-cancel-on-outside-click");
                el.oldNoCancelOnOutsideClick = old;

                el.setAttribute("no-cancel-on-outside-click", "");
                dialogs.push(el);
            }


        }
    }
}
function vk_evt_input_event(element, isFocus = false, elementType = "input") {
    if (!vk_contextValid()) {
        return;
    }
    if ((element.disabled == true) || (element.readOnly == true)) {
        return;
    }
    if (isFocus){
        vk_disable_pdclose(element);
    }
    clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
    virtualKeyboardChromeExtensionElemType = elementType;
    virtualKeyboardChromeExtension_generate_onchange();
    virtualKeyboardChromeExtensionClickedElem = element;
    if (isFocus || !virtualKeyboardChromeExtensionState) {
        virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos);
    }
    virtualKeyboardChromeExtension_inputTypesRender();
}

function vk_evt_input_focus() {
    return vk_evt_input_event(this, true);
}

function vk_evt_input_click() {
    return vk_evt_input_event(this);
}

function vt_evt_textarea_focus() {
    return vk_evt_input_event(this, true, "textarea");
}

function vt_evt_textarea_click() {
    return vk_evt_input_event(this, false, "textarea");
}

function vk_evt_editable_focus() {
    return vk_evt_input_event(this, true, "contenteditable");
}

function vk_evt_editable_click() {
    return vk_evt_input_event(this, false, "contenteditable");
}

// The element that owns editing for a contenteditable region: rich text editors put
// contenteditable on one root element, and designMode documents edit from <body>.
function virtualKeyboardChrome_isEditableHost(e) {
    if (!e.isContentEditable || (e.nodeName == "HTML")) {
        return false;
    }
    var parent = e.parentElement;
    return (parent == null) || !parent.isContentEditable || (parent.nodeName == "HTML");
}

function virtualKeyboardChrome_bind_node(e) {
    if (e.nodeName == "INPUT") {
        if ((e.type == "text") || (e.type == "password") || (e.type == "search") || (e.type == "email") || (e.type == "number") || (e.type == "tel") || (e.type == "url")) {
            virtualKeyboardChrome_bind_input(e, autoTrigger, vk_evt_input_focus, vk_evt_input_click);
            return true;
        }
    } else if (e.nodeName == "TEXTAREA") {
        virtualKeyboardChrome_bind_input(e, autoTrigger, vt_evt_textarea_focus, vt_evt_textarea_click);
        return true;
    } else if ((e.nodeType == Node.ELEMENT_NODE) && virtualKeyboardChrome_isEditableHost(e)) {
        virtualKeyboardChrome_bind_input(e, autoTrigger, vk_evt_editable_focus, vk_evt_editable_click);
        return true;
    }
    return false;
}

// Editors created after the last DOM scan are bound the moment they get focus.
function vk_document_focusin(ent) {
    var e = ent.composedPath()[0];
    if ((virtualKeyboardChromeExtensionTouchEvents == undefined) || !(e instanceof Element) || vk_isBound(e)) {
        return;
    }
    if (virtualKeyboardChrome_bind_node(e)) {
        e.dispatchEvent(new FocusEvent("focus"));
    }
}

function vk_evt_input_mousedown(ent) {
    const evt = virtualKeyboardChromeExtensionTouchEvents == "true" ? ent.touches[0] : window.event;
    virtualKeyboardChromeExtensionClickedYPos = evt.clientY;
    virtualKeyboardChromeExtensionClickedXPos = evt.clientX;
}

function vt_evt_autoTrigger_mover_timeout(elem) {
    lastHoveredTO = setTimeout(function () {
        if ((lastHovered == elem) && autoTrigger) {
            var repeats = vk_hoverActivate(elem);
            elem.className += " active";
            setTimeout(function () {
                elem.className = elem.className.replace(" active", "");
            }, 200);
            if (repeats) {
                vt_evt_autoTrigger_mover_timeout(lastHovered);
            }
        }
    }, autoTriggerAfter);
}

// What resting the pointer does: menu buttons such as the settings key open their menu (they act on
// press, not click), menu items are picked (they act on release), and everything else is clicked.
// Returns whether to keep repeating while the pointer stays put.
function vk_hoverActivate(elem) {
    var fakePointer = { pointerId: -1, preventDefault: function () { }, stopPropagation: function () { } };
    if (elem.classList.contains("kMenu") && (elem.getAttribute("_hoverOnly") != "true") && (elem.onpointerdown != null)) {
        var rect = elem.getBoundingClientRect();
        fakePointer.clientX = rect.left + rect.width / 2;
        fakePointer.clientY = rect.top + rect.height / 2;
        elem.onpointerdown(fakePointer);
        return false;
    }
    if (elem.classList.contains("virtualKeyboardChromeExtensionOverlayButton") && (elem.onpointerup != null)) {
        elem.onpointerup(fakePointer);
        virtualKeyboardChromeExtensionMenuSticky = false;
        vk_document_mouseup({ target: document.body });
        return false;
    }
    elem.focus();
    elem.click();
    return true;
}

// Hover listeners are attached to every field and key, and the settings are checked here, so
// turning click-by-hovering on applies to fields and keys that were set up before it was on.
function vt_evt_autoTrigger_mover(ent) {
    if (!autoTrigger) {
        return;
    }
    lastHovered = this;
    clearTimeout(lastHoveredTO);
    vt_evt_autoTrigger_mover_timeout(this);
}

// Clicking links by hovering is handled by page-wide listeners, so it covers links inside shadow
// DOM and links added at any time, without waiting for a scan.
function vk_hoveredLink(ent) {
    var path = ent.composedPath();
    for (var i = 0; i < path.length; i++) {
        if (path[i] instanceof Element) {
            if ((path[i].localName == "a") && path[i].hasAttribute("href")) {
                return path[i];
            }
            if (path[i].id == "virtualKeyboardChromeExtension") {
                return null;
            }
        }
    }
    return null;
}

function vk_document_link_mouseover(ent) {
    if (!autoTriggerLinks) {
        return;
    }
    var link = vk_hoveredLink(ent);
    // Moving between elements inside the same link keeps its timer running.
    if ((link == null) || (link == lastHovered)) {
        return;
    }
    lastHovered = link;
    clearTimeout(lastHoveredTO);
    lastHoveredTO = setTimeout(function () {
        if (lastHovered == link) {
            link.click();
        }
        lastHovered = null;
    }, autoTriggerAfter);
}

function vk_document_link_mouseout(ent) {
    if ((lastHovered == null) || (lastHovered.localName != "a")) {
        return;
    }
    var to = ent.relatedTarget;
    if ((to instanceof Node) && lastHovered.contains(to)) {
        return;
    }
    lastHovered = null;
    clearTimeout(lastHoveredTO);
}

function vt_evt_autoTrigger_mout(ent) {
    lastHovered = null;
    clearTimeout(lastHoveredTO);
}

function virtualKeyboardChromeClassStyleDisplay(className, value) {
    var items = document.getElementsByClassName(className);
    for (var i = 0; i < items.length; i++) {
        items[i].style.display = value;
    }
}

function virtualKeyboardChrome_bind_input(e, autoTriggerUnused, focusCallback, clickCallback) {
    if (!vk_isBound(e)) {
        e.addEventListener("blur", vk_evt_input_blur, false);
        e.addEventListener(virtualKeyboardChromeExtensionTouchEvents == "true" ? "touchstart" : "mousedown", vk_evt_input_mousedown, false);
        e.addEventListener("focus", focusCallback, false);
        e.addEventListener("click", clickCallback, false);
        e.addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
        e.addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
        vk_markBound(e);
    }
}

function xk_settings_load_main(response) {
    if (response.openedFirstTime == undefined) {
        openSettings();
        setting_set("openedFirstTime", "true");
    }
    vk_el('virtualKeyboardChromeExtension').className = response.smallKeyboard == "true" ? "modeS" : "";
    virtualKeyboardChromeExtensionFullScreenState = response.smallKeyboard != "true";
    virtualKeyboardChromeExtensionShiftBehaviour = response.capsLock == "false";
    virtualKeyboardChromeExtensionTouchEvents = response.touchEvents;
    if (virtualKeyboardChromeExtensionTouchEvents == undefined) { virtualKeyboardChromeExtensionTouchEvents = "false"; }

    document.addEventListener("pointerup", vk_document_mouseup, false);

    virtualKeyboardChromeExtensionKeyboardEnabled = response.keyboardEnabled;
    virtualKeyboardChromeExtensionKeyboardLayout1Setting = response.keyboardLayout1;

    virtualKeyboardChromeExtensionUrlButton = response.urlButton;
    if (virtualKeyboardChromeExtensionUrlButton == undefined) { virtualKeyboardChromeExtensionUrlButton = "false"; }

    init_virtualKeyboardChromeExtension(true);
}

function virtualKeyboardChrome_prevent(ent) {
    ent.preventDefault();
    ent.stopPropagation();
}

function* getAllChildNodes(element, includeShadowDom) {
    if (element.children) {
        for (let node of element.children) {
            yield node;
            if (includeShadowDom && node.shadowRoot != null) {
                yield node.shadowRoot;
                let childs = getAllChildNodes(node.shadowRoot, includeShadowDom);
                for (let cnode of childs) {
                    yield cnode;
                }
            }
            let childs = getAllChildNodes(node, includeShadowDom);
            for (let cnode of childs) {
                yield cnode;
            }
        }
    }
}

function init_virtualKeyboardChromeExtension(firstTime) {
    if (!vk_contextValid()) {
        return;
    }

    if (firstTime) {
        if (top == self) {
            if (virtualKeyboardChromeExtensionTouchEvents == undefined) {
                if ((vk_el('virtualKeyboardChromeExtension').getAttribute("_state") != "open") || (virtualKeyboardChromeExtensionRequestRefresh)) {
                    set_default();
                    //vk_request({ method: "loadKeyboardSettings" }, xk_settings_load_main);
                }
            } else {
                vk_el("virtualKeyboardChromeExtensionUrlBarTextBox").onblur = function () {
                    vk_el('virtualKeyboardChromeExtensionUrlBar').style.top = "-100px";
                    if (vk_el("urlButton") !== null) {
                        vk_el("urlButton").setAttribute("highlight", "");
                    }
                    virtualKeyboardChromeExtension_generate_onchange();
                    virtualKeyboardChromeExtensionClickedElem = undefined;
                    virtualKeyboardChromeExtensionCloseTimer = setTimeout(function () {
                        virtualKeyboardChromeExtension_click('Close');
                    }, 1000);
                };
                vk_el("virtualKeyboardChromeExtensionUrlBarTextBox").onfocus = function (evt) {
                    if (virtualKeyboardChromeExtensionCloseTimer != undefined) { clearTimeout(virtualKeyboardChromeExtensionCloseTimer); }
                    virtualKeyboardChromeExtensionElemType = "input";
                    virtualKeyboardChromeExtensionClickedElem = vk_el("virtualKeyboardChromeExtensionUrlBarTextBox");
                    vk_el('virtualKeyboardChromeExtensionUrlBar').style.top = "0px";
                    if (vk_el("urlButton") !== null) {
                        vk_el("urlButton").setAttribute("highlight", "true");
                    }
                    if (!virtualKeyboardChromeExtensionState) {
                        virtualKeyboardChromeExtension_open(0, 0, true);
                        vk_el("virtualKeyboardChromeExtensionUrlBarTextBox").focus();
                        virtualKeyboardChromeExtension_inputTypesRender();
                        setTimeout(function () {
                            if (vk_el("urlButton") !== null) {
                                vk_el("urlButton").setAttribute("highlight", "true");
                            }
                        }, 500);
                    }
                    evt.preventDefault();
                };
                // Navigating here rather than in an inline onsubmit, which pages' Content Security Policy often blocks.
                vk_el("virtualKeyboardChromeExtensionUrlBarForm").onsubmit = function (ent) {
                    ent.preventDefault();
                    var url = vk_el("virtualKeyboardChromeExtensionUrlBarTextBox").value.trim();
                    if (url != "") {
                        window.location.assign((/^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? "" : "https://") + url);
                    }
                };
                vk_el("virtualKeyboardChromeExtensionUrlBarTextBox").addEventListener("click", vk_evt_input_click, false);
                vk_markBound(vk_el("virtualKeyboardChromeExtensionUrlBarTextBox"));

                if (vk_el("urlButton") !== null) {
                    vk_el("urlButton").style.display = virtualKeyboardChromeExtensionUrlButton == "true" ? "" : "none";
                }

                virtualKeyboardChromeExtension_bindDragHandle(vk_el("virtualKeyboardChromeExtensionDraggableLeft"));
                virtualKeyboardChromeExtension_bindDragHandle(vk_el("virtualKeyboardChromeExtensionDraggableRight"));


                vk_el("virtualKeyboardChromeExtensionOverlayDemand").onclick = function (ent) {
                    virtualKeyboardChromeExtensionClickedElemDemand.focus();
                    virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos, true);
                    setTimeout(function () {
                        vk_el("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "close");
                        setTimeout(function () {
                            vk_el("virtualKeyboardChromeExtensionOverlayDemand").style.display = "none";
                        }, 200);
                    }, 100);
                    virtualKeyboardChrome_prevent(ent);
                };
                vk_el("virtualKeyboardChromeExtensionOverlayDemand").onmousedown = virtualKeyboardChrome_prevent;
                vk_el("virtualKeyboardChromeExtensionOverlayDemand").onmouseup = virtualKeyboardChrome_prevent;

                {
                    vk_el("virtualKeyboardChromeExtensionOverlayDemand").addEventListener("mouseover", vt_evt_autoTrigger_mover,
                                                                                                            false);
                    vk_el("virtualKeyboardChromeExtensionOverlayDemand").addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
                }
            }
        } else {
            if (virtualKeyboardChromeExtensionTouchEvents == undefined) {
                vk_request({ method: "loadKeyboardSettings" }, function (response) {
                    virtualKeyboardChromeExtensionTouchEvents = response.touchEvents;
                    if (virtualKeyboardChromeExtensionTouchEvents == undefined) { virtualKeyboardChromeExtensionTouchEvents = "false"; }
                    init_virtualKeyboardChromeExtension(true);
                });
            }
        }
    }
    if (virtualKeyboardChromeExtensionTouchEvents != undefined) {
        var nodes = getAllChildNodes(document, true)
        for (let e of nodes) {
            virtualKeyboardChrome_bind_node(e);
        }

        if (firstTime) {
            if (top == self) {
                var v = vk_el("virtualKeyboardChromeExtension");
                v.onclick = function (ent) {
                    ent.preventDefault();
                };
                if (virtualKeyboardChromeExtensionTouchEvents == "true") {
                    v.ontouchstart = function (ent) {
                        ent.preventDefault();
                    };
                    v.ontouchend = function (ent) {
                        ent.preventDefault();
                    };

                }
                v.onmousedown = function (ent) {
                    ent.preventDefault();
                };
                v.onmouseup = function (ent) {
                    ent.preventDefault();
                };
                // Menus (layouts, settings, accents) sit outside the keyboard element; pressing them must
                // not take focus from the field either, or the keyboard closes on a layout change.
                var overlays = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
                for (var oi = 0; oi < overlays.length; oi++) {
                    overlays[oi].onmousedown = virtualKeyboardChrome_prevent;
                }
            }
            var e = document.getElementsByClassName("kbdClick");
            for (var i = 0; i < e.length; i++) {
                if (!vk_isBound(e[i])) {
                    vk_markBound(e[i]);
                    e[i].addEventListener("pointerdown", vk_evt_key_repeat_start, false);
                    e[i].addEventListener("pointerup", vk_stop_key_repeat, false);
                    e[i].addEventListener("pointercancel", vk_stop_key_repeat, false);
                    e[i].addEventListener("pointerleave", vk_stop_key_repeat, false);
                    e[i].onclick = function (ent) {
                        var k = this.getAttribute("_key");
                        if (virtualKeyboardChromeExtensionShift) {
                            if (this.getAttribute("_keyC") != undefined) {
                                k = this.getAttribute("_keyC");
                            }
                        }
                        virtualKeyboardChromeExtension_click(k);
                        virtualKeyboardChrome_prevent(ent);
                    };
                    if (virtualKeyboardChromeExtensionTouchEvents == "true") {
                        e[i].ontouchstart = function (ent) {
                            var k = this.getAttribute("_key");
                            if (virtualKeyboardChromeExtensionShift) {
                                if (this.getAttribute("_keyC") != undefined) {
                                    k = this.getAttribute("_keyC");
                                }
                            }
                            virtualKeyboardChromeExtension_click(k);
                            virtualKeyboardChrome_prevent(ent);
                        };
			// Do not clear iterval during touchmove
                        e[i].ontouchmove = function (ent) {
                            virtualKeyboardChrome_prevent(ent);
                        };
			// Clear interval on touchend – otherwise char repetition will continue forever
                        e[i].ontouchend = function (ent) {
                            clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
                            virtualKeyboardChrome_prevent(ent);
                        };
                    } else {
                        e[i].onmousedown = function (ent) {
                            ent.preventDefault();
                            ent.stopPropagation();
                        };
                        e[i].onmousemove = function (ent) {
                            ent.preventDefault();
                            ent.stopPropagation();
                        };
                        e[i].onmouseup = function (ent) {
                            ent.preventDefault();
                        };
                        e[i].addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
                        e[i].addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
                    }
                }
            }
            if (top == self) {
                var m = document.getElementsByClassName("kMenu");
                for (var i = 0; i < m.length; i++) {
                    m[i].onpointerdown = function (ent) {
                        var entObj = ent;
                        // Let the press slide onto a menu item and release there.
                        if (this.hasPointerCapture(ent.pointerId)) {
                            this.releasePointerCapture(ent.pointerId);
                        }
                        virtualKeyboardChromeExtensionClickedMenuBtn = false;
                        // Menus such as settings stay open after the tap that opens them; press-and-hold
                        // accent menus (_hoverOnly) close when the press ends.
                        virtualKeyboardChromeExtensionMenuSticky = this.getAttribute("_hoverOnly") != "true";
                        if (virtualKeyboardChromeExtensionOffsetTimeout) {
                            clearTimeout(virtualKeyboardChromeExtensionOffsetTimeout);
                            var m2 = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
                            for (var i = 0; i < m2.length; i++) {
                                m2[i].setAttribute("_state", "closed");
                                m2[i].style.display = "none";
                            }
                        }
                        if (vk_el("virtualKeyboardChromeExtensionOverlay" + this.getAttribute("_menu")) == null) {
                            return;
                        }
                        var menu = vk_el("virtualKeyboardChromeExtensionOverlay" + this.getAttribute("_menu"));
                        menu.style.display = "";
                        virtualKeyboardChromeExtension_placeMenu(menu, entObj.clientX, entObj.clientY);
                        menu.setAttribute("_state", "open");
                    };
                    m[i].onpointerup = function (ent) {
                        if (this.getAttribute("_hoverOnly") != "true") {
                            return;
                        }
                        {
                            var m2 = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
                            for (var i = 0; i < m2.length; i++) {
                                m2[i].setAttribute("_state", "closed");
                            }
                            var virtualKeyboardChromeExtensionOffsetTimeout = setTimeout(function () {
                                for (var i = 0; i < m2.length; i++) {
                                    m2[i].style.display = "none";
                                }
                            }, 500);
                        }
                        virtualKeyboardChromeExtensionClickedMenuBtn = false;
                    };
                }
                if (vk_el("settingsButton") !== null) {
                    vk_request({ method: "getLocalStorage", key: "keyboardLayoutsList" }, function (response) {
                        var a = (response.data != undefined) ? JSON.parse(response.data) : [];
                        var ul = vk_el("virtualKeyboardChromeExtensionOverlaySettingsUl");
                        vk_el("settingsButton").style.display = "";
                        ul.innerHTML = "";
                        if (a.length > 1) {
                            for (var i = 0; i < a.length; i++) {
                                if (a[i].value != undefined) {
                                    var le = document.createElement("li");
                                    le.textContent = a[i].value.toUpperCase();
                                    le.title = a[i].name;
                                    le.className = "virtualKeyboardChromeExtensionOverlayButton";
                                    if (a[i].value == virtualKeyboardChromeExtensionKeyboardLayout1Setting) {
                                        le.classList.add("current");
                                    }
                                    le.setAttribute("_action", "setKeyboard");
                                    le.setAttribute("_layout", a[i].value);
                                    ul.appendChild(le);
                                }
                            }
                        }
                        var settingsItem = document.createElement("li");
                        settingsItem.textContent = "\u2699 Settings";
                        settingsItem.className = "virtualKeyboardChromeExtensionOverlayButton settingsItem";
                        settingsItem.setAttribute("_action", "openSettings");
                        ul.appendChild(settingsItem);
                        {
                            {
                                var mi = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlayButton");
                                for (var i = 0; i < mi.length; i++) {
                                    mi[i].addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
                                    mi[i].addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
                                    mi[i].onpointerdown = function (ent) {
                                        var mi2 = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlayButton");
                                        for (var i2 = 0; i2 < mi2.length; i2++) {
                                            mi2[i2].setAttribute("mo", "");
                                        }
                                        this.setAttribute("mo", "true");
                                    };
                                    mi[i].onpointerup = function (ent) {
                                        virtualKeyboardChromeExtensionClickedMenuBtn = false;
                                        switch (this.getAttribute("_action")) {
                                        case "setKeyboard":
                                            virtualKeyboardChromeExtensionRequestRefresh = true;
                                            setting_set("keyboardLayout1", this.getAttribute("_layout"));
                                            virtualKeyboardChromeExtensionKeyboardLayout1Setting = this.getAttribute("_layout");
                                            virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "none");
                                            if (virtualKeyboardChromeExtensionClickedElem) {
                                                virtualKeyboardChromeExtension_open(undefined, undefined, true);
                                                virtualKeyboardChromeExtensionClickedElem.focus();
                                            }
                                            break;
                                        case "openSettings":
                                            openSettings();
                                            break;
                                        case "key":
                                            var k = this.getAttribute("_key");
                                            if (virtualKeyboardChromeExtensionShift) {
                                                if (this.getAttribute("_keyC") != undefined) {
                                                    k = this.getAttribute("_keyC");
                                                }
                                            }
                                            virtualKeyboardChromeExtension_click(k);
                                            break;
                                        }
                                    };
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    setTimeout(init_virtualKeyboardChromeExtension_false_iframe, refreshTime);
}

// With "Repeat keys when held" on, holding a character key or Backspace repeats it after a short
// delay, like a physical keyboard. Pointer events cover mouse, touch and pen whichever input mode is set.
var VK_REPEAT_DELAY = 500;
var VK_REPEAT_RATE = 60;

function vk_evt_key_repeat_start(ent) {
    vk_stop_key_repeat();
    var keyElement = this;
    var key = keyElement.getAttribute("_key");
    var isCharacter = (key != null) && (Array.from(key).length == 1);
    if (!virtualKeyboardChromeExtensionRepeatLetters || !((key == "Backspace") || isCharacter)) {
        return;
    }
    virtualKeyboardChromeExtensionBackspaceTimer = setTimeout(function repeat() {
        var k = key;
        if (virtualKeyboardChromeExtensionShift && (keyElement.getAttribute("_keyC") != undefined)) {
            k = keyElement.getAttribute("_keyC");
        }
        virtualKeyboardChromeExtension_click(k, true);
        virtualKeyboardChromeExtensionBackspaceTimer = setTimeout(repeat, VK_REPEAT_RATE);
    }, VK_REPEAT_DELAY);
}

function vk_stop_key_repeat() {
    clearTimeout(virtualKeyboardChromeExtensionBackspaceTimer);
    virtualKeyboardChromeExtensionBackspaceTimer = null;
}

// Opens a keyboard menu centred above the press, kept inside the screen.
function virtualKeyboardChromeExtension_placeMenu(menu, x, y) {
    var margin = 8;
    var width = menu.offsetWidth;
    var left = Math.min(Math.max(x - width / 2, margin), window.innerWidth - width - margin);
    menu.style.left = Math.max(left, margin) + "px";
    menu.style.bottom = ((window.innerHeight - y) + 20) + "px";
    // Not enough room above the press: let the menu scroll rather than run off the top.
    menu.style.maxHeight = Math.max(y - 20 - margin, 120) + "px";
}

function vk_document_mouseup(ent) {
    if (virtualKeyboardChromeExtensionBackspaceTimer != null) {
        clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
    }
    // The release of the tap that opened a sticky menu keeps it open, unless it lands on a menu item.
    var keepMenu = virtualKeyboardChromeExtensionMenuSticky && !((ent != undefined) && (ent.target instanceof Element) && (ent.target.closest(".virtualKeyboardChromeExtensionOverlayButton") != null));
    virtualKeyboardChromeExtensionMenuSticky = false;
    if (!virtualKeyboardChromeExtensionClickedMenuBtn && !keepMenu) {
        var m = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
        for (var i = 0; i < m.length; i++) {
            m[i].setAttribute("_state", "closed");
        }
        virtualKeyboardChromeExtensionOffsetTimeout = setTimeout(function () {
            for (var i = 0; i < m.length; i++) {
                m[i].style.display = "none";
            }
        }, 500);

    }
    virtualKeyboardChromeExtensionClickedMenuBtn = false;
}

// Pointer events cover mouse, touch and pen, so the small keyboard can be dragged
// whether or not the "Use Touch events" setting matches the input device.
function virtualKeyboardChromeExtension_bindDragHandle(handle) {
    if (vk_isBound(handle)) {
        return;
    }
    vk_markBound(handle);
    handle.addEventListener("pointerdown", function (ent) {
        virtualKeyboardChromeExtensionDraggabling = true;
        virtualKeyboardChromeExtensionDraggablingX = ent.clientX - vk_el("virtualKeyboardChromeExtension").offsetLeft;
        virtualKeyboardChromeExtensionDraggablingY = ent.clientY - vk_el("virtualKeyboardChromeExtension").offsetTop;
        handle.setPointerCapture(ent.pointerId);
        virtualKeyboardChrome_prevent(ent);
    }, false);
    handle.addEventListener("pointermove", virtualKeyboardChromeExtension_drag, false);
    handle.addEventListener("pointerup", virtualKeyboardChromeExtension_dragEnd, false);
    handle.addEventListener("pointercancel", virtualKeyboardChromeExtension_dragEnd, false);
}

function virtualKeyboardChromeExtension_dragEnd(ent) {
    if (virtualKeyboardChromeExtensionDraggabling) {
        setting_set("smallKeyboardLeft", vk_el("virtualKeyboardChromeExtension").style.left.toString());
        setting_set("smallKeyboardRight", vk_el("virtualKeyboardChromeExtension").style.right.toString());
        setting_set("smallKeyboardTop", vk_el("virtualKeyboardChromeExtension").style.top.toString());
        setting_set("smallKeyboardBottom", vk_el("virtualKeyboardChromeExtension").style.bottom.toString());
        vk_el("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "");
    }
    virtualKeyboardChromeExtensionDraggabling = false;
}

function virtualKeyboardChromeExtension_drag(ent) {
    if (virtualKeyboardChromeExtensionDraggabling) {
        var clientX = ent.clientX;
        var clientY = ent.clientY;
        var l = clientX - virtualKeyboardChromeExtensionDraggablingX;
        var lper = (l) / window.innerWidth * 100;
        var rper = (100 - ((l + 800) / window.innerWidth * 100));
        var methodLeft = true;
        if (l < 0) { l = 0; }
        if (lper > 50) { methodLeft = false; }
        if (rper < 0) { rper = 0; }
        if (lper < 0) { lper = 0; }
        vk_el("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "none");
        vk_el("virtualKeyboardChromeExtension").style.left = methodLeft ? lper + "%" : "auto";
        vk_el("virtualKeyboardChromeExtension").style.right = methodLeft ? "auto" : rper + "%";

        var t = clientY - virtualKeyboardChromeExtensionDraggablingY;
        var tper = (t) / window.innerHeight * 100;
        var bper = (100 - ((t + 271) / window.innerHeight * 100));
        var methodTop = true;
        if (t < 0) { t = 0; }
        if (tper > 50) { methodTop = false; }
        if (bper < 0) { bper = 0; }
        if (tper < 0) { tper = 0; }
        if (methodTop) {
            vk_el("virtualKeyboardChromeExtension").style.top = tper + "%";
            vk_el("virtualKeyboardChromeExtension").style.bottom = "auto";
        } else {
            vk_el("virtualKeyboardChromeExtension").style.top = "auto";
            vk_el("virtualKeyboardChromeExtension").style.bottom = bper + "%";
        }
        vk_el("virtualKeyboardChromeExtension").style.marginLeft = "0";
    }
}

function init_virtualKeyboardChromeExtension_false() {
    if (!vk_contextValid()) {
        return;
    }
    if (virtualKeyboardChromeExtensionTouchEvents != undefined) {
        var e = document.activeElement;
        if ((e.tagName == "TEXTAREA") || (e.tagName == "INPUT" && ((e.type == "text") || (e.type == "password") || (e.type == "search") || (e.type == "email") || (e.type == "number") || (e.type == "date") || (e.type == "url")))) {
            if (!vk_isBound(e)) {
                e.blur();
                init_virtualKeyboardChromeExtension(false);
                e.focus();
            }
        }
    }
}

function init_virtualKeyboardChromeExtension_false_iframe() {
    init_virtualKeyboardChromeExtension(false);
}


// Finds the <iframe> element hosting a child frame, to position the keyboard next to it.
function virtualKeyboardChromeExtension_findFrame(frameId) {
    for (let e of getAllChildNodes(document, true)) {
        if ((e.nodeName == "IFRAME") || (e.nodeName == "FRAME")) {
            try {
                if (chrome.runtime.getFrameId(e) == frameId) {
                    return e;
                }
            } catch (err) {
                // Frame not yet loaded.
            }
        }
    }
    return null;
}

document.addEventListener("focusin", vk_document_focusin, true);
document.addEventListener("mouseover", vk_document_link_mouseover, true);
document.addEventListener("mouseout", vk_document_link_mouseout, true);

if (top == self) {
    chrome.runtime.onMessage.addListener(function (request) {
        if (request.method == "openFromIframe") {
            virtualKeyboardChromeExtension_generate_onchange();
            clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
            var frame = virtualKeyboardChromeExtension_findFrame(request.frameId);
            // Nested frames can't be matched to an element here; fall back to positioning against the page.
            virtualKeyboardChromeExtensionClickedElem = frame || document.body;
            virtualKeyboardChromeExtensionClickedElem.setAttribute("_originalType", request.inputType || "");
            virtualKeyboardChromeExtensionElemType = "frame";
            virtualKeyboardChromeExtensionRemoteFrameId = request.frameId;
            virtualKeyboardChromeExtensionRemoteElemType = request.elemType;
            virtualKeyboardChromeExtension_inputTypesRender();
            var pX = request.posX;
            var pY = request.posY;
            // The frame reports viewport coordinates inside itself; convert them to this page's viewport.
            if ((frame != null) && (pY != undefined)) {
                pY += frame.getBoundingClientRect().top;
                pX += frame.getBoundingClientRect().left;
            }
            virtualKeyboardChromeExtension_open(pY, pX, request.force);
        } else if (request.method == "clickFromIframe") {
            virtualKeyboardChromeExtension_click(request.key, request.skip);
        } else if (request == "openUrlBar") {
            setTimeout(function () {
                vk_el("virtualKeyboardChromeExtensionUrlBarTextBox").focus();
            }, 200);
        } else if (request == "closeKeyboard") {
            setting_reloadKeyboardToggle(false);
            virtualKeyboardChromeExtension_click('Close');
        } else if (request == "openKeyboard") {
            setting_reloadKeyboardToggle(true);
        }
    });

    var link = document.createElement("link");
    link.href = chrome.runtime.getURL("style.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    vk_loadKeyboard();
    vk_intervals.push(setInterval(init_virtualKeyboardChromeExtension_false, 500));
} else {
    // Keys typed on the keyboard in the top frame arrive here for the field focused in this frame.
    chrome.runtime.onMessage.addListener(function (request) {
        if ((request.method == "keyToFrame") && (virtualKeyboardChromeExtensionClickedElem != null)) {
            virtualKeyboardChromeExtension_editElement(virtualKeyboardChromeExtensionClickedElem, virtualKeyboardChromeExtensionElemType, request.key);
        }
    });
    vk_request({ method: "initLoadKeyboardSettings" }, function (response) {
        vk_applyHoverSettings(response);
    });
    init_virtualKeyboardChromeExtension(true);
    vk_intervals.push(setInterval(init_virtualKeyboardChromeExtension_false_iframe, 15000));
}

function vk_loadKeyboard() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.runtime.getURL("keyboard.html"), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            vk_ajax_load_main(xhr.responseText);
        }
    };
    xhr.send();
}

function vk_ajax_load_main(keyboardHtml) {
    {
        virtualKeyboardChromeExtensionKeyboardElement = document.createElement("div");
        vk_request({ method: "initLoadKeyboardSettings" }, function (response) {
            //hardwareAcceleration
            if (response.hardwareAcceleration == "false") {
                hardwareAcceleration = false;
            } else {
                hardwareAcceleration = true;
                virtualKeyboardChromeExtensionKeyboardElement.className = "ha";
            }

            virtualKeyboardChromeExtensionRepeatLetters = response.repeatLetters != "false";

            // zoomLevel
            if (response.zoomLevel == undefined) { response.zoomLevel = 0; }
            if (parseFloat(response.zoomLevel) >= 0.3) {
                vk_el("virtualKeyboardChromeExtension").style.setProperty("zoom", response.zoomLevel);
            } else {
                vk_el("virtualKeyboardChromeExtension").style.zoom = "";
            }

            // autoTrigger
            if (response.autoTrigger != undefined) {
                autoTrigger = response.autoTrigger == "true";
            }

            // refreshTime
            if (response.refreshTime == undefined) { response.refreshTime = 500; }
            refreshTime = response.refreshTime;

            // autoTriggerLinks
            if (response.autoTriggerLinks != undefined) {
                autoTriggerLinks = response.autoTriggerLinks == "true";
            }

            // intelligentScroll
            if (response.intelligentScroll != undefined) {
                intelligentScroll = response.intelligentScroll == "true";
            }

            // autoTriggerAfter
            if (response.autoTriggerAfter == undefined) { response.autoTriggerAfter = 1; }
            autoTriggerAfter = response.autoTriggerAfter * 1000;
        });
        virtualKeyboardChromeExtensionKeyboardElement.innerHTML = keyboardHtml;
        document.body.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
        init_virtualKeyboardChromeExtension(true);
    }
}
