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
var virtualKeyboardChromeExtensionElemChanged = false;
var virtualKeyboardChromeExtensionShiftBehaviour = true	;
var virtualKeyboardChromeExtensionFullScreenState = true;
var virtualKeyboardChromeExtensionTouchEvents = undefined;
var virtualKeyboardChromeExtensionKeyboardElement = undefined;
var virtualKeyboardChromeExtensionUrlButton = true;
var virtualKeyboardChromeExtensionKeyboardEnabled = true;
var virtualKeyboardChromeExtensionKeyboardLayout1Setting = true;

var hardwareAcceleration = true;
var autoTrigger = false;
var intelligentScroll = true;
var autoTriggerLinks = false;
var autoTriggerAfter = 1;
var lastHovered = null;
var lastHoveredTO = null;

function virtualKeyboardChromeExtension_generate_onchange()
    {
    if (virtualKeyboardChromeExtensionElemChanged==true)
        {
        virtualKeyboardChromeExtensionElemChanged=false;
        if (virtualKeyboardChromeExtensionClickedElem!=null)
            {
            if ("fireEvent" in virtualKeyboardChromeExtensionClickedElem)
                virtualKeyboardChromeExtensionClickedElem.fireEvent("onchange");
            else
                {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                virtualKeyboardChromeExtensionClickedElem.dispatchEvent(evt);
                }
            }
        }
    }
   
