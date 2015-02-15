function kl_add() {
	var o = document.getElementById("al").options;
	for (var i=0; i<o.length; i++) {
		if (o[i].selected) {
			var opt = document.createElement("option");
		    opt.text = o[i].innerHTML;
			opt.value = o[i].value;
			var os = document.getElementById("sl").options;
			var exists = false;
			for (var i2=0; i2<os.length; i2++) {
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
	for (var i=0; i<o.length; i++) {
		if (o[i].value != undefined) {
			a.push({ value: o[i].value, name: o[i].innerHTML });
		}
	}
	localStorage["keyboardLayoutsList"] = JSON.stringify(a);
	localStorage["keyboardLayout1"] = a[0].value;
	document.getElementById("changeEffect").className = "show";
}
function kl_load() {
	if (localStorage["keyboardLayoutsList"] != undefined) {
		var a = JSON.parse(localStorage["keyboardLayoutsList"]);
		if (a.length > 0) {
			document.getElementById("sl").removeChild(document.getElementById("sl").options[0]);
			for (var i=0; i<a.length; i++) {
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
		for (var i=0; i<o.length; i++) {
			if (o[i].selected) {
				document.getElementById("sl").removeChild(o[i]);
			}
		}
	}
	kl_save();
}
window.addEventListener('load', function() {
	document.body.className = "loaded";
	kl_load();
	document.getElementById("kl_remove").addEventListener("click", kl_remove, false);
	document.getElementById("kl_add").addEventListener("click", kl_add, false);
	var c = document.getElementsByClassName("setting");
	for (var i=0; i<c.length; i++) {
		var sk = c[i].getAttribute("_setting");	
		if (c[i].getAttribute("type") == "checkbox") {
			if ((localStorage[sk] == undefined) && (c[i].getAttribute("_default") != undefined)) {
				localStorage[sk] = c[i].getAttribute("_default");
			}
			if (localStorage[sk] == "true") {
				c[i].checked = true;
			}
		} if (c[i].getAttribute("type") == "range") {
			if (localStorage[sk] == undefined) {
				c[i].value = 0;	
			} else {
				c[i].value = localStorage[sk];	
			}
		} else {
			c[i].value = localStorage[sk];	
		}
		c[i].onchange = function() {
			var skey = this.getAttribute("_setting");	
			if (this.getAttribute("type") == "checkbox") {
				if ((localStorage[skey] == undefined) && (this.getAttribute("_default") != undefined)) {
					localStorage[skey] = this.getAttribute("_default");
				}
				localStorage[skey] = this.checked ? "true" : "false";
			} else {
				localStorage[skey] = this.value;
			}
			document.getElementById("changeEffect").className = "show";
			if (this.getAttribute("_changed") != undefined) {
				callFunc(this.getAttribute("_changed"));
			}
		}
		if (c[i].getAttribute("_changed") != undefined) {
			callFunc(c[i].getAttribute("_changed"));
		}
	}
}, false);

function callFunc(callback) {
	eval(callback)();
}

function slider_zoom() {
	var v = document.getElementById("zoomLevel").value;
	if (v < 0.3) { v = "Auto"; } else { v = (v*100).toFixed(0)+"%"; }
	document.getElementById("zoomLevelValue").innerHTML = v;
}

function checkbox_smallKeyboard() {
	var s = document.getElementById("smallKeyboard").checked;
	document.getElementById("zoomLevelLabel").style.display = s ? "none" : "block";
}

function checkbox_touchEvents() {
	var s = document.getElementById("touchEvents").checked;
	document.getElementById("autoTriggerPH").style.display = s ? "none" : "block";
}

function slider_autoTriggerAfter() {
	var v = document.getElementById("autoTriggerAfter").value+" sec";
	document.getElementById("autoTriggerAfterValue").innerHTML = v;
}

function checkbox_autoTrigger() {
	var s = !document.getElementById("autoTrigger").checked;
	document.getElementById("autoTriggerOnPH").style.display = s ? "none" : "block";
}
