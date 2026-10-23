// Runs in the page's own JavaScript world (manifest "world": "MAIN").
// script.js runs in an isolated world, where properties added to an event are invisible to the
// page. Editors such as CKEditor 5 read beforeinput.getTargetRanges(), which is empty on a
// synthetic event, so script.js asks this script to dispatch beforeinput with target ranges.
// The request is a cancelable "virtualkeyboard-beforeinput" event on the edited element; it is
// cancelled when the editor cancelled the beforeinput, meaning the editor made the edit itself.
window.addEventListener("virtualkeyboard-beforeinput", function (request) {
    request.stopImmediatePropagation();
    var target = request.composedPath()[0];
    var detail = JSON.parse(request.detail);
    var ev = new InputEvent("beforeinput", { inputType: detail.inputType, data: detail.data, bubbles: true, cancelable: true, composed: true });
    if (detail.contentEditable) {
        var ranges = [];
        var sel = target.ownerDocument.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0).cloneRange();
            if ((detail.inputType == "deleteContentBackward") && range.collapsed &&
                (range.startContainer.nodeType == Node.TEXT_NODE) && (range.startOffset > 0)) {
                // The character before the caret, without moving the selection (editors such as
                // ProseMirror react to selection changes). Surrogate pairs count as one character.
                var text = range.startContainer.data;
                var start = range.startOffset - 1;
                if ((start > 0) && /[\uDC00-\uDFFF]/.test(text[start]) && /[\uD800-\uDBFF]/.test(text[start - 1])) {
                    start--;
                }
                range.setStart(range.startContainer, start);
            }
            ranges.push(new StaticRange({ startContainer: range.startContainer, startOffset: range.startOffset, endContainer: range.endContainer, endOffset: range.endOffset }));
        }
        ev.getTargetRanges = function () { return ranges; };
    }
    if (!target.dispatchEvent(ev)) {
        request.preventDefault();
    }
}, true);