function virtualKeyboardChromeExtension_make_object_visible()
{
if (virtualKeyboardChromeExtensionClickedElem!=null)
	{
		Element.prototype.documentOffsetTop = function () {
			return this.offsetTop + ( this.offsetParent ? (this.offsetParent.documentOffsetTop ? this.offsetParent.documentOffsetTop()  : 0) : 0 );
		};
		if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
			var top = 0;
			if (top == self) 
				top = virtualKeyboardChromeExtensionClickedElem.documentOffsetTop() - ( window.innerHeight / 3 );
			virtualKeyboardChromeExtensionStateNewPos = top;
			window.scrollTo( 0, top );
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
	for (var i=0; i<keys.length; i++) {
		keys[i].innerHTML = "<span>"+keys[i].getAttribute("_key"+(virtualKeyboardChromeExtensionShift ? "C" : ""))+"</span>";
	}
	delete keys;
}

function virtualKeyboardChromeExtension_click(key, skip) {
	if (top != self) {
		chrome.extension.sendRequest({method: "clickFromIframe", key: key, skip: skip, frame: this.frameElement.id });
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
			case "Url":
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").focus();
				break;
			case "empty":
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
					setTimeout(function() { 
						if (virtualKeyboardChromeExtensionState == false) {
							document.getElementById('virtualKeyboardChromeExtension').style.display = "none"; 
						}
					}, 500);
					if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
						var scrollYAmount = document.body.scrollTop;
						if ((scrollYAmount <= virtualKeyboardChromeExtensionStateNewPos+50) && (scrollYAmount >= virtualKeyboardChromeExtensionStateNewPos-50)) {
							document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.display = "none";
							if (virtualKeyboardChromeExtensionPagePadding) {
								document.body.style.marginBottom = "";
							}
							window.scroll(0,virtualKeyboardChromeExtensionStateLastPos);
						}
					}
				}
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "close");
				setTimeout(function() {
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
						virtualKeyboardChromeExtensionClickedElem.value = virtualKeyboardChromeExtensionClickedElem.value.substr(0, pos)+"\n"+virtualKeyboardChromeExtensionClickedElem.value.substr(posEnd);
						virtualKeyboardChromeExtensionClickedElem.selectionStart = pos+1;
						virtualKeyboardChromeExtensionClickedElem.selectionEnd = pos+1;
					} else {
					
						var form  = virtualKeyboardChromeExtension_getParentByTagName(virtualKeyboardChromeExtensionClickedElem, "form");
						if (form != null) {
							var inputs = form.getElementsByTagName("input");
							var c = 0;
							for (var i=0; i<inputs.length; i++) {
								if ((inputs[i].type == "submit") && (c <= 0)) {
									inputs[i].click();
									c++;
								}
							}
							if (c <= 0) {
								inputs = form.getElementsByTagName("button");
								for (var i=0; i<inputs.length; i++) {
									if ((inputs[i].type == "submit") && (c <= 0)) {
										inputs[i].click();
										c++;
									}
								}
							}
							if (c <= 0) {
								var keyboardEvent = document.createEvent("KeyboardEvent");
								var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
								keyboardEvent[initMethod](
								   "submit", // event type : keydown, keyup, keypress
									true, // bubbles
									true, // cancelable
									window, // viewArg: should be window
									false, // ctrlKeyArg
									false, // altKeyArg
									false, // shiftKeyArg
									false, // metaKeyArg
									0, // keyCodeArg : unsigned long the virtual key code, else 0
									0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
								);
								form.dispatchEvent(keyboardEvent);
								//form.submit();
							}
							delete inputs;
						}
						var keyboardEvent = document.createEvent("KeyboardEvent");
						var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
						keyboardEvent[initMethod](
						   "keydown", // event type : keydown, keyup, keypress
							true, // bubbles
							true, // cancelable
							window, // viewArg: should be window
							false, // ctrlKeyArg
							false, // altKeyArg
							false, // shiftKeyArg
							false, // metaKeyArg
							13, // keyCodeArg : unsigned long the virtual key code, else 0
							0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
						);
						virtualKeyboardChromeExtensionClickedElem.dispatchEvent(keyboardEvent);
						delete form;
						
						
					/*
						var inputs = virtualKeyboardChromeExtensionClickedElem.parentNode.parentNode.parentNode.getElementsByTagName("input")
						for (var i=0; i<inputs.length; i++) {
							if (inputs[i].type == "submit") {
								inputs[i].click();
							}
						}
						*/
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
						setTimeout(function() { document.getElementById('virtualKeyboardChromeExtension').style.display = "none"; }, 500);
						if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
							var scrollYAmount = document.body.scrollTop;
							if ((scrollYAmount <= virtualKeyboardChromeExtensionStateNewPos+50) && (scrollYAmount >= virtualKeyboardChromeExtensionStateNewPos-50)) {
								document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.display = "none";
								if (virtualKeyboardChromeExtensionPagePadding) {
									document.body.style.marginBottom = "";
								}
								window.scroll(0,virtualKeyboardChromeExtensionStateLastPos);
							}
						}
					}
					virtualKeyboardChromeExtension_generate_onchange();
				}
				break;
			case 'Shift':
				virtualKeyboardChromeExtensionShift = !virtualKeyboardChromeExtensionShift;
				document.getElementById("virtualKeyboardChromeExtensionMainKbd").className= virtualKeyboardChromeExtensionShift ? "Shift" : "";
				virtualKeyboardChromeExtension_shiftButtonKeys();
				break;
			case 'Backspace':
				var pos = virtualKeyboardChromeExtensionClickedElem.selectionStart;
				var posEnd = virtualKeyboardChromeExtensionClickedElem.selectionEnd;
				if (posEnd == pos) {
					pos = pos-1;
				}
				virtualKeyboardChromeExtensionClickedElem.value = virtualKeyboardChromeExtensionClickedElem.value.substr(0, pos)+virtualKeyboardChromeExtensionClickedElem.value.substr(posEnd);
				virtualKeyboardChromeExtensionClickedElem.selectionStart = pos;
				virtualKeyboardChromeExtensionClickedElem.selectionEnd = pos;
                virtualKeyboardChromeExtensionElemChanged=true;
				break;
			default:
				if (virtualKeyboardChromeExtensionClickedElem != undefined) {
					var keyboardEvent = document.createEvent("KeyboardEvent");
					var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
					keyboardEvent[initMethod](
					   "keydown", // event type : keydown, keyup, keypress
						true, // bubbles
						true, // cancelable
						window, // viewArg: should be window
						false, // ctrlKeyArg
						false, // altKeyArg
						false, // shiftKeyArg
						false, // metaKeyArg
						key.charCodeAt(0), // keyCodeArg : unsigned long the virtual key code, else 0
						0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
					);
					virtualKeyboardChromeExtensionClickedElem.dispatchEvent(keyboardEvent);
					var pos = virtualKeyboardChromeExtensionClickedElem.selectionStart;
					var posEnd = virtualKeyboardChromeExtensionClickedElem.selectionEnd;
					if (virtualKeyboardChromeExtensionShift) {
						if ((key.charCodeAt(0) >= 97) && (key.charCodeAt(0) <= 122)) {
							key = String.fromCharCode(key.charCodeAt(0)-32);
						}
						if ((key.charCodeAt(0) >= 224) && (key.charCodeAt(0) <= 252)) {
							key = String.fromCharCode(key.charCodeAt(0)-32);
						}						
						// 'ű' and 'ő'
						if((key.charCodeAt(0) == 337) || (key.charCodeAt(0) == 369)) {
							key = String.fromCharCode(key.charCodeAt(0)-1);
						}
					}
					virtualKeyboardChromeExtensionClickedElem.value = virtualKeyboardChromeExtensionClickedElem.value.substr(0, pos)+key+virtualKeyboardChromeExtensionClickedElem.value.substr(posEnd);
					virtualKeyboardChromeExtensionClickedElem.selectionStart = pos+1;
					virtualKeyboardChromeExtensionClickedElem.selectionEnd = pos+1;
					virtualKeyboardChromeExtensionElemChanged=true;
					if ((virtualKeyboardChromeExtensionShift) && (virtualKeyboardChromeExtensionShiftBehaviour)) {
						virtualKeyboardChromeExtensionShift = !virtualKeyboardChromeExtensionShift;
						document.getElementById("virtualKeyboardChromeExtensionMainKbd").className= virtualKeyboardChromeExtensionShift ? "Shift" : "";
						virtualKeyboardChromeExtension_shiftButtonKeys();
					}
					virtualKeyboardChromeExtensionDraggabling = false;
					
					keyboardEvent = document.createEvent("KeyboardEvent");
					initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
					keyboardEvent[initMethod](
									   "keypress", // event type : keydown, keyup, keypress
										true, // bubbles
										true, // cancelable
										window, // viewArg: should be window
										false, // ctrlKeyArg
										false, // altKeyArg
										false, // shiftKeyArg
										false, // metaKeyArg
										0, // keyCodeArg : unsigned long the virtual key code, else 0
										key.charCodeAt(0) // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
					);
					virtualKeyboardChromeExtensionClickedElem.dispatchEvent(keyboardEvent);
					
					keyboardEvent = document.createEvent("KeyboardEvent");
					initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
					keyboardEvent[initMethod](
									   "keyup", // event type : keydown, keyup, keypress
										true, // bubbles
										true, // cancelable
										window, // viewArg: should be window
										false, // ctrlKeyArg
										false, // altKeyArg
										false, // shiftKeyArg
										false, // metaKeyArg
										0, // keyCodeArg : unsigned long the virtual key code, else 0
										key.charCodeAt(0) // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
					);
					virtualKeyboardChromeExtensionClickedElem.dispatchEvent(keyboardEvent);
				}
				break;
		}
	}
}


