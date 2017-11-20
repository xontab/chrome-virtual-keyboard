var virtualKeyboardChromeExtensionClickedElem = null;
var virtualKeyboardChromeExtensionElemType = "input";
var virtualKeyboardChromeExtensionPagePadding = false;
var virtualKeyboardChromeExtensionState = false;
var virtualKeyboardChromeExtensionStateLastPos = 0;
var virtualKeyboardChromeExtensionStateNewPos = 0;
var virtualKeyboardChromeExtensionShift = false;
var virtualKeyboardChromeExtensionFormat = false;
var virtualKeyboardChromeExtensionClickedYPos = undefined;
var virtualKeyboardChromeExtensionClickedXPos = undefined;
var virtualKeyboardChromeExtensionClickedMenuBtn = false;
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

var hardwareAcceleration = true;
var autoTrigger = false;
var intelligentScroll = true;
var autoTriggerLinks = false;
var autoTriggerAfter = 1;
var lastHovered = null;
var lastHoveredTO = null;
var iframeElemSent = 0;
var refreshTime = 1000;

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

function virtualKeyboardChromeExtension_make_object_visible() {
	if (virtualKeyboardChromeExtensionClickedElem != null) {
		Element.prototype.documentOffsetTop = function () {
			return this.offsetTop + (this.offsetParent ? (this.offsetParent.documentOffsetTop ? this.offsetParent.documentOffsetTop() : 0) : 0);
		};
		if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
			var top = 0;
			if (top == self)
				top = virtualKeyboardChromeExtensionClickedElem.documentOffsetTop() - (window.innerHeight / 3);
			virtualKeyboardChromeExtensionStateNewPos = top;
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
	delete keys;
}

function virtualKeyboardChromeExtension_fireEvent(eventType, keyCodeArg = 0, charCodeArgs = 0) {
	var keyboardEvent = document.createEvent("KeyboardEvent");
	var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
	keyboardEvent[initMethod](
		eventType,
		true, // bubbles
		true, // cancelable
		window,
		false, // ctrlKeyArg
		false, // altKeyArg
		false, // shiftKeyArg
		false, // metaKeyArg
		keyCodeArg,
		charCodeArgs
	);
	return keyboardEvent;
}

function virtualKeyboardChromeExtension_backspace(eventType) {
	var keyboardEvent = document.createEvent("Events");
	keyboardEvent.initEvent(eventType, true, true);
	keyboardEvent.keyCode = keyboardEvent.which = 8; // Backspace
	return keyboardEvent;
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
	if (top != self) {
		chrome.extension.sendRequest({ method: "clickFromIframe", key: key, skip: skip, frame: this.frameElement.id });
	} else {
		if (key != "Close") {
			if (skip == undefined) { skip = false; }
			if (!skip) {
				if (virtualKeyboardChromeExtensionClickedElem != null) {
					virtualKeyboardChromeExtensionClickedElem.focus();
				}
				clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
			}
		}
		switch (key) {
			case "empty":
				break;
			case "Url":
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").focus();
				break;
			case "Settings":
				window.open(chrome.extension.getURL("options.html"));
				break;
			case '&123':
				virtualKeyboardChromeExtensionFormat = !virtualKeyboardChromeExtensionFormat;
				document.getElementById('virtualKeyboardChromeExtensionMainKbd').style.display = virtualKeyboardChromeExtensionFormat ? "none" : "";
				document.getElementById('virtualKeyboardChromeExtensionMainNumbers').style.display = virtualKeyboardChromeExtensionFormat ? "" : "none";
				break;
			case 'Close':
				if (virtualKeyboardChromeExtensionState) {
					virtualKeyboardChromeExtensionState = false;
					if (virtualKeyboardChromeExtensionFullScreenState) {
						if (hardwareAcceleration) {
							document.getElementById('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,450px,0)");
						} else {
							document.getElementById('virtualKeyboardChromeExtension').style.bottom = "-450px";
						}
					}
					document.getElementById('virtualKeyboardChromeExtension').style.opacity = "0";
					document.getElementById('virtualKeyboardChromeExtension').setAttribute("_state", "closed");
					setTimeout(function () {
						if (virtualKeyboardChromeExtensionState == false) {
							document.getElementById('virtualKeyboardChromeExtension').style.display = "none";
						}
					}, 500);
					if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
						var scrollYAmount = document.body.scrollTop;
						if ((scrollYAmount <= virtualKeyboardChromeExtensionStateNewPos + 50) && (scrollYAmount >= virtualKeyboardChromeExtensionStateNewPos - 50)) {
							document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.display = "none";
							if (virtualKeyboardChromeExtensionPagePadding) {
								document.body.style.marginBottom = "";
							}
							window.scroll(0, virtualKeyboardChromeExtensionStateLastPos);
						}
					}
				}
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "close");
				setTimeout(function () {
					if (virtualKeyboardChromeExtensionState == false) {
						document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.display = "none";
					}
				}, 200);
				break;
			case 'Enter':
				if (virtualKeyboardChromeExtensionClickedElem != null) {
					if (virtualKeyboardChromeExtensionElemType == "textarea") {
						var pos = virtualKeyboardChromeExtensionClickedElem.selectionStart;
						var posEnd = virtualKeyboardChromeExtensionClickedElem.selectionEnd;
						virtualKeyboardChromeExtensionClickedElem.value = virtualKeyboardChromeExtensionClickedElem.value.substr(0, pos) + "\n" + virtualKeyboardChromeExtensionClickedElem.value.substr(posEnd);
						virtualKeyboardChromeExtensionClickedElem.selectionStart = pos + 1;
						virtualKeyboardChromeExtensionClickedElem.selectionEnd = pos + 1;
					} else {
						var form = virtualKeyboardChromeExtension_getParentByTagName(virtualKeyboardChromeExtensionClickedElem, "form");
						if (form != null) {
							var c = virtualKeyboardChromeExtension_submit_buttons(form);
							if (c <= 0) {
								c = virtualKeyboardChromeExtension_submit_buttons(form, "button");
							}
							if (c <= 0) {
								form.dispatchEvent(virtualKeyboardChromeExtension_fireEvent("submit"));
							}
						}
						virtualKeyboardChromeExtension_dispatch_event();
						delete form;
						virtualKeyboardChromeExtensionClickedElem.dispatchEvent(virtualKeyboardChromeExtension_fireEvent("keydown", 13));
						virtualKeyboardChromeExtensionState = false;
						if (virtualKeyboardChromeExtensionFullScreenState) {
							if (hardwareAcceleration) {
								document.getElementById('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,450px,0)");
							} else {
								document.getElementById('virtualKeyboardChromeExtension').style.bottom = "-450px";
							}
						}
						document.getElementById('virtualKeyboardChromeExtension').style.opacity = "0";
						document.getElementById('virtualKeyboardChromeExtension').setAttribute("_state", "closed");
						setTimeout(function () { document.getElementById('virtualKeyboardChromeExtension').style.display = "none"; }, 500);
						if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
							var scrollYAmount = document.body.scrollTop;
							if ((scrollYAmount <= virtualKeyboardChromeExtensionStateNewPos + 50) && (scrollYAmount >= virtualKeyboardChromeExtensionStateNewPos - 50)) {
								document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.display = "none";
								if (virtualKeyboardChromeExtensionPagePadding) {
									document.body.style.marginBottom = "";
								}
								window.scroll(0, virtualKeyboardChromeExtensionStateLastPos);
							}
						}
					}
					virtualKeyboardChromeExtension_generate_onchange();
				}
				break;
			case 'Shift':
				virtualKeyboardChromeExtensionShift = !virtualKeyboardChromeExtensionShift;
				document.getElementById("virtualKeyboardChromeExtensionMainKbd").className = virtualKeyboardChromeExtensionShift ? "Shift" : "";
				virtualKeyboardChromeExtension_shiftButtonKeys();
				break;
			case 'Backspace':
				var pos = virtualKeyboardChromeExtensionClickedElem.selectionStart;
				var posEnd = virtualKeyboardChromeExtensionClickedElem.selectionEnd;
				if (posEnd == pos) {
					pos = pos - 1;
				}
				virtualKeyboardChromeExtensionClickedElem.value = virtualKeyboardChromeExtensionClickedElem.value.substr(0, pos) + virtualKeyboardChromeExtensionClickedElem.value.substr(posEnd);
				virtualKeyboardChromeExtensionClickedElem.selectionStart = pos;
				virtualKeyboardChromeExtensionClickedElem.selectionEnd = pos;
				virtualKeyboardChromeExtensionElemChanged = true;
				virtualKeyboardChromeExtensionClickedElem.dispatchEvent(virtualKeyboardChromeExtension_backspace("keydown"));
				virtualKeyboardChromeExtensionClickedElem.dispatchEvent(virtualKeyboardChromeExtension_backspace("keypress"));
				virtualKeyboardChromeExtensionClickedElem.dispatchEvent(virtualKeyboardChromeExtension_backspace("keyup"));
				virtualKeyboardChromeExtension_dispatch_event();
				break;
			default:
				if (virtualKeyboardChromeExtensionClickedElem != undefined) {
					var maxLength = 0;
					if (virtualKeyboardChromeExtensionClickedElem.maxLength > 0) {
						maxLength = virtualKeyboardChromeExtensionClickedElem.maxLength;
					}
					if ((maxLength <= 0) || (virtualKeyboardChromeExtensionClickedElem.value.length < maxLength)) {
						virtualKeyboardChromeExtensionClickedElem.dispatchEvent(virtualKeyboardChromeExtension_fireEvent("keydown", key.charCodeAt(0)));
						var pos = virtualKeyboardChromeExtensionClickedElem.selectionStart;
						var posEnd = virtualKeyboardChromeExtensionClickedElem.selectionEnd;
						if (virtualKeyboardChromeExtensionShift) {
							if ((key.charCodeAt(0) >= 97) && (key.charCodeAt(0) <= 122)) {
								key = String.fromCharCode(key.charCodeAt(0) - 32);
							}
							if ((key.charCodeAt(0) >= 224) && (key.charCodeAt(0) <= 252)) {
								key = String.fromCharCode(key.charCodeAt(0) - 32);
							}
							// 'Å±' and 'Å‘'
							if ((key.charCodeAt(0) == 337) || (key.charCodeAt(0) == 369)) {
								key = String.fromCharCode(key.charCodeAt(0) - 1);
							}
						}
						virtualKeyboardChromeExtensionClickedElem.value = virtualKeyboardChromeExtensionClickedElem.value.substr(0, pos) + key + virtualKeyboardChromeExtensionClickedElem.value.substr(posEnd);
						virtualKeyboardChromeExtensionClickedElem.selectionStart = pos + 1;
						virtualKeyboardChromeExtensionClickedElem.selectionEnd = pos + 1;
						virtualKeyboardChromeExtensionElemChanged = true;
						if ((virtualKeyboardChromeExtensionShift) && (virtualKeyboardChromeExtensionShiftBehaviour)) {
							virtualKeyboardChromeExtensionShift = !virtualKeyboardChromeExtensionShift;
							document.getElementById("virtualKeyboardChromeExtensionMainKbd").className = virtualKeyboardChromeExtensionShift ? "Shift" : "";
							virtualKeyboardChromeExtension_shiftButtonKeys();
						}
						virtualKeyboardChromeExtensionDraggabling = false;
						virtualKeyboardChromeExtensionClickedElem.dispatchEvent(virtualKeyboardChromeExtension_fireEvent("keypress", 0, key.charCodeAt(0)));
						virtualKeyboardChromeExtensionClickedElem.dispatchEvent(virtualKeyboardChromeExtension_fireEvent("keyup", 0, key.charCodeAt(0)));
						virtualKeyboardChromeExtension_dispatch_event();

						virtualKeyboardChromeExtensionClickedElem.dispatchEvent(new InputEvent("input", {inputType: "insertText"}));
					}
				}
				break;
		}
	}
}


