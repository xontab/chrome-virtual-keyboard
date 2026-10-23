// Settings live in chrome.storage.local so the service worker can read them.
// Writes go through this proxy, which mirrors each change into storage as a string.
var settingsCache = {};
var settings = new Proxy(settingsCache, {
	set: function (target, key, value) {
		target[key] = String(value);
		var item = {};
		item[key] = target[key];
		chrome.storage.local.set(item);
		return true;
	}
});

function kl_add() {
	var o = document.getElementById("al").options;
	for (var i = 0; i < o.length; i++) {
		if (o[i].selected && !o[i].hidden) {
			var opt = document.createElement("option");
			opt.text = o[i].innerHTML;
			opt.value = o[i].value;
			var os = document.getElementById("sl").options;
			var exists = false;
			for (var i2 = 0; i2 < os.length; i2++) {
				if (os[i2].value == o[i].value) {
					exists = true;
				}
			}
			if (!exists) {
				document.getElementById("sl").options.add(opt);
			}
		}
	}
	kl_save();
}

function kl_save() {
	var a = new Array();
	var o = document.getElementById("sl").options;
	for (var i = 0; i < o.length; i++) {
		if (o[i].value != undefined) {
			a.push({ value: o[i].value, name: o[i].innerHTML });
		}
	}
	settings["keyboardLayoutsList"] = JSON.stringify(a);
	settings["keyboardLayout1"] = a[0].value;
	document.getElementById("changeEffect").className = "show";
	updatePreview();
}

// English (the default) first, then the rest alphabetically.
function kl_sort() {
	var al = document.getElementById("al");
	var options = Array.prototype.slice.call(al.options);
	options.sort(function (a, b) {
		if ((a.value == "en") != (b.value == "en")) {
			return a.value == "en" ? -1 : 1;
		}
		return a.text.localeCompare(b.text);
	});
	options.forEach(function (o) {
		al.appendChild(o);
	});
}

// Matches the layout name or its language code.
function kl_search() {
	var term = document.getElementById("layoutSearch").value.trim().toLowerCase();
	var o = document.getElementById("al").options;
	for (var i = 0; i < o.length; i++) {
		var match = (term == "") || (o[i].text.toLowerCase().indexOf(term) >= 0) || (o[i].value.toLowerCase() == term);
		o[i].hidden = !match;
		if (!match) {
			o[i].selected = false;
		}
	}
}

function kl_load() {
	if (settings["keyboardLayoutsList"] != undefined) {
		var a = JSON.parse(settings["keyboardLayoutsList"]);
		if (a.length > 0) {
			document.getElementById("sl").removeChild(document.getElementById("sl").options[0]);
			for (var i = 0; i < a.length; i++) {
				var opt = document.createElement("option");
				opt.text = a[i].name;
				opt.value = a[i].value;
				if (a[i].value != undefined) {
					document.getElementById("sl").options.add(opt);
				}
			}
		}
	}
}

function kl_remove() {
	var o = document.getElementById("sl").options;
	if (o.length > 1) {
		for (var i = 0; i < o.length; i++) {
			if (o[i].selected) {
				document.getElementById("sl").removeChild(o[i]);
			}
		}
	}
	kl_save();
}

// Keyboard mode buttons: they set the hidden keyboardEnabled select, which saves the setting.
function initModeButtons() {
	var select = document.getElementById("keyboardEnabled");
	var buttons = document.querySelectorAll("#keyboardModes button");
	function sync() {
		buttons.forEach(function (b) {
			var on = b.getAttribute("data-mode") == select.value;
			b.classList.toggle("active", on);
			b.setAttribute("aria-checked", on ? "true" : "false");
		});
	}
	buttons.forEach(function (b) {
		b.addEventListener("click", function () {
			if (select.value != b.getAttribute("data-mode")) {
				select.value = b.getAttribute("data-mode");
				select.dispatchEvent(new Event("change"));
			}
			sync();
		}, false);
	});
	sync();
}

var previewDefaultHelp = "Point at a setting to see what it changes.";

function previewWindow() {
	var frame = document.getElementById("preview");
	return (frame && frame.contentWindow && frame.contentWindow.vkPreviewUpdate) ? frame.contentWindow : null;
}

// The preview renders a 960px-tall screen; only the part from the field down is shown, which
// grows with the keyboard size setting. The screen is at least 1000px wide, and wider at large
// sizes, where the keys need about 760px per 100% to fit.
var previewTop = 420;
var previewWidth = 1000;

function scalePreview() {
	var holder = document.getElementById("previewFrame");
	var scale = holder.clientWidth / previewWidth;
	document.getElementById("preview").style.width = previewWidth + "px";
	document.getElementById("preview").style.transform = "scale(" + scale + ") translateY(" + (-previewTop) + "px)";
	holder.style.height = Math.round((960 - previewTop) * scale) + "px";
}

function updatePreview() {
	var win = previewWindow();
	if (win == null) {
		return;
	}
	var chosen = document.getElementById("sl").options;
	var zoom = parseFloat(document.getElementById("zoomLevel").value);
	previewWidth = (!document.getElementById("smallKeyboard").checked && (zoom >= 0.3)) ? Math.max(1000, Math.ceil(760 * zoom)) : 1000;
	scalePreview();
	return win.vkPreviewUpdate({
		layout: chosen.length > 0 ? chosen[0].value : "en",
		small: document.getElementById("smallKeyboard").checked,
		zoom: document.getElementById("zoomLevel").value,
		urlButton: document.getElementById("urlButton").checked,
		mode: document.getElementById("keyboardEnabled").value
	}).then(function (top) {
		previewTop = top;
		scalePreview();
	});
}