function setting_load(key, callback) {
	chrome.extension.sendRequest({method: "getLocalStorage", key: key}, function(response) {
	  	eval(callback)(response.data);
	});
}

function setting_reloadKeyboardToggle(openState) {
	chrome.extension.sendRequest({method: "getLocalStorage", key: "keyboardEnabled"}, function(response) {
	  	virtualKeyboardChromeExtensionKeyboardEnabled = response.data;
		if (openState) {
			if ((document.activeElement.tagName == "INPUT") || (document.activeElement.tagName == "TEXTAREA")) {
				var e = document.activeElement;
				document.activeElement.blur();
				setTimeout(function() {
					e.focus();
				}, 500);
			}
		}
	});
}

function setting_set(key, value) {
	chrome.extension.sendRequest({method: "setLocalStorage", key: key, value: value}, function(response) {});
}

function virtualKeyboardChromeExtension_getElementPositionY(obj) {
	var curtop = 0;
	if (obj.offsetParent) {	
		do {
			curtop += obj.offsetTop;	
		} while (obj = obj.offsetParent);
	}
	return curtop;
}

function virtualKeyboardChromeExtension_getElementPositionX(obj) {
	var curleft = 0;
	if (obj.offsetParent) {	
		do {
			curleft += obj.offsetLeft;	
		} while (obj = obj.offsetParent);
	}
	return curleft;
}
function virtualKeyboardChromeExtension_open_part2(pos) {
	var windowScrollTop = document.body.scrollTop;
	if (virtualKeyboardChromeExtensionCloseTimer != null) {
		clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
	}
	virtualKeyboardChromeExtensionStateLastPos = document.body.scrollTop;
	if (virtualKeyboardChromeExtensionFullScreenState) {
		if (((document.body.style.marginBottom == "") && (!virtualKeyboardChromeExtensionPagePadding)) || (virtualKeyboardChromeExtensionPagePadding)) {
			document.body.style.marginBottom = document.getElementById("virtualKeyboardChromeExtension").offsetHeight+"px";
			virtualKeyboardChromeExtensionPagePadding = true;
		}
		virtualKeyboardChromeExtension_make_object_visible();
	}
	virtualKeyboardChromeExtensionState = true;
	document.getElementById('virtualKeyboardChromeExtension').style.display = "";
	chrome.extension.sendRequest({method: "getSmallKeyboardCoords"}, function(response) {
		if (response.smallKeyboard == "true") {
			if (hardwareAcceleration) {
				document.getElementById('virtualKeyboardChromeExtension').style.setProperty("-webkit-transform", "translate3d(0,0,0)");
			}
			if (response.smallKeyboardTop != undefined) {
				document.getElementById('virtualKeyboardChromeExtension').style.top = response.smallKeyboardTop;
			} else {
				document.getElementById('virtualKeyboardChromeExtension').style.top = "auto";
			}
			if (response.smallKeyboardBottom != undefined) {
				document.getElementById('virtualKeyboardChromeExtension').style.bottom = response.smallKeyboardBottom;
			} else {
				document.getElementById('virtualKeyboardChromeExtension').style.bottom = "0";
			}
			if (response.smallKeyboardRight != undefined) {
				document.getElementById('virtualKeyboardChromeExtension').style.right = response.smallKeyboardRight;
			} else {
				document.getElementById('virtualKeyboardChromeExtension').style.right = "0";
			}
			if (response.smallKeyboardLeft != undefined) {
				document.getElementById('virtualKeyboardChromeExtension').style.left = response.smallKeyboardLeft;
			} else {
				document.getElementById('virtualKeyboardChromeExtension').style.left = "auto";
			}
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
    var virtualKeyboardChromeExtension_style=window.getComputedStyle(document.getElementById('virtualKeyboardChromeExtension'));
    var current_height=parseFloat(virtualKeyboardChromeExtension_style.height)+parseFloat(virtualKeyboardChromeExtension_style.paddingTop)+parseFloat(virtualKeyboardChromeExtension_style.paddingBottom);
    var current_zoom=parseFloat(virtualKeyboardChromeExtension_style.zoom);
	if (virtualKeyboardChromeExtensionFullScreenState && intelligentScroll) {
		document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.height = (current_height*current_zoom)+"px";
		document.getElementById("virtualKeyboardChromeExtensionOverlayScrollExtend").style.display = "block";
		virtualKeyboardChromeExtension_make_object_visible();
	}
	if (intelligentScroll) {
		if (pos == undefined) { pos = virtualKeyboardChromeExtension_getElementPositionY(virtualKeyboardChromeExtensionClickedElem)-10; }
		if (pos > window.innerHeight-document.getElementById("virtualKeyboardChromeExtension").offsetHeight) {
			if (virtualKeyboardChromeExtensionFullScreenState) {
				virtualKeyboardChromeExtensionStateNewPos = windowScrollTop+pos-50;
				window.scroll(0,virtualKeyboardChromeExtensionStateNewPos);
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
	if (virtualKeyboardChromeExtensionElemType == "textarea") {
		document.getElementById("virtualKeyboardChromeExtensionMainNumbers").style.display =  "none";
		document.getElementById("virtualKeyboardChromeExtensionNumberBarKbdInput").style.display =  "none";
		document.getElementById("virtualKeyboardChromeExtensionMainKbd").style.display =  "";
		virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "none");
	} else {
		document.getElementById("virtualKeyboardChromeExtensionNumberBarKbdInput").style.display =  "none";
		document.getElementById("virtualKeyboardChromeExtensionMainKbd").style.display =  "";
		document.getElementById("virtualKeyboardChromeExtensionMainNumbers").style.display =  "none";
		virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "none");
		if (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "number") {
			document.getElementById("virtualKeyboardChromeExtensionNumberBarKbdInput").style.display =  "";
			document.getElementById("virtualKeyboardChromeExtensionMainKbd").style.display =  "none";
		} else if (virtualKeyboardChromeExtensionClickedElem.getAttribute("_originalType") == "email") {
			virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "");
		}
	}
}

var iframeElemSent = 0;

var virtualKeyboardChromeExtensionKeyboardLoaded1 = "";
function virtualKeyboardChromeExtension_open(posY, posX, force) {
	if (top != self) {
		if (virtualKeyboardChromeExtensionClickedElem.id == "") {
			virtualKeyboardChromeExtensionClickedElem.id = "CVK_E_"+iframeElemSent;
			iframeElemSent++;
		}
        
        /*var test1=this.frameElement.id;
        var test1a=virtualKeyboardChromeExtensionClickedElem.id;
        chrome.extension.sendRequest();*/
		chrome.extension.sendRequest({method: "openFromIframe", posY: posY, posX: posX, force: force, frame: this.frameElement.id, elem: virtualKeyboardChromeExtensionClickedElem.id });
	} else {
		document.body.removeChild(virtualKeyboardChromeExtensionKeyboardElement);
		document.body.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
		if ((virtualKeyboardChromeExtensionKeyboardEnabled == "demand") && (force == undefined) && (virtualKeyboardChromeExtensionClickedElem.id != "virtualKeyboardChromeExtensionUrlBarTextBox")) {
			virtualKeyboardChromeExtensionClickedElemDemand = virtualKeyboardChromeExtensionClickedElem;
			if (posX == undefined) { posX = virtualKeyboardChromeExtension_getElementPositionX(virtualKeyboardChromeExtensionClickedElem); }
			if (posY == undefined) { posY = virtualKeyboardChromeExtension_getElementPositionY(virtualKeyboardChromeExtensionClickedElem); }
			posX = posX + document.body.scrollLeft;
			posY = posY + document.body.scrollTop;
			document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.display = "block";
			document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.top = posY+"px";
			document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.left = posX+"px";
			setTimeout(function() {
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "open");
			}, 50);

		} else if (virtualKeyboardChromeExtensionKeyboardEnabled != "false") {
			if (virtualKeyboardChromeExtensionKeyboardLayout1Setting == undefined) { virtualKeyboardChromeExtensionKeyboardLayout1Setting = "en"; }	
			if (virtualKeyboardChromeExtensionKeyboardLoaded1 != virtualKeyboardChromeExtensionKeyboardLayout1Setting) {
				var xmlhttp=new XMLHttpRequest();
				xmlhttp.onreadystatechange=function() {
					if (xmlhttp.readyState==4 && xmlhttp.status==200)
					{
						var data2 = xmlhttp.responseText;
						document.getElementById("virtualKeyboardChromeExtensionMainKbdPH").innerHTML = data2;
						init_virtualKeyboardChromeExtension(true);
						virtualKeyboardChromeExtension_inputTypesRender();
						virtualKeyboardChromeExtension_open_part2(posY);	
						delete data2;
					}
				}
				xmlhttp.open("GET",chrome.extension.getURL("keyboard_"+virtualKeyboardChromeExtensionKeyboardLayout1Setting+".html"),true);
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
	virtualKeyboardChromeExtensionCloseTimer = setTimeout(function() {
		virtualKeyboardChromeExtension_click('Close');
	}, 1000);
}


function vk_evt_input_focus() {
	if ((this.disabled==true) || (this.readOnly==true))
		{
		return;
		}
	clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
	virtualKeyboardChromeExtensionElemType = "input";
	virtualKeyboardChromeExtension_generate_onchange();
	virtualKeyboardChromeExtensionClickedElem = this;
	virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos);
	virtualKeyboardChromeExtension_inputTypesRender();
}



function vk_evt_input_click() { 
	if ((this.disabled==true) || (this.readOnly==true))
		{
		return;
		}						
	clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
	virtualKeyboardChromeExtensionElemType = "input";
	virtualKeyboardChromeExtension_generate_onchange();
	virtualKeyboardChromeExtensionClickedElem = this;
	if (!virtualKeyboardChromeExtensionState) {
		virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos);
	}
	virtualKeyboardChromeExtension_inputTypesRender();
}

function vk_evt_input_mousedown() { 
	virtualKeyboardChromeExtensionClickedYPos = window.event.clientY; 
	virtualKeyboardChromeExtensionClickedXPos = window.event.clientX; 
}


function vk_evt_textarea_mousedown() { 
	virtualKeyboardChromeExtensionClickedYPos = window.event.clientY; 
	virtualKeyboardChromeExtensionClickedXPos = window.event.clientX; 
}

function vt_evt_autoTrigger_mover_timeout(elem) {
	lastHoveredTO = setTimeout(function() {
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
	lastHoveredTO = setTimeout(function() {
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

function vt_evt_textarea_focus() { 
	if ((this.disabled==true) || (this.readOnly==true))
		{
		return;
		}
	clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
	virtualKeyboardChromeExtension_generate_onchange();
	virtualKeyboardChromeExtensionElemType = "textarea";
	virtualKeyboardChromeExtensionClickedElem = this;
	virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos);
	virtualKeyboardChromeExtension_inputTypesRender();
}



function vt_evt_textarea_click() { 
	if ((this.disabled==true) || (this.readOnly==true))
		{
		return;
		}
	clearTimeout(virtualKeyboardChromeExtensionCloseTimer);
	virtualKeyboardChromeExtension_generate_onchange();
	virtualKeyboardChromeExtensionElemType = "textarea";
	virtualKeyboardChromeExtensionClickedElem = this;
	if (!virtualKeyboardChromeExtensionState) {
		virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos);
	}
	virtualKeyboardChromeExtension_inputTypesRender();
}

var virtualKeyboardChromeExtensionCloseTimer = null;
var virtualKeyboardChromeExtensionBackspaceTimer = null;

function virtualKeyboardChromeClassStyleDisplay(className, value) {
	var items = document.getElementsByClassName(className);
	for (var i=0; i<items.length; i++) {
		items[i].style.display = value;
	}
}

var virtualKeyboardChromeExtensionDraggabling = false;
var virtualKeyboardChromeExtensionDraggablingX = 0;
var virtualKeyboardChromeExtensionDraggablingY = 0;
var virtualKeyboardChromeExtensionRequestRefresh = false;

function xk_settings_load_main(response) {
	if (response.openedFirstTime == undefined) {
		window.open(chrome.extension.getURL("options.html"));
		setting_set("openedFirstTime", "true");
	}
	if (response.smallKeyboard == "true") {
		document.getElementById('virtualKeyboardChromeExtension').className = "modeS";		
		virtualKeyboardChromeExtensionFullScreenState = false;
	} else {
		document.getElementById('virtualKeyboardChromeExtension').className = "";
		virtualKeyboardChromeExtensionFullScreenState = true;
	}
	virtualKeyboardChromeExtensionShiftBehaviour = response.capsLock == "false";
	virtualKeyboardChromeExtensionTouchEvents = response.touchEvents;
	if (virtualKeyboardChromeExtensionTouchEvents == undefined) { virtualKeyboardChromeExtensionTouchEvents = "false"; }
	
	if (virtualKeyboardChromeExtensionTouchEvents == "true") { 
		document.addEventListener("touchend", vk_document_mouseup, false);
		document.addEventListener("touchmove", vk_document_mousemove, false);
	} else {						
		document.addEventListener("mouseup", vk_document_mouseup, false);
		document.addEventListener("mousemove", vk_document_mousemove, false);
	}
	
	virtualKeyboardChromeExtensionKeyboardEnabled = response.keyboardEnabled;
	virtualKeyboardChromeExtensionKeyboardLayout1Setting = response.keyboardLayout1;
	
	virtualKeyboardChromeExtensionUrlButton = response.urlButton;
	if (virtualKeyboardChromeExtensionUrlButton == undefined) { virtualKeyboardChromeExtensionUrlButton = "false"; }
	init_virtualKeyboardChromeExtension(true);
}
					
function init_virtualKeyboardChromeExtension(firstTime) {
	if (firstTime) {
		if (top == self) {
			if (virtualKeyboardChromeExtensionTouchEvents == undefined) {			
				if ((document.getElementById('virtualKeyboardChromeExtension').getAttribute("_state") != "open") || (virtualKeyboardChromeExtensionRequestRefresh)) {
					chrome.extension.sendRequest({method: "loadKeyboardSettings"}, xk_settings_load_main);
				} 
			} else {
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").onblur = function() {
					document.getElementById('virtualKeyboardChromeExtensionUrlBar').style.top = "-100px";
					if (document.getElementById("urlButton") != undefined) {
						document.getElementById("urlButton").setAttribute("highlight", "");
					}
					virtualKeyboardChromeExtension_generate_onchange();
					virtualKeyboardChromeExtensionClickedElem = undefined;
					virtualKeyboardChromeExtensionCloseTimer = setTimeout(function() {
						virtualKeyboardChromeExtension_click('Close');
					}, 1000);
				} 
				document.getElementById("virtualKeyboardChromeExtensionUrlBarTextBox").onfocus = function(evt) {
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
						setTimeout(function() {
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
					if (virtualKeyboardChromeExtensionUrlButton == "true") {
						document.getElementById("urlButton").style.display = ""; 
					} else {
						document.getElementById("urlButton").style.display = "none"; 
					}	
				}

				if (virtualKeyboardChromeExtensionTouchEvents == "true") { 
					document.getElementById("virtualKeyboardChromeExtensionDraggableLeft").ontouchstart = function(ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.touches[0].clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.touches[0].clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}
					document.getElementById("virtualKeyboardChromeExtensionDraggableRight").ontouchstart = function(ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.touches[0].clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.touches[0].clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}	
				} else {
					document.getElementById("virtualKeyboardChromeExtensionDraggableLeft").onmousedown = function(ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}
					document.getElementById("virtualKeyboardChromeExtensionDraggableRight").onmousedown = function(ent) {
						virtualKeyboardChromeExtensionDraggabling = true;
						virtualKeyboardChromeExtensionDraggablingX = ent.clientX - document.getElementById("virtualKeyboardChromeExtension").offsetLeft;
						virtualKeyboardChromeExtensionDraggablingY = ent.clientY - document.getElementById("virtualKeyboardChromeExtension").offsetTop;
					}	
				}
					
					
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").onclick = function(ent) {
					virtualKeyboardChromeExtensionClickedElemDemand.focus();
					virtualKeyboardChromeExtension_open(virtualKeyboardChromeExtensionClickedYPos, virtualKeyboardChromeExtensionClickedXPos, true);
					setTimeout(function() {
						document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").setAttribute("_state", "close");
						setTimeout(function() {
							document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.display = "none";
						}, 200);
					}, 100);
					ent.preventDefault();
					ent.stopPropagation();
				}
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").onmousedown = function(ent) {
					ent.preventDefault();
					ent.stopPropagation();
				}
				document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").onmouseup = function(ent) {
					ent.preventDefault();
					ent.stopPropagation();
				}
				
				if (autoTrigger) {
					document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
					document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
				}
			}
		} else {
			if (virtualKeyboardChromeExtensionTouchEvents == undefined) {			
				chrome.extension.sendRequest({method: "loadKeyboardSettings"}, function(response) {
					virtualKeyboardChromeExtensionTouchEvents = response.touchEvents;
					if (virtualKeyboardChromeExtensionTouchEvents == undefined) { virtualKeyboardChromeExtensionTouchEvents = "false"; }
					init_virtualKeyboardChromeExtension(true);
				});
			}
		}
	}
	if (virtualKeyboardChromeExtensionTouchEvents != undefined) {
		var e = document.getElementsByTagName("input");
		for (var i=0; i<e.length; i++) {
			if ((e[i].type == "text") || (e[i].type == "password") || (e[i].type == "search") || (e[i].type == "email") || (e[i].type == "number") || (e[i].type == "date") || (e[i].type == "url")) {
				if (e[i].getAttribute("_vkEnabled") == undefined) {
					e[i].setAttribute("_vkEnabled", "true");
					e[i].addEventListener("blur", vk_evt_input_blur, false);
					if (virtualKeyboardChromeExtensionTouchEvents == "true") {
						e[i].addEventListener("touchstart", function(ent) { 
							virtualKeyboardChromeExtensionClickedYPos = ent.touches[0].clientY; 
							virtualKeyboardChromeExtensionClickedXPos = ent.touches[0].clientX; 
						}, false);
					} else {
						e[i].addEventListener("mousedown", vk_evt_input_mousedown, false);
					}
					e[i].addEventListener("focus", vk_evt_input_focus, false);
					e[i].addEventListener("click", vk_evt_input_click, false);
					if (autoTrigger) {
						e[i].addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
						e[i].addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
					}

				}
			}
		}
		delete e;
		
		if (autoTriggerLinks) {
			var e = document.getElementsByTagName("a");
			for (var i=0; i<e.length; i++) {
				if (e[i].getAttribute("_vkEnabled") == undefined) {
					e[i].setAttribute("_vkEnabled", "true");
					e[i].addEventListener("mouseover", vt_evt_autoTrigger_mover_a, false);
					e[i].addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
				}
			}
		}
		
		var e = document.getElementsByTagName("textarea");
		for (var i=0; i<e.length; i++) {
			if (e[i].getAttribute("_vkEnabled") == undefined) {
				e[i].setAttribute("_vkEnabled", "true");
				e[i].addEventListener("blur", function() {
					virtualKeyboardChromeExtension_generate_onchange();
					virtualKeyboardChromeExtensionClickedElem = undefined;
					virtualKeyboardChromeExtensionCloseTimer = setTimeout(function() {
						virtualKeyboardChromeExtension_click('Close');
					}, 1000);
				}, false);
				if (virtualKeyboardChromeExtensionTouchEvents == "true") {
					e[i].addEventListener("touchstart", function(ent) { 
						virtualKeyboardChromeExtensionClickedYPos = ent.touches[0].clientY; 
						virtualKeyboardChromeExtensionClickedXPos = ent.touches[0].clientX; 
					}, false);
				} else {
					e[i].addEventListener("mousedown", vk_evt_textarea_mousedown, false);
				}
				e[i].addEventListener("focus", vt_evt_textarea_focus, false);
				e[i].addEventListener("click", vt_evt_textarea_click, false);
				if (autoTrigger) {
					e[i].addEventListener("mouseover", vt_evt_autoTrigger_mover, false);
					e[i].addEventListener("mouseout", vt_evt_autoTrigger_mout, false);
				}
			}
		}
		delete e;
		if (firstTime) {
			if (top == self) {
				var v = document.getElementById("virtualKeyboardChromeExtension");
				v.onclick = function(ent) {
					ent.preventDefault();
				}
				if (virtualKeyboardChromeExtensionTouchEvents == "true") {
					v.ontouchstart = function(ent) {
						ent.preventDefault();
					}
					v.ontouchend = function(ent) {
						ent.preventDefault();
					}
					
				} 
				v.onmousedown = function(ent) {
					ent.preventDefault();
				}
				v.onmouseup = function(ent) {
					ent.preventDefault();
				}
				delete v;
			}
			var e = document.getElementsByClassName("kbdClick");
			for (i=0; i<e.length; i++) {
				if (e[i].getAttribute("_vkEnabled") == undefined) {
					e[i].setAttribute("_vkEnabled", "true");
					e[i].onclick = function(ent) {
						var k = this.getAttribute("_key");
						if (virtualKeyboardChromeExtensionShift) {
							if (this.getAttribute("_keyC") != undefined) {
								k = this.getAttribute("_keyC");
							}
						}
						virtualKeyboardChromeExtension_click(k);
						ent.preventDefault();
						ent.stopPropagation();
					}
					if (virtualKeyboardChromeExtensionTouchEvents == "true") {
						e[i].ontouchstart = function(ent) { 
							var k = this.getAttribute("_key");
							if (virtualKeyboardChromeExtensionShift) { 
								if (this.getAttribute("_keyC") != undefined) {
									k = this.getAttribute("_keyC");
								}
							}
							virtualKeyboardChromeExtension_click(k);
							var e = this.getAttribute("_key");
							var virtualKeyboardChromeExtensionBackspaceTimerCount = 0;
							if (virtualKeyboardChromeExtensionBackspaceTimer != null) {
								clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
							}
							virtualKeyboardChromeExtensionBackspaceTimer = setInterval(function() {
								if (virtualKeyboardChromeExtensionBackspaceTimerCount < 30) { 
									virtualKeyboardChromeExtensionBackspaceTimerCount++; 
								} else {
									virtualKeyboardChromeExtension_click(e, true);
								}
							}, 50);
							ent.preventDefault();
							ent.stopPropagation();
						}
						e[i].ontouchmove = function(ent) {
							ent.preventDefault();
							ent.stopPropagation();
						}
						e[i].ontouchend = function(ent) {
							ent.preventDefault();
						}
					} else {
						e[i].onmousedown = function(ent) { 
							var e = this.getAttribute("_key");
							var virtualKeyboardChromeExtensionBackspaceTimerCount = 0;
							if (virtualKeyboardChromeExtensionBackspaceTimer != null) {
								clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
							}
							virtualKeyboardChromeExtensionBackspaceTimer = setInterval(function() {
									if (virtualKeyboardChromeExtensionBackspaceTimerCount < 30) { 
										virtualKeyboardChromeExtensionBackspaceTimerCount++; 
									} else {
										virtualKeyboardChromeExtension_click(e, true);
									}
								}, 50);
							ent.preventDefault();
							ent.stopPropagation();
						}
						e[i].onmousemove = function(ent) {
							ent.preventDefault();
							ent.stopPropagation();
						}
						e[i].onmouseup = function(ent) {
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
				for (i=0; i<m.length; i++) {
					if (virtualKeyboardChromeExtensionTouchEvents == "true") {
						m[i].ontouchstart = function(ent) {
							virtualKeyboardChromeExtensionClickedMenuBtn = false;
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).style.display = "";
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).style.left = (ent.touches[0].clientX-(document.getElementById("virtualKeyboardChromeExtensionOverlaySettings").offsetWidth/2))+"px";
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).style.bottom = ((window.innerHeight-ent.touches[0].clientY)+20)+"px";
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).setAttribute("_state", "open");
						}
						m[i].ontouchend = function(ent) {
							var ho = "false";
							if (this.getAttribute("_hoverOnly") != undefined) {
								ho = m[i].getAttribute("_hoverOnly");
							}
							if (ho != "true") {
								virtualKeyboardChromeExtensionClickedMenuBtn = true;
								ent.preventDefault();
							} else {
								if (!virtualKeyboardChromeExtensionClickedMenuBtn) {
									var m = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
									for (i=0; i<m.length; i++) {
										m[i].setAttribute("_state", "closed");
									}
									setTimeout(function() {
										for (i=0; i<m.length; i++) {
											m[i].style.display = "none";
										}
									}, 500);
									delete m;
								}
								virtualKeyboardChromeExtensionClickedMenuBtn = false;
							}
							delete ho;
						}
					} else {
						m[i].onmousedown = function(ent) {
							virtualKeyboardChromeExtensionClickedMenuBtn = false;
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).style.display = "";
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).style.left = (window.event.clientX-(document.getElementById("virtualKeyboardChromeExtensionOverlaySettings").offsetWidth/2))+"px";
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).style.bottom = ((window.innerHeight-window.event.clientY)+20)+"px";
							document.getElementById("virtualKeyboardChromeExtensionOverlay"+this.getAttribute("_menu")).setAttribute("_state", "open");
							ent.preventDefault();
						}
						m[i].onmouseup = function(ent) {
							var ho = "false";
							if (this.getAttribute("_hoverOnly") != undefined) {
								ho = m[i].getAttribute("_hoverOnly");
							}
							if (ho != "true") {
								virtualKeyboardChromeExtensionClickedMenuBtn = true;
								ent.preventDefault();
							} else {
								if (!virtualKeyboardChromeExtensionClickedMenuBtn) {
									var m = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
									for (i=0; i<m.length; i++) {
										m[i].setAttribute("_state", "closed");
									}
									setTimeout(function() {
										for (i=0; i<m.length; i++) {
											m[i].style.display = "none";
										}
									}, 500);
									delete m;
								}
								virtualKeyboardChromeExtensionClickedMenuBtn = false;
							}
							delete ho;
						}
					}
				}
				delete m;
				if (document.getElementById("settingsButton") != undefined) {
					chrome.extension.sendRequest({method: "getLocalStorage", key: "keyboardLayoutsList"}, function(response) {
						var data = response.data;
						document.getElementById("settingsButton").style.display = "none"; 
						if (data != undefined) {
							var a = JSON.parse(data);
							if (a.length > 1) { 
								document.getElementById("settingsButton").style.display = ""; 
								document.getElementById("virtualKeyboardChromeExtensionOverlaySettingsUl").innerHTML = "";
								for (i=0; i<a.length; i++) {
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
								for (i=0; i<mi.length; i++) {
									if (virtualKeyboardChromeExtensionTouchEvents == "true") {
										mi[i].ontouchmove = function(ent) {
											var mi2 = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlayButton");
											for (i2=0; i2<mi2.length; i2++) {
												mi2[i2].setAttribute("mo", "");
											}
											delete mi2;
											this.setAttribute("mo", "true");
										}
										mi[i].ontouchend = function(ent) {
											virtualKeyboardChromeExtensionClickedMenuBtn = false;
											switch(this.getAttribute("_action")) {
												case "setKeyboard":
													virtualKeyboardChromeExtensionRequestRefresh = true;
													setting_set("keyboardLayout1", this.getAttribute("_layout"));
													virtualKeyboardChromeExtensionKeyboardLayout1Setting = this.getAttribute("_layout");
													virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "none");
													virtualKeyboardChromeExtension_open(undefined, undefined, true);
													virtualKeyboardChromeExtensionClickedElem.focus();
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
									} else {
										mi[i].onmousemove = function(ent) {
											var mi2 = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlayButton");
											for (i2=0; i2<mi2.length; i2++) {
												mi2[i2].setAttribute("mo", "");
											}
											this.setAttribute("mo", "true");
										}
										mi[i].onmouseup = function(ent) {
											virtualKeyboardChromeExtensionClickedMenuBtn = false;
											switch(this.getAttribute("_action")) {
												case "setKeyboard":
													virtualKeyboardChromeExtensionRequestRefresh = true;
													setting_set("keyboardLayout1", this.getAttribute("_layout"));
													virtualKeyboardChromeExtensionKeyboardLayout1Setting = this.getAttribute("_layout");
													virtualKeyboardChromeClassStyleDisplay("kbEmailInput", "none");
													virtualKeyboardChromeExtension_open(undefined, undefined, true);
													virtualKeyboardChromeExtensionClickedElem.focus();
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
	
}

function vk_document_mouseup(ent) {
	if (virtualKeyboardChromeExtensionBackspaceTimer != null) {
		clearInterval(virtualKeyboardChromeExtensionBackspaceTimer);
	}
	if (!virtualKeyboardChromeExtensionClickedMenuBtn) {
		var m = document.getElementsByClassName("virtualKeyboardChromeExtensionOverlay");
		for (i=0; i<m.length; i++) {
			m[i].setAttribute("_state", "closed");
		}
		setTimeout(function() {
			for (i=0; i<m.length; i++) {
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
		var l = clientX-virtualKeyboardChromeExtensionDraggablingX;
		var lper = (l) / window.innerWidth * 100;
		var rper = (100-((l+800) / window.innerWidth * 100));
		var methodLeft = true;
		if (l < 0) { l = 0; }
		if (lper > 50) { methodLeft = false; }
		if (rper < 0) { rper = 0; }
		if (lper < 0) { lper = 0 }
		document.getElementById("virtualKeyboardChromeExtension").style.setProperty("-webkit-transition", "none");
		if (methodLeft) {
			document.getElementById("virtualKeyboardChromeExtension").style.left = lper+"%";
			document.getElementById("virtualKeyboardChromeExtension").style.right = "auto";
		} else {
			document.getElementById("virtualKeyboardChromeExtension").style.left = "auto";
			document.getElementById("virtualKeyboardChromeExtension").style.right = rper+"%";
		}
		
		var t = clientY-virtualKeyboardChromeExtensionDraggablingY;
		
		var tper = (t) / window.innerHeight * 100;
		var bper = (100-((t+271) / window.innerHeight * 100));
		var methodTop = true;
		if (t < 0) { t = 0; }
		if (tper > 50) { methodTop = false; }
		if (bper < 0) { bper = 0; }
		if (tper < 0) { tper = 0 }
		if (methodTop) {
			document.getElementById("virtualKeyboardChromeExtension").style.top = tper+"%";
			document.getElementById("virtualKeyboardChromeExtension").style.bottom = "auto";
		} else {
			document.getElementById("virtualKeyboardChromeExtension").style.top = "auto";
			document.getElementById("virtualKeyboardChromeExtension").style.bottom = bper+"%";
		}
		document.getElementById("virtualKeyboardChromeExtension").style.marginLeft = "0";
	}
}

	


function init_virtualKeyboardChromeExtension_false() {
	if (virtualKeyboardChromeExtensionTouchEvents != undefined) {
		var e = document.activeElement;
		if ((e.tagName == "INPUT") || (e.tagName == "TEXTAREA")) {
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
	chrome.extension.onRequest.addListener(function(request) {
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
			setTimeout(function() { 
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
	for (var i=0; i<iframes.length; i++) {
		if (iframes[i].id == "") {
			iframes[i].id = "CVK_F_"+i;
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
	chrome.extension.sendRequest({method: "initLoadKeyboardSettings"}, function(response) {
		//hardwareAcceleration
		if (response.hardwareAcceleration == "false") {
			hardwareAcceleration = false;
		} else {
			hardwareAcceleration = true;
			virtualKeyboardChromeExtensionKeyboardElement.className = "ha";
		}
		
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
		autoTriggerAfter = response.autoTriggerAfter*1000;
	});
	virtualKeyboardChromeExtensionKeyboardElement.innerHTML = xhr.responseText;
	document.body.appendChild(virtualKeyboardChromeExtensionKeyboardElement);
	init_virtualKeyboardChromeExtension(true);
	setInterval(init_virtualKeyboardChromeExtension_false, 500);
	delete xhr;
  }
}
