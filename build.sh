#!/bin/sh
# Packages the extension for the Chrome Web Store: dist/virtual-keyboard-<version>.zip, with
# manifest.json at the root and only the files the extension uses (no store assets or docs).
set -e
cd "$(dirname "$0")"

VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
OUT="dist/virtual-keyboard-$VERSION.zip"

FILES="manifest.json LICENSE
background.js migrate.html migrate.js
script.js page-input.js style.css keyboard.html
options.html options/script.js options/styles.css
preview.html preview.js preview.css
toggle.html toggle.js
images/icon-small.svg"

mkdir -p dist
rm -f "$OUT"
zip -q -X "$OUT" $FILES layouts/*.html icons/*.png images/*.png

# Every file the manifest refers to must be in the package.
python3 - "$OUT" <<'EOF'
import fnmatch, json, sys, zipfile
names = set(zipfile.ZipFile(sys.argv[1]).namelist())
m = json.load(open("manifest.json"))
paths = list(m["icons"].values()) + list(m["action"]["default_icon"].values())
paths += [m["background"]["service_worker"], m["options_page"], m["action"]["default_popup"]]
paths += [js for cs in m["content_scripts"] for js in cs["js"]]
missing = [p for p in paths if p not in names]
for pattern in m["web_accessible_resources"][0]["resources"]:
    if not fnmatch.filter(names, pattern):
        missing.append(pattern)
if missing:
    sys.exit("Missing from package: " + ", ".join(missing))
EOF

echo "$OUT ($(du -h "$OUT" | cut -f1 | tr -d ' '))"
