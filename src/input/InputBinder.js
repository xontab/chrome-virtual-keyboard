// Input Binder
// Detects and binds event handlers to input elements

import { INPUT_TYPES } from "../core/config.js";
import { EVENTS, emit } from "../core/events.js";
import { focusState } from "../core/state.js";

const BOUND_ATTR = "data-vk-enabled";

/**
 * Check if an element is a supported input type
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isSupportedInput(element) {
  if (!element || !element.nodeName) return false;

  const nodeName = element.nodeName.toUpperCase();

  if (nodeName === "INPUT") {
    return INPUT_TYPES.includes(element.type);
  }

  if (nodeName === "TEXTAREA") {
    return true;
  }

  // Contenteditable elements
  if (
    element.getAttribute?.("role") === "textbox" ||
    element.getAttribute?.("contenteditable") === "true"
  ) {
    return true;
  }

  return false;
}

/**
 * Get the input type category
 * @param {HTMLElement} element
 * @returns {'input'|'textarea'|'contenteditable'}
 */
export function getInputType(element) {
  const nodeName = element.nodeName.toUpperCase();

  if (nodeName === "TEXTAREA") {
    return "textarea";
  }

  if (
    element.getAttribute?.("role") === "textbox" ||
    element.getAttribute?.("contenteditable") === "true"
  ) {
    return "contenteditable";
  }

  return "input";
}

/**
 * Check if element is already bound
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isBound(element) {
  return element.getAttribute(BOUND_ATTR) === "true";
}

/**
 * Mark element as bound
 * @param {HTMLElement} element
 */
function markBound(element) {
  element.setAttribute(BOUND_ATTR, "true");
}

/**
 * Bind keyboard events to an input element
 * @param {HTMLElement} element
 */
export function bindInput(element) {
  if (!element || isBound(element)) return;

  const inputType = getInputType(element);

  // Blur handler - fires change event and starts close timer
  element.addEventListener("blur", () => handleBlur(element));

  // Pointer down - record click position for scrolling
  element.addEventListener("pointerdown", (e) => handlePointerDown(e));

  // Focus handler - always opens keyboard
  element.addEventListener("focus", () =>
    handleFocus(element, inputType, true)
  );

  // Click handler - opens keyboard if not already open
  element.addEventListener("click", () =>
    handleFocus(element, inputType, false)
  );

  markBound(element);

  // If element is already focused (e.g., programmatic focus before binding),
  // trigger the keyboard immediately
  const doc = element.ownerDocument || document;
  if (doc.activeElement === element) {
    handleFocus(element, inputType, true);
  }
}

/**
 * Handle input blur
 * @param {HTMLElement} element
 */
function handleBlur(element) {
  emit(EVENTS.INPUT_BLUR, element);
}

/**
 * Handle pointer down on input
 * @param {PointerEvent} event
 */
function handlePointerDown(event) {
  focusState.set({
    clickY: event.clientY,
    clickX: event.clientX,
  });
}

/**
 * Handle input focus/click
 * @param {HTMLElement} element
 * @param {'input'|'textarea'|'contenteditable'} inputType
 * @param {boolean} isFocus - true for focus event, false for click
 */
function handleFocus(element, inputType, isFocus) {
  if (element.disabled || element.readOnly) return;

  emit(EVENTS.INPUT_FOCUS, {
    element,
    inputType,
    isFocus,
  });
}

/**
 * Bind all inputs in a container
 * @param {HTMLElement|Document|ShadowRoot} container
 */
export function bindAllInputs(container = document) {
  const selector =
    'input, textarea, [contenteditable="true"], [role="textbox"]';
  const elements = container.querySelectorAll(selector);

  for (const element of elements) {
    if (isSupportedInput(element)) {
      bindInput(element);
    }
  }
}

/**
 * Process a node that was added to the DOM
 * @param {Node} node
 */
export function processAddedNode(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  // Check if this node itself is an input
  if (isSupportedInput(node)) {
    bindInput(node);
  }

  // Check children
  if (node.querySelectorAll) {
    bindAllInputs(node);
  }
}

/**
 * Handle document-level focus events as a fallback
 * This catches inputs that weren't bound by MutationObserver
 * @param {FocusEvent} event
 */
function handleDocumentFocus(event) {
  const element = event.target;
  if (!element || !isSupportedInput(element)) return;

  // If not bound, bind it now and trigger focus explicitly
  // (bindInput's activeElement check may not work reliably across all contexts)
  if (!isBound(element)) {
    bindInput(element);
    const inputType = getInputType(element);
    handleFocus(element, inputType, true);
  }
}

/**
 * Start listening for document-level focus events
 * Acts as a fallback for inputs missed by MutationObserver
 * @param {Document} doc
 */
export function startDocumentFocusListener(doc = document) {
  // Use focusin which bubbles, so activeElement is set when we check
  doc.addEventListener("focusin", handleDocumentFocus);
}

export default {
  isSupportedInput,
  getInputType,
  isBound,
  bindInput,
  bindAllInputs,
  processAddedNode,
  startDocumentFocusListener,
};
