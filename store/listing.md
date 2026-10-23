# Chrome Web Store listing — Virtual Keyboard 2.0.0

## Name
Virtual Keyboard

## Summary (132 characters max)
On-screen keyboard for touch screens and kiosks. Types into any field, including rich text editors. 15 layouts, dark mode.

## Category
Accessibility

## Description

Virtual Keyboard puts a full on-screen keyboard on every web page, made for touch screens, tablets, kiosks and info points where there's no physical keyboard.

Tap any text field and the keyboard slides up. Tap Enter to submit, or the close key to put it away.

WORKS EVERYWHERE YOU TYPE
• Normal text, search, email, URL and password fields
• Rich text editors: Quill, CKEditor 5, TinyMCE, ProseMirror / Tiptap, Lexical and other contenteditable editors
• Editors and forms inside frames, including frames from other sites
• Apps built with Vue, React, Ionic and other frameworks: they see real input events, so their data stays in sync
• Fields added to the page after it loads

KEYBOARDS FOR EVERY TASK
• Full-width keyboard, or a smaller floating keyboard you can drag anywhere
• Number pad for phone and number fields, and an @ key for email fields
• Numbers and symbols panel
• 15 layouts: English, French, German, Italian, Spanish, Polish, Czech, Hungarian, Norwegian, Swedish, Slovenian, Russian, Ukrainian, Korean and Tamil, with accented letters on press-and-hold
• Switch layouts from the keyboard's menu

BUILT FOR KIOSKS AND TOUCH SCREENS
• Auto, toggle (tap the keyboard icon next to a field) or off, from the toolbar button or settings
• Intelligent scrolling keeps the field you're typing in above the keyboard, including inside dialogs
• Optional URL bar for entering web addresses on browsers with no visible address bar
• Optional hover-to-click for pointer-only setups
• A close button on the settings page, for kiosk mode
• Settings take effect straight away, without reloading the page

EASY TO SET UP
• A live keyboard preview on the settings page shows what each option changes as you point at it
• Search the layout list and add layouts with a double-click

LOOKS RIGHT
• Settings and toolbar popup follow your system's light or dark theme
• Optional hardware acceleration and zoom for large screens

PRIVATE BY DESIGN
Virtual Keyboard does not collect, store or send anything you type. Settings are kept in Chrome's local extension storage on your device.
Privacy policy: https://github.com/xontab/chrome-virtual-keyboard/blob/master/PRIVACY.md

## What's new in 2.0.0
• Rebuilt for Manifest V3
• Types into rich text editors (Quill, CKEditor 5, TinyMCE, ProseMirror, Lexical) and frames from other sites
• Works with Vue, Ionic and other framework-bound fields
• Fixed: cloned and dynamically added fields not getting the keyboard
• Fixed: number panel overflowing on portrait screens
• Fixed: intelligent scroll leaving blank space and not working in dialogs
• Fixed: small keyboard could not be dragged in touch mode
• Fixed: settings button in the keyboard, and the keyboard closing when changing layout
• Fixed: URL bar on sites with a strict Content Security Policy
• Fixed: French "n" key and a missing "=" key
• New: redesigned settings page with a live keyboard preview, layout search, dark mode and a close button for kiosks
• New: settings apply without reloading the page
• New icon

## Privacy practices tab

**Single purpose:** Show an on-screen keyboard that types into text fields on web pages, for devices without a physical keyboard.

**Permission justifications**
- `storage`: saves the user's keyboard settings (layouts, mode, size, position) on the device.
- `offscreen`: used once after updating from version 1.x, to copy settings saved by the old version into the new storage.
- Content scripts on all sites (`<all_urls>`): the keyboard has to appear on, and type into, whichever page the user is on, including editors inside frames.

**Remote code:** No. All code is bundled with the extension.

**Privacy policy URL:** https://github.com/xontab/chrome-virtual-keyboard/blob/master/PRIVACY.md

**Data usage:** The extension does not collect or transmit any user data. Certify: does not sell or transfer user data to third parties, does not use it for unrelated purposes, does not use it for creditworthiness or lending.

## Assets in this folder
| File | Store slot | Size |
| --- | --- | --- |
| `../images/icon-128.png` | Store icon | 128×128 |
| `screenshot-1-rich-text-1280x800.png` | Screenshot 1 | 1280×800 |
| `screenshot-2-floating-keyboard-1280x800.png` | Screenshot 2 | 1280×800 |
| `screenshot-3-number-pad-1280x800.png` | Screenshot 3 | 1280×800 |
| `screenshot-4-settings-dark-1280x800.png` | Screenshot 4 | 1280×800 |
| `promo-small-440x280.png` | Small promo tile | 440×280 |
| `promo-marquee-1400x560.png` | Marquee promo tile | 1400×560 |
