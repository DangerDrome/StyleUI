# StyleUI

A lightweight, modular UI component library with zero dependencies.

[![npm version](https://img.shields.io/npm/v/styleui-components.svg)](https://www.npmjs.com/package/styleui-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

StyleUI provides a comprehensive set of UI components built with vanilla JavaScript and CSS. Each component is carefully crafted to be accessible, performant, and easy to integrate into any web project.

## Quick Start

### Option 1: CDN (Easiest)
```html
<!-- Include CSS and JS bundles -->
<link rel="stylesheet" href="https://unpkg.com/styleui-components@latest/dist/styleui.css">
<script src="https://unpkg.com/styleui-components@latest/dist/styleui.min.js"></script>

<!-- Use components -->
<script>
  const button = UI.button({ text: 'Click Me', variant: 'primary' });
  document.body.appendChild(button);
</script>
```

### Option 2: NPM Installation
```bash
npm install styleui-components
```

Then in your JavaScript:
```javascript
// CommonJS
const { button, modal, toast } = require('styleui-components');

// ES Modules (with bundler)
import { button, modal, toast } from 'styleui-components';

// Use the components
const btn = button({ text: 'Click Me', variant: 'primary' });
document.querySelector('#app').appendChild(btn);
```

### Option 3: Download
Download the latest release from [GitHub](https://github.com/styleui/styleui/releases) or get individual files from the `dist/` directory.

## Project Structure

```
StyleUI/
├── dist/         — Pre-built bundles for production use
│   ├── styleui.js       — Full library
│   ├── styleui.min.js   — Minified version (64KB)
│   ├── styleui.css      — All styles bundled
│   └── styleui.esm.js   — ES module exports
├── css/          — Modular stylesheets
├── components/   — Individual component files
├── sections/     — Demo page content generators
├── panels/       — Demo UI shell (not for production)
├── API.md        — Complete API documentation
├── package.json  — NPM package configuration
└── index.html    — Live demo and style guide
```

### 1. `css/`  – fully modular styles
* **Foundations**: `variables.css`, `base.css`, `typography.css`, `animations.css`  
  Define design-tokens, resets, keyframes.
* **Components**: one file per part (`button.css`, `card.css`, `panel.css`, …).  
  No cross-file duplication.
* **Utilities / layout**: `grid.css`, `scrollbars.css`, `mobile.css`, `patterns.css`, etc.

> Tip: import any subset in any order; component sheets rely only on the variables file.

### 2. `components/` – reusable JS widgets
Each file is an IIFE that attaches a single factory to the global `UI` namespace (e.g. `UI.button`, `UI.toast`).  No DOM work happens automatically; functions return elements so consumers decide placement.

Shared helpers (`UI.buildClasses`, `UI.icons`, `UI.deferIcons`, config constants) live in `components/core.js`.

### 3. `sections/` – demo generators
Files under `sections/` create `<section>` elements that showcase a component group (buttons, cards, grid …). They import only the public `UI.*` factories—no side effects outside the demo container.

### 4. `panels/` – demo chrome
JavaScript that controls the left nav, header, right settings panel, and footer quick-settings. These are purely for the style-guide shell and are **not** part of the production library.

### 5. `index.html`
A static file referencing everything above *with relative paths* (no build step required). Open directly via `file://` or serve with any static server.

## Developing / extending
1. Add new tokens → `css/variables.css`
2. Build a component
   * CSS in `css/<component>.css`
   * JS factory in `components/<component>.js` returning an element
3. Showcase it
   * Create `sections/<component>s.js` that calls the factory and appends a demo panel.
4. Reference new files in `index.html` (keep alphabetical order).

## Available Components

- **Buttons** - Standard, icon, toggle, and cycle buttons
- **Cards** - Flexible content containers with headers and actions
- **Forms** - Complete form controls including inputs, selects, checkboxes, date pickers
- **Modals** - Accessible modal dialogs with customizable actions
- **Toasts** - Non-blocking notifications with auto-dismiss
- **Menus** - Context menus and dropdowns
- **Panels** - Collapsible panels for content organization
- **Trees** - Hierarchical tree views with expand/collapse
- **Timeline** - Event timeline visualization
- **Video Player** - Custom video player with controls
- **Markdown Editor** - Live markdown editing with preview
- **And more...** - Tooltips, progress bars, spinners, tags

## API Example

```javascript
// Create a button
const saveBtn = UI.button({
    text: 'Save Changes',
    icon: 'save',
    variant: 'primary',
    onclick: () => handleSave()
});

// Show a toast notification
UI.toast('Changes saved successfully', { type: 'success' });

// Open a modal
const { modal, close } = UI.modal({
    title: 'Confirm Delete',
    content: 'This action cannot be undone.',
    actions: [
        { text: 'Cancel', variant: 'neutral' },
        { text: 'Delete', variant: 'error', onclick: () => performDelete() }
    ]
});
```

## Installation & Usage

### CDN Links
```html
<!-- Latest version -->
<link rel="stylesheet" href="https://unpkg.com/styleui-components@latest/dist/styleui.css">
<script src="https://unpkg.com/styleui-components@latest/dist/styleui.min.js"></script>

<!-- Specific version -->
<link rel="stylesheet" href="https://unpkg.com/styleui-components@0.1.0/dist/styleui.css">
<script src="https://unpkg.com/styleui-components@0.1.0/dist/styleui.min.js"></script>
```

### Package Info
- **NPM**: [styleui-components](https://www.npmjs.com/package/styleui-components)
- **CDN**: [unpkg.com/styleui-components](https://unpkg.com/browse/styleui-components/)
- **Size**: 65KB minified JS + 80KB CSS
- **Dependencies**: None

## Documentation

- **[API.md](API.md)** - Complete API reference with examples
- **[Live Demo](index.html)** - Interactive component showcase
- **Zero Dependencies** - No external libraries required
- **Modern JavaScript** - ES6+ with no transpilation needed
- **Customizable** - CSS variables for easy theming

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers with ES6 support

## License

MIT

---
Questions or contributions? open an issue on the main repository. 