function showPreviewHelp(row) {
	var win = previewWindow();
	document.querySelectorAll("[data-help].active").forEach(function (r) {
		r.classList.remove("active");
	});
	if (row != null) {
		row.classList.add("active");
	}
	document.getElementById("previewHelp").textContent = row != null ? row.getAttribute("data-help") : previewDefaultHelp;
	if (win != null) {
		win.vkPreviewHighlight(row != null ? row.getAttribute("data-preview") : null);
	}
}

function initPreview() {
	scalePreview();
	new ResizeObserver(scalePreview).observe(document.getElementById("previewFrame"));
	var frame = document.getElementById("preview");
	if (previewWindow() != null) {
		updatePreview();
	}
	frame.addEventListener("load", updatePreview, false);
	document.getElementById("zoomLevel").addEventListener("input", slider_zoom, false);
	document.getElementById("refreshTime").addEventListener("input", slider_refreshTime, false);
	document.getElementById("autoTriggerAfter").addEventListener("input", slider_autoTriggerAfter, false);
	document.querySelectorAll("[data-help]").forEach(function (row) {
		row.addEventListener("mouseenter", function () { showPreviewHelp(row); }, false);
		row.addEventListener("focusin", function () { showPreviewHelp(row); }, false);
		row.addEventListener("mouseleave", function () { showPreviewHelp(null); }, false);
	});
}

// Closes this tab, or goes back when it is the window's only tab so a kiosk-mode browser stays open.
async function closeOptions() {
	var tab = await chrome.tabs.getCurrent();
	if (tab != undefined) {
		var tabs = await chrome.tabs.query({ windowId: tab.windowId });
		if (tabs.length > 1) {
			chrome.tabs.remove(tab.id);
			return;
		}
	}
	if (history.length > 1) {
		history.back();
	} else {
		window.close();
	}
}

window.addEventListener('load', async function () {
	document.getElementById("closeOptions").addEventListener("click", closeOptions, false);
	Object.assign(settingsCache, await chrome.storage.local.get(null));
	document.body.className = "loaded";
	kl_sort();
	kl_load();
	document.getElementById("kl_remove").addEventListener("click", kl_remove, false);
	document.getElementById("kl_add").addEventListener("click", kl_add, false);
	document.getElementById("al").addEventListener("dblclick", kl_add, false);
	document.getElementById("sl").addEventListener("dblclick", kl_remove, false);
	document.getElementById("layoutSearch").addEventListener("input", kl_search, false);
	var c = document.getElementsByClassName("setting");
	for (var i = 0; i < c.length; i++) {
		var sk = c[i].getAttribute("_setting");
		if (c[i].getAttribute("type") == "checkbox") {
			if ((settings[sk] == undefined) && (c[i].getAttribute("_default") != undefined)) {
				settings[sk] = c[i].getAttribute("_default");
			}
			if (settings[sk] == "true") {
				c[i].checked = true;
			}
		} else if (settings[sk] != undefined) {
			// Unsaved settings keep the default from the field's value attribute.
			c[i].value = settings[sk];
		}
		c[i].onchange = function () {
			var skey = this.getAttribute("_setting");
			if (this.getAttribute("type") == "checkbox") {
				if ((settings[skey] == undefined) && (this.getAttribute("_default") != undefined)) {
					settings[skey] = this.getAttribute("_default");
				}
				settings[skey] = this.checked ? "true" : "false";
			} else {
				settings[skey] = this.value;
			}
			document.getElementById("changeEffect").className = "show";
			if (this.getAttribute("_changed") != undefined) {
				callFunc(this.getAttribute("_changed"));
			}
			updatePreview();
		}
		if (c[i].getAttribute("_changed") != undefined) {
			callFunc(c[i].getAttribute("_changed"));
		}
	}
	initModeButtons();
	initPreview();
}, false);

function callFunc(callback) {
	window[callback]();
}

function slider_zoom() {
	updatePreview();
	var v = document.getElementById("zoomLevel").value;
	if (v < 0.3) { v = "Auto"; } else { v = (v * 100).toFixed(0) + "%"; }
	document.getElementById("zoomLevelValue").innerHTML = v;
}

function checkbox_smallKeyboard() {
	var s = document.getElementById("smallKeyboard").checked;
	document.getElementById("zoomLevelLabel").style.display = s ? "none" : "";
}

function checkbox_touchEvents() {
	var s = document.getElementById("touchEvents").checked;
	document.getElementById("autoTriggerPH").style.display = s ? "none" : "";
}

function slider_refreshTime() {
	var v = parseInt(document.getElementById("refreshTime").value, 10);
	document.getElementById("refreshTimeValue").textContent = v >= 1000 ? (v / 1000) + " sec" : v + " ms";
}

function slider_autoTriggerAfter() {
	var v = document.getElementById("autoTriggerAfter").value + " sec";
	document.getElementById("autoTriggerAfterValue").innerHTML = v;
}

function checkbox_autoTrigger() {
	var s = !document.getElementById("autoTrigger").checked;
	document.getElementById("autoTriggerOnPH").style.display = s ? "none" : "";
}
