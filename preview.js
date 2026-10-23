// Renders the real keyboard (keyboard.html, a layout and style.css) for the settings page.
// The settings page calls vkPreviewUpdate() with the current settings and vkPreviewHighlight()
// with the setting being pointed at.
var vkpLoadedLayout = null;
var vkpReady = null;

function vkpKeyboard() {
	return document.getElementById("virtualKeyboardChromeExtension");
}

async function vkpInit() {
	var html = await fetch("keyboard.html").then(function (r) { return r.text(); });
	var host = document.getElementById("vkpKeyboardHost");
	host.innerHTML = html;
	var kb = vkpKeyboard();
	kb.style.display = "";
	kb.style.opacity = "1";
	kb.style.bottom = "0";
	kb.style.transition = "none";
	// The hardware-accelerated style slides the keyboard off-screen until it opens.
	kb.style.setProperty("transform", "none", "important");
	kb.setAttribute("_state", "open");
}

async function vkpLoadLayout(layout) {
	if (layout == vkpLoadedLayout) {
		return;
	}
	var html = await fetch("layouts/keyboard_" + layout + ".html").then(function (r) { return r.text(); });
	document.getElementById("virtualKeyboardChromeExtensionMainKbdPH").innerHTML = html;
	vkpLoadedLayout = layout;
}

// state: { layout, small, zoom, urlButton, mode }
window.vkPreviewUpdate = async function (state) {
	if (vkpReady == null) {
		vkpReady = vkpInit();
	}
	await vkpReady;
	await vkpLoadLayout(state.layout || "en");
	var kb = vkpKeyboard();
	kb.className = state.small ? "modeS" : "";
	if (state.small) {
		kb.style.left = "calc(50% - 375px)";
		kb.style.right = "auto";
		kb.style.bottom = "14px";
		kb.style.zoom = "";
	} else {
		kb.style.left = "";
		kb.style.right = "";
		kb.style.bottom = "0";
		kb.style.zoom = (parseFloat(state.zoom) >= 0.3) ? state.zoom : "";
	}
	var urlButton = document.getElementById("urlButton");
	if (urlButton != null) {
		urlButton.style.display = state.urlButton ? "" : "none";
	}
	document.body.classList.toggle("vkpOff", state.mode == "false");
	kb.style.visibility = (state.mode == "true") ? "" : "hidden";
	document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").classList.toggle("vkpShown", state.mode == "demand");
	return vkpPlaceField();
};

// Puts the text field just above the keyboard, whatever its size, and returns the top of the
// area worth showing (field, URL bar and keyboard) so the settings page can fit it in view.
function vkpPlaceField() {
	var kbTop = vkpKeyboard().getBoundingClientRect().top;
	var fieldTop = Math.max(70, Math.round(kbTop) - 96);
	document.getElementById("vkpPage").style.top = fieldTop + "px";
	document.getElementById("virtualKeyboardChromeExtensionOverlayDemand").style.setProperty("top", (fieldTop + 14) + "px", "important");
	document.documentElement.style.setProperty("--vkp-url-top", (fieldTop - 28) + "px");
	return fieldTop - 40;
}

// target: which part of the keyboard a setting affects, or null to clear.
window.vkPreviewHighlight = async function (target) {
	await vkpReady;
	document.querySelectorAll(".vkpHighlight").forEach(function (el) {
		el.classList.remove("vkpHighlight");
	});
	document.getElementById("virtualKeyboardChromeExtensionUrlBar").classList.toggle("vkpShown", target == "url");
	var selectors = {
		keyboard: "#virtualKeyboardChromeExtension",
		handles: "#virtualKeyboardChromeExtensionDraggableLeft, #virtualKeyboardChromeExtensionDraggableRight",
		url: "#urlButton, #virtualKeyboardChromeExtensionUrlBar",
		layouts: "#settingsButton",
		shift: "#virtualKeyboardChromeExtensionMainKbd .kbdClick[_key=Shift]",
		backspace: "#virtualKeyboardChromeExtensionMainKbd .kbdClick[_key=Backspace]",
		field: "#vkpField .vkpInput",
		demand: "#virtualKeyboardChromeExtensionOverlayDemand"
	};
	if ((target != null) && (selectors[target] != undefined)) {
		document.querySelectorAll(selectors[target]).forEach(function (el) {
			el.classList.add("vkpHighlight");
		});
	}
};