function setting_load(key, callback) {
	chrome.extension.sendRequest({ method: "getLocalStorage", key: key }, function (response) {
		eval(callback)(response.data);
	});
}

function setting_reloadKeyboardToggle(openState) {
	chrome.extension.sendRequest({ method: "getLocalStorage", key: "keyboardEnabled" }, function (response) {
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
	chrome.extension.sendRequest({ method: "setLocalStorage", key: key, value: value }, function (response) { });
}

function openUrl(url) {
	chrome.extension.sendRequest({ method: "createTab", url: url }, function (response) { });
}

function virtualKeyboardChromeExtension_getElementPosition(obj, type) {
	var cur = 0;
	if (obj && obj.offsetParent) {
		do {
			cur += obj[type];
		} while (obj = obj.offsetParent);
	}
	return cur;
}

function virtualKeyboardChromeExtension_getElementPositionY(obj) {
	return virtualKeyboardChromeExtension_getElementPosition(obj, 'offsetTop');
}

function virtualKeyboardChromeExtension_getElementPositionX(obj) {
	return virtualKeyboardChromeExtension_getElementPosition(obj, 'offsetLeft');
}

function virtualKeyboardChromeExtension_open_part2(pos) {
	var windowScrollTop = document.body.scrollTop;
	if (virtualKeyboardChromeExtensionCloseTimer != null) {
		clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
	}
	virtualKeyboardChromeExtensionStateLastPos = document.body.scrollTop;
	if (virtualKeyboardChromeExtensionFullScreenState) {
		if (((document.body.style.marginBottom == "") && (!virtualKeyboardChromeExtensionPagePadding)) || (virtualKeyboardChromeExtensionPagePadding)) {
			document.body.style.marginBottom = document.getElementById("virtualKeyboardChromeExtension").offsetHeight + "px";
			virtualKeyboardChromeExtensionPagePadding = true;
		}
		virtualKeyboardChromeExtension_make_object_visible();
	}
	virtualKeyboardChromeExtensionState = true;
	document.getElementById('virtualKeyboardChromeExtension').style.display = "";
	chrome.extension.sendRequest({ method: "getSmallKeyboardCoords" }, function (response) {
		if (response.smallKeyboard == "true") {
			if (hardwareAcceleration) {
				document.getElementById('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,0,0)");
			}
			document.getElementById('virtualKeyboardChromeExtension').style.top = response.smallKeyboardTop != undefined ? response.smallKeyboardTop : "auto";
			document.getElementById('virtualKeyboardChromeExtension').style.bottom = response.smallKeyboardBottom != undefined ? response.smallKeyboardBottom : "0";
			document.getElementById('virtualKeyboardChromeExtension').style.right = response.smallKeyboardRight != undefined ? response.smallKeyboardRight : "0";
			document.getElementById('virtualKeyboardChromeExtension').style.left = response.smallKeyboardLeft != undefined ? response.smallKeyboardLeft : "auto";
			document.getElementById("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "opacity 0.3s");
		} else {
			document.getElementById('virtualKeyboardChromeExtension').style.top = "";
			document.getElementById('virtualKeyboardChromeExtension').style.left = "";
			document.getElementById('virtualKeyboardChromeExtension').style.right = "";
			if (hardwareAcceleration) {
				document.getElementById('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,0,0)");
			} else {
				document.getElementById('virtualKeyboardChromeExtension').style.bottom = "0px";
			}
			document.getElementById("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "");
		}
		document.getElementById('virtualKeyboardChromeExtension').style.display = "";
		document.getElementById('virtualKeyboardChromeExtension').style.opacity = "1";
	});
	document.getElementById('virtualKeyboardChromeExtension').setAttribute("_state", "open");
	var virtualKeyboardChromeExtension_style = window.getComputedStyle(document.getElementById('virtualKeyboardChromeExtension'));
	var current_height = parseFloat(virtualKeyboardChromeExtension_style.height) + parseFloat(virtualKeyboardChromeExtension_style.paddingTop) + parseFloat(virtualKeyboardChromeExtension_style.paddingBottom);
	var current_zoom = parseFloat(virtualKeyboardChromeExtension_style.zoom);
	if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
		document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.height = (current_height * current_zoom) + "px";
		document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.display = "block";
		virtualKeyboardChromeExtension_make_object_visible();
	}
	if (intelligentScroll) {
		if (pos == undefined) { pos = virtualKeyboardChromeExtension_getElementPositionY(virtualKeyboardChromeExtensionClickedElem); }
		var availCanvasHeight = window.innerHeight - document.getElementById("virtualKeyboardChromeExtension").offsetHeight;
		var elemHeight = virtualKeyboardChromeExtensionClickedElem.offsetHeight;
		if ((pos + elemHeight) > availCanvasHeight) {
			if (virtualKeyboardChromeExtensionFullScreenState) {
				pos = (pos) - (availCanvasHeight / 2) - (elemHeight / 2);
				virtualKeyboardChromeExtensionStateNewPos = windowScrollTop + pos;
				window.scroll(0, virtualKeyboardChromeExtensionStateNewPos);
			}
		}
		virtualKeyboardChromeExtensionClickedYPos = undefined;
	}
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
	document.getElementById("virtualKeyboardChromeExtensionMainNumbers").style.display = "none";
	document.getElementById("virtualKeyboardChromeExtensionNumberBarKbdInput").style.display = "none";
	document.getElementById("virtualKeyboardChromeExtensionMainKbd").style.display = "";
	virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "none");
	if (virtualKeyboardChromeExtensionElemType != "textarea") {
		if ((virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "number")
			|| (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "tel")) {
			document.getElementById("virtualKeyboardChromeExtensionNumberBarKbdInput").style.display = "";
			document.getElementById("virtualKeyboardChromeExtensionMainKbd").style.display = "none";
		} else if (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "email") {
			virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "");
		}
	}
}

function virtualKeyboardChromeExtension_open(posY, posX, force) {
	if (top != self) {
		if (virtualKeyboardChromeExtensionClickedElem.id == "") {
			virtualKeyboardChromeExtensionClickedElem.id = "CVK_E_" + iframeElemSent;
			iframeElemSent++;
		}
		chrome.extension.sendRequest({ method: "openFromIframe", posY: posY, posX: posX, force: force, frame: this.frameElement.id, elem: virtualKeyboardChromeExtensionClickedElem.id });
	} else {
		if (document.webkitFullscreenElement) {
			document.webkitFullscreenElement.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
		} else {
			document.body.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
		}
		if ((virtualKeyboardChromeExtensionKeyboardEnabled == "demand") && (force == undefined) && (virtualKeyboardChromeExtensionClickedElem.id != "virtualKeyboardChromeExtensionUrlBarTextBox")) {
			virtualKeyboardChromeExtensionClickedElemDemand = virtualKeyboardChromeExtensionClickedElem;
			if (posX == undefined) { posX = virtualKeyboardChromeExtension_getElementPositionX(virtualKeyboardChromeExtensionClickedElem); }
			if (posY == undefined) { posY = virtualKeyboardChromeExtension_getElementPositionY(virtualKeyboardChromeExtensionClickedElem); }
			posX = posX + document.body.scrollLeft;
			posY = posY + document.body.scrollTop;
			document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.display = "block";
			document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.top = posY + "px";
			document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.left = posX + "px";
			setTimeout(function () {
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "open");
			}, 50);

		} else if (virtualKeyboardChromeExtensionKeyboardEnabled != "false") {
			if (virtualKeyboardChromeExtensionKeyboardLayout1Setting == undefined) { virtualKeyboardChromeExtensionKeyboardLayout1Setting = "en"; }
			if (virtualKeyboardChromeExtensionKeyboardLoaded1 != virtualKeyboardChromeExtensionKeyboardLayout1Setting) {
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function () {
					if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
						var data2 = xmlhttp.responseText;
						document.getElementById("virtualKeyboardChromeExtensionMainKbdPH").innerHTML = data2;
						init_virtualKeyboardChromeExtension(true);
						virtualKeyboardChromeExtension_inputTypesRender();
						virtualKeyboardChromeExtension_open_part2(posY);
						delete data2;
					}
				}
				xmlhttp.open("GET", chrome.extension.getURL("layouts/keyboard_" + virtualKeyboardChromeExtensionKeyboardLayout1Setting + ".html"), true);
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
	virtualKeyboardChromeExtensionClickedElem.type = virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType");
	virtualKeyboardChromeExtensionClickedElem = undefined;
	virtualKeyboardChromeExtensionCloseTimer = setTimeout(function () {
		virtualKeyboardChromeExtension_click('Close');
	}, 1000);
}

function vk_evt_input_event(element, isFocus = false, elementType = "input") {
	if ((element.disabled == true) || (element.readOnly == true)) {
		return;
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

function vk_evt_input_mousedown(ent) {
	const evt = virtualKeyboardChromeExtensionTouchEvents == "true" ? ent.touches[0] : window.event;
	virtualKeyboardChromeExtensionClickedYPos = evt.clientY;
	virtualKeyboardChromeExtensionClickedXPos = evt.clientX;
}

function vt_evt_autoTrigger_mover_timeout(elem) {
	lastHoveredTO = setTimeout(function () {
		if (lastHovered == elem) {
			elem.focus();
			elem.click();
			elem.className += " active";
			setTimeout(function () {
				elem.className = elem.className.replace(" active", "");
			}, 200);
			if (autoTriggerAfter >= 0.5) {
				vt_evt_autoTrigger_mover_timeout(lastHovered);
			}
		}
	}, autoTriggerAfter);
}

function vt_evt_autoTrigger_mover(ent) {
	lastHovered = this;
	clearTimeout(lastHoveredTO);
	vt_evt_autoTrigger_mover_timeout(this);
}

function vt_evt_autoTrigger_mover_a(ent) {
	lastHovered = this;
	clearTimeout(lastHoveredTO);
	var elem = this;
	lastHoveredTO = setTimeout(function () {
		if (lastHovered == elem) {
			var mouseEvent = document.createEvent("MouseEvent");
			mouseEvent.initMouseEvent("click", true, true, window,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			lastHovered.dispatchEvent(mouseEvent);
		}
		lastHovered = null;
		clearTimeout(lastHoveredTO);
	}, autoTriggerAfter);
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

function virtualKeyboardChrome_bind_input(e, autoTrigger, focusCallback, clickCallback) {
	if (e.getAttribute("_vkEnabled") == undefined) {
		e.addEventListener("blur", vk_evt_input_blur, false);
		e.addEventListener(virtualKeyboardChromeExtensionTouchEvents == "true" ? "touchstart" : "mousedown", vk_evt_input_mousedown, false);
		e.addEventListener("focus", focusCallback, false);
		e.addEventListener("click", clickCallback, false);
		if (autoTrigger) {
			e.addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
			e.addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
		}
		e.setAttribute("_vkEnabled", "true");
	}
}

function xk_settings_load_main(response) {
	if (response.openedFirstTime == undefined) {
		openUrl(chrome.extension.getURL("options.html"));
		setting_set("openedFirstTime", "true");
	}
	document.getElementById('virtualKeyboardChromeExtension').className = response.smallKeyboard == "true" ? "modeS" : "";
	virtualKeyboardChromeExtensionFullScreenState = response.smallKeyboard != "true";
	virtualKeyboardChromeExtensionShiftBehaviour = response.capsLock == "false";
	virtualKeyboardChromeExtensionTouchEvents = response.touchEvents;
	if (virtualKeyboardChromeExtensionTouchEvents == undefined) { virtualKeyboardChromeExtensionTouchEvents = "false"; }

	document.addEventListener(virtualKeyboardChromeExtensionTouchEvents == "true" ? "touchend" : "mouseup", vk_document_mouseup, false);
	document.addEventListener(virtualKeyboardChromeExtensionTouchEvents == "true" ? "touchmove" : "mousemove", vk_document_mousemove, false);

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
	if (firstTime) {
		if (top == self) {
			if (virtualKeyboardChromeExtensionTouchEvents == undefined) {
				if ((document.getElementById('virtualKeyboardChromeExtension').getAttribute("_state") != "open") || (virtualKeyboardChromeExtensionRequestRefresh)) {
					chrome.extension.sendRequest({ method: "loadKeyboardSettings" }, xk_settings_load_main);
				}
			} else {
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").onblur = function () {
					document.getElementById('virtualKeyboardChromeExtensionUrlBar').style.top = "-100px";
					if (document.getElementById("urlButton") != undefined) {
						document.getElementById("urlButton").setAttribute("highlight", "");
					}
					virtualKeyboardChromeExtension_generate_onchange();
					virtualKeyboardChromeExtensionClickedElem = undefined;
					virtualKeyboardChromeExtensionCloseTimer = setTimeout(function () {
						virtualKeyboardChromeExtension_click('Close');
					}, 1000);
				}
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").onfocus = function (evt) {
					if (virtualKeyboardChromeExtensionCloseTimer != undefined) { clearTimeout(virtualKeyboardChromeExtensionCloseTimer); }
					virtualKeyboardChromeExtensionElemType = "input";
					virtualKeyboardChromeExtensionClickedElem = document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox");
					document.getElementById('virtualKeyboardChromeExtensionUrlBar').style.top = "0px";
					if (document.getElementById("urlButton") != undefined) {
						document.getElementById("urlButton").setAttribute("highlight", "true");
					}
					if (!virtualKeyboardChromeExtensionState) {
						virtualKeyboardChromeExtension_open(0, 0, true);
						document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").focus();
						virtualKeyboardChromeExtension_inputTypesRender();
						setTimeout(function () {
							if (document.getElementById("urlButton") != undefined) {
								document.getElementById("urlButton").setAttribute("highlight", "true");
							}
						}, 500);
					}
					evt.preventDefault();
				}
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").addEventListener("click", vk_evt_input_click, false);
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").setAttribute("_vkEnabled", "true");

				if (document.getElementById("urlButton") != undefined) {
					document.getElementById("urlButton").style.display = virtualKeyboardChromeExtensionUrlButton == "true" ? "" : "none";
				}

				if (virtualKeyboardChromeExtensionTouchEvents == "true") {
					document.getElementById("virtualKeyboardChromeExtensionDraggableLeft").ontouchstart = function (ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.touches[0].clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.touches[0].clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}
					document.getElementById("virtualKeyboardChromeExtensionDraggableRight").ontouchstart = function (ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.touches[0].clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.touches[0].clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}
				} else {
					document.getElementById("virtualKeyboardChromeExtensionDraggableLeft").onmousedown = function (ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}
					document.getElementById("virtualKeyboardChromeExtensionDraggableRight").onmousedown = function (ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}
				}


				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").onclick = function (ent) {
					virtualKeyboardChromeExtensionClickedElemDemand.focus();
					virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos, true);
					setTimeout(function () {
						document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "close");
						setTimeout(function () {
							document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.display = "none";
						}, 200);
					}, 100);
					virtualKeyboardChrome_prevent(ent);
				}
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").onmousedown = virtualKeyboardChrome_prevent;
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").onmouseup = virtualKeyboardChrome_prevent;

				if (autoTrigger) {
					document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
					document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
				}
			}
		} else {
			if (virtualKeyboardChromeExtensionTouchEvents == undefined) {
				chrome.extension.sendRequest({ method: "loadKeyboardSettings" }, function (response) {
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
			if (e.nodeName == "INPUT") {
				if ((e.type == "text") || (e.type == "password") || (e.type == "search") || (e.type == "email") || (e.type == "number") || (e.type == "tel") || (e.type == "url")) {
					virtualKeyboardChrome_bind_input(e, autoTrigger, vk_evt_input_focus, vk_evt_input_click);		
				}
			} else if (e.nodeName == "TEXTAREA") {
				virtualKeyboardChrome_bind_input(e, autoTrigger, vt_evt_textarea_focus, vt_evt_textarea_click);
			}
		}
		delete nodes;

		if (autoTriggerLinks) {
			var e = document.getElementsByTagName("a");
			for (var i = 0; i < e.length; i++) {
				if (e[i].getAttribute("_vkEnabled") == undefined) {
					e[i].setAttribute("_vkEnabled", "true");
					e[i].addEventListener("mouseover", vt_evt_autoTrigger_mover_a, false);
					e[i].addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
				}
			}
		}
		
		if (firstTime) {
			if (top == self) {
				var v = document.getElementById("virtualKeyboardChromeExtension");
				v.onclick = function (ent) {
					ent.preventDefault();
				}
				if (virtualKeyboardChromeExtensionTouchEvents == "true") {
					v.ontouchstart = function (ent) {
						ent.preventDefault();
					}
					v.ontouchend = function (ent) {
						ent.preventDefault();
					}

				}
				v.onmousedown = function (ent) {
					ent.preventDefault();
				}
				v.onmouseup = function (ent) {
					ent.preventDefault();
				}
				delete v;
			}
			var e = document.getElementsByClassName("kbdClick");
			for (var i = 0; i < e.length; i++) {
				if (e[i].getAttribute("_vkEnabled") == undefined) {
					e[i].setAttribute("_vkEnabled", "true");
					e[i].onclick = function (ent) {
						var k = this.getAttribute("_key");
						if (virtualKeyboardChromeExtensionShift) {
							if (this.getAttribute("_keyC") != undefined) {
								k = this.getAttribute("_keyC");
							}
						}
						virtualKeyboardChromeExtension_click(k);
						virtualKeyboardChrome_prevent(ent);
					}
					if (virtualKeyboardChromeExtensionTouchEvents == "true") {
						e[i].ontouchstart = function (ent) {
							var k = this.getAttribute("_key");
							if (virtualKeyboardChromeExtensionShift) {
								if (this.getAttribute("_keyC") != undefined) {
									k = this.getAttribute("_keyC");
								}
							}
							virtualKeyboardChromeExtension_click(k);
							var e = this.getAttribute("_key");
							if ((virtualKeyboardChromeExtensionRepeatLetters) || (e == "Backspace")) {
								var virtualKeyboardChromeExtensionBackspaceTimerCount = 0;
								if (virtualKeyboardChromeExtensionBackspaceTimer != null) {
									clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
								}
								virtualKeyboardChromeExtensionBackspaceTimer = setInterval(function () {
									if (virtualKeyboardChromeExtensionBackspaceTimerCount < 30) {
										virtualKeyboardChromeExtensionBackspaceTimerCount++;
									} else {
										virtualKeyboardChromeExtension_click(e, true);
									}
								}, 50);
							}
							virtualKeyboardChrome_prevent(ent)
						}
						e[i].ontouchmove = virtualKeyboardChrome_prevent;
						e[i].ontouchend = virtualKeyboardChrome_prevent;
					} else {
						e[i].onmousedown = function (ent) {
							var e = this.getAttribute("_key");
							if ((virtualKeyboardChromeExtensionRepeatLetters) || (e == "Backspace")) {
								var virtualKeyboardChromeExtensionBackspaceTimerCount = 0;
								if (virtualKeyboardChromeExtensionBackspaceTimer != null) {
									clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
								}
								virtualKeyboardChromeExtensionBackspaceTimer = setInterval(function () {
									if (virtualKeyboardChromeExtensionBackspaceTimerCount < 30) {
										virtualKeyboardChromeExtensionBackspaceTimerCount++;
									} else {
										virtualKeyboardChromeExtension_click(e, true);
									}
								}, 50);
							}
							ent.preventDefault();
							ent.stopPropagation();
						}
						e[i].onmousemove = function (ent) {
							ent.preventDefault();
							ent.stopPropagation();
						}
						e[i].onmouseup = function (ent) {
							ent.preventDefault();
						}
						if (autoTrigger) {
							e[i].addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
							e[i].addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
						}
					}
				}
			}
			delete e;
			if (top == self) {
				var m = document.getElementsByClassName("kMenu");
				var startEvent = virtualKeyboardChromeExtensionTouchEvents == "true" ? "ontouchstart" : "onmousedown";
				var endEvent = virtualKeyboardChromeExtensionTouchEvents == "true" ? "ontouchend" : "onmouseup";
				for (var i = 0; i < m.length; i++) {
					m[i][startEvent] = function (ent) {
						var entObj = virtualKeyboardChromeExtensionTouchEvents == "true" ? ent.touches[0] : window.event;
						virtualKeyboardChromeExtensionClickedMenuBtn = false;
						if (virtualKeyboardChromeExtensionOffsetTimeout) {
							clearTimeout(virtualKeyboardChromeExtensionOffsetTimeout);
							var m2 = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
							for (var i = 0; i < m2.length; i++) {
								m2[i].setAttribute("_state", "closed");
								m2[i].style.display = "none";
							}
						}
						document.getElementById("virtualKeyboardChromeExtensionOverlay" + this.getAttribute("_menu")).style.display = "";
						document.getElementById("virtualKeyboardChromeExtensionOverlay" + this.getAttribute("_menu")).style.left = (entObj.clientX - (document.getElementById("virtualKeyboardChromeExtensionOverlaySettings").offsetWidth / 2)) + "px";
						document.getElementById("virtualKeyboardChromeExtensionOverlay" + this.getAttribute("_menu")).style.bottom = ((window.innerHeight - entObj.clientY) + 20) + "px";
						document.getElementById("virtualKeyboardChromeExtensionOverlay" + this.getAttribute("_menu")).setAttribute("_state", "open");
					}
					m[i][endEvent] = function (ent) {
						var ho = "false";
						if (this.getAttribute("_hoverOnly") != undefined) {
							ho = this.getAttribute("_hoverOnly");
						}
						if (ho != "true") {
							virtualKeyboardChromeExtensionClickedMenuBtn = true;
							ent.preventDefault();
							virtualKeyboardChromeExtensionClickedMenuBtn = false;
						}
						if (!virtualKeyboardChromeExtensionClickedMenuBtn) {
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
						delete ho;
						virtualKeyboardChromeExtensionClickedMenuBtn = false;
					}
				}
				delete m;
				if (document.getElementById("settingsButton") != undefined) {
					chrome.extension.sendRequest({ method: "getLocalStorage", key: "keyboardLayoutsList" }, function (response) {
						var data = response.data;
						document.getElementById("settingsButton").style.display = "none";
						if (data != undefined) {
							var a = JSON.parse(data);
							if (a.length > 1) {
								document.getElementById("settingsButton").style.display = "";
								document.getElementById("virtualKeyboardChromeExtensionOverlaySettingsUl").innerHTML = "";
								for (var i = 0; i < a.length; i++) {
									if (a[i].value != undefined) {
										var le = document.createElement("li");
										le.innerHTML = a[i].value.toUpperCase();
										le.className = "virtualKeyboardChromeExtensionOverlayButton";
										le.setAttribute("_action", "setKeyboard");
										le.setAttribute("_layout", a[i].value);
										delete le;
										document.getElementById("virtualKeyboardChromeExtensionOverlaySettingsUl").appendChild(le);
									}
								}
								var mi = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlayButton");
								for (var i = 0; i < mi.length; i++) {
									var startEvent = virtualKeyboardChromeExtensionTouchEvents == "true" ? "ontouchstart" : "onmousedown";
									var endEvent = virtualKeyboardChromeExtensionTouchEvents == "true" ? "ontouchend" : "onmouseup";
									mi[i][startEvent] = function (ent) {
										var mi2 = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlayButton");
										for (var i2 = 0; i2 < mi2.length; i2++) {
											mi2[i2].setAttribute("mo", "");
										}
										delete mi2;
										this.setAttribute("mo", "true");
									}
									mi[i][endEvent] = function (ent) {
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
												window.open(chrome.extension.getURL("options.html"));
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
									}
								}
								delete mi;
							}
							delete a;
						}
						delete data;
					});
				}
			}
		}
	}
	
	setTimeout(init_virtualKeyboardChromeExtension_false_iframe, refreshTime);
}

function vk_document_mouseup(ent) {
	if (virtualKeyboardChromeExtensionBackspaceTimer != null) {
		clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
	}
	if (!virtualKeyboardChromeExtensionClickedMenuBtn) {
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
	if (virtualKeyboardChromeExtensionDraggabling) {
		setting_set("smallKeyboardLeft", document.getElementById("virtualKeyboardChromeExtension").style.left.toString());
		setting_set("smallKeyboardRight", document.getElementById("virtualKeyboardChromeExtension").style.right.toString());
		setting_set("smallKeyboardTop", document.getElementById("virtualKeyboardChromeExtension").style.top.toString());
		setting_set("smallKeyboardBottom", document.getElementById("virtualKeyboardChromeExtension").style.bottom.toString());
		document.getElementById("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "");
	}
	virtualKeyboardChromeExtensionDraggabling = false;
}

function vk_document_mousemove(ent) {
	if (virtualKeyboardChromeExtensionDraggabling) {
		var clientX = ent.clientX;
		if (clientX == undefined) { clientX = ent.touches[0].clientX; }
		var clientY = ent.clientY;
		if (clientY == undefined) { clientY = ent.touches[0].clientY; }
		var l = clientX - virtualKeyboardChromeExtensionDraggablingX;
		var lper = (l) / window.innerWidth * 100;
		var rper = (100 - ((l + 800) / window.innerWidth * 100));
		var methodLeft = true;
		if (l < 0) { l = 0; }
		if (lper > 50) { methodLeft = false; }
		if (rper < 0) { rper = 0; }
		if (lper < 0) { lper = 0 }
		document.getElementById("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "none");
		document.getElementById("virtualKeyboardChromeExtension").style.left = methodLeft ? lper + "%" : "auto";
		document.getElementById("virtualKeyboardChromeExtension").style.right = methodLeft ? "auto" : rper + "%";

		var t = clientY - virtualKeyboardChromeExtensionDraggablingY;
		var tper = (t) / window.innerHeight * 100;
		var bper = (100 - ((t + 271) / window.innerHeight * 100));
		var methodTop = true;
		if (t < 0) { t = 0; }
		if (tper > 50) { methodTop = false; }
		if (bper < 0) { bper = 0; }
		if (tper < 0) { tper = 0 }
		if (methodTop) {
			document.getElementById("virtualKeyboardChromeExtension").style.top = tper + "%";
			document.getElementById("virtualKeyboardChromeExtension").style.bottom = "auto";
		} else {
			document.getElementById("virtualKeyboardChromeExtension").style.top = "auto";
			document.getElementById("virtualKeyboardChromeExtension").style.bottom = bper + "%";
		}
		document.getElementById("virtualKeyboardChromeExtension").style.marginLeft = "0";
	}
}

function init_virtualKeyboardChromeExtension_false() {
	if (virtualKeyboardChromeExtensionTouchEvents != undefined) {
		var e = document.activeElement;
		if ((e.tagName == "TEXTAREA") || (e.tagName == "INPUT" && ((e.type == "text") || (e.type == "password") || (e.type == "search") || (e.type == "email") || (e.type == "number") || (e.type == "date") || (e.type == "url")))) {
			if (e.getAttribute("_vkEnabled") != "true") {
				e.blur();
				init_virtualKeyboardChromeExtension(false);
				e.focus();
			}
		}
		delete e;
	}
}

function init_virtualKeyboardChromeExtension_false_iframe() {
	init_virtualKeyboardChromeExtension(false);
}


if (top == self) {
	chrome.extension.onRequest.addListener(function (request) {
		if (request.method == "openFromIframe") {
			virtualKeyboardChromeExtension_generate_onchange();
			virtualKeyboardChromeExtensionClickedElem = document.getElementById(request.frame).contentDocument.getElementById(request.elem);
			virtualKeyboardChromeExtension_make_object_visible();
			virtualKeyboardChromeExtensionElemType = virtualKeyboardChromeExtensionClickedElem.tagName.toLowerCase();
			virtualKeyboardChromeExtension_inputTypesRender();
			var pX = request.posX;
			var pY = request.posY;
			pY += virtualKeyboardChromeExtension_getElementPositionY(document.getElementById(request.frame));
			pX += virtualKeyboardChromeExtension_getElementPositionX(document.getElementById(request.frame));
			virtualKeyboardChromeExtension_open(pY, pX, request.force);
		} else if (request.method == "clickFromIframe") {
			virtualKeyboardChromeExtension_click(request.key, request.skip);
		} else if (request == "openUrlBar") {
			setTimeout(function () {
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").focus();
			}, 200);
		} else if (request == "closeKeyboard") {
			setting_reloadKeyboardToggle(false);
			virtualKeyboardChromeExtension_click('Close');
		} else if (request == "openKeyboard") {
			setting_reloadKeyboardToggle(true);
		}
	});
	var iframes = document.getElementsByTagName("iframe");
	for (var i = 0; i < iframes.length; i++) {
		if (iframes[i].id == "") {
			iframes[i].id = "CVK_F_" + i;
		}
	}

	var link = document.createElement("link");
	link.href = chrome.extension.getURL("style.css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
	delete link;

	var xhr = new XMLHttpRequest();
	xhr.open("GET", chrome.extension.getURL("keyboard.html"), true);
	xhr.onreadystatechange = vk_ajax_load_main;
	xhr.send();
} else {
	init_virtualKeyboardChromeExtension(true);
	setInterval(init_virtualKeyboardChromeExtension_false_iframe, 15000);
}

function vk_ajax_load_main() {
	if (xhr.readyState == 4) {
		virtualKeyboardChromeExtensionKeyboardElement = document.createElement("div");
		chrome.extension.sendRequest({ method: "initLoadKeyboardSettings" }, function (response) {
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
				document.getElementById("virtualKeyboardChromeExtension").style.setProperty("zoom", response.zoomLevel);
			} else {
				document.getElementById("virtualKeyboardChromeExtension").style.zoom = "";
			}

			// autoTrigger
			if (response.autoTrigger != undefined) {
				autoTrigger = response.autoTrigger == "true";
			}

         	// refreshTime
		    if (response.refreshTime == undefined) { response.refreshTime = 1000; }
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
		virtualKeyboardChromeExtensionKeyboardElement.innerHTML = xhr.responseText;
		document.body.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
		init_virtualKeyboardChromeExtension(true);
		setInterval(init_virtualKeyboardChromeExtension_false, 500);
		delete xhr;
	}
}
