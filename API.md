# StyleUI API Guide

StyleUI is a lightweight, modular UI component library with zero dependencies. This guide shows how to integrate StyleUI into your projects.

## Quick Start

### Option 1: Include Individual Files
```html
<!-- CSS -->
<link rel="stylesheet" href="path/to/styleui/css/variables.css">
<link rel="stylesheet" href="path/to/styleui/css/base.css">
<link rel="stylesheet" href="path/to/styleui/css/button.css">
<!-- Include other component CSS as needed -->

<!-- JavaScript -->
<script src="path/to/styleui/components/core.js"></script>
<script src="path/to/styleui/components/button.js"></script>
<!-- Include other components as needed -->
```

### Option 2: Use the Bundle
```html
<!-- All StyleUI CSS and JS in one file -->
<link rel="stylesheet" href="path/to/styleui/dist/styleui.css">
<script src="path/to/styleui/dist/styleui.min.js"></script>
```

### Option 3: ES Modules
```html
<script src="path/to/styleui/dist/styleui.js"></script>
<script type="module">
  import { button, modal, toast } from './path/to/styleui/styleui.esm.js';
  
  const btn = button({ text: 'Click Me', variant: 'primary' });
  document.body.appendChild(btn);
</script>
```

## Component API

All components follow a consistent pattern:
- Factory functions that return DOM elements
- Configuration object as parameter
- No side effects - you control where elements are inserted

### Button
```javascript
// Basic button
const btn = UI.button({ text: 'Click Me' });

// Advanced options
const btn = UI.button({
    text: 'Save',
    icon: 'save',
    variant: 'success',    // primary, success, warning, error, info
    size: 'lg',           // sm, lg
    onclick: () => console.log('Clicked!'),
    disabled: false
});

// Icon-only button
const iconBtn = UI.button({ icon: 'settings' });

// Toggle button
const toggle = UI.iconToggle({
    iconOn: 'eye',
    iconOff: 'eye-off',
    onchange: (isOn) => console.log('Toggled:', isOn)
});
```

### Modal
```javascript
const { modal, close } = UI.modal({
    title: 'Confirm Action',
    content: 'Are you sure?',
    actions: [
        { text: 'Cancel', variant: 'neutral' },
        { text: 'Confirm', variant: 'primary', onclick: () => handleConfirm() }
    ]
});
```

### Toast
```javascript
// Simple toast
UI.toast('File saved successfully', { type: 'success' });

// With options
UI.toast('Error uploading file', {
    type: 'error',
    duration: 8000,
    action: {
        text: 'Retry',
        onclick: () => retryUpload()
    }
});
```

### Form Controls
```javascript
// Input field
const input = UI.input({
    type: 'email',
    placeholder: 'Enter email',
    value: 'user@example.com'
});

// Complete form field with label
const field = UI.field({
    label: 'Username',
    type: 'text',
    required: true,
    helper: 'Choose a unique username'
});

// Checkbox
const checkbox = UI.checkbox({
    label: 'I agree to the terms',
    checked: false,
    onchange: (checked) => console.log('Agreed:', checked)
});
```

### Card
```javascript
const card = UI.card({
    title: 'Welcome',
    content: '<p>Hello, world!</p>',
    icon: 'home',
    footer: UI.button({ text: 'Get Started', variant: 'primary' }),
    actions: [
        { icon: 'settings', onclick: () => showSettings() },
        { icon: 'x', onclick: () => removeCard() }
    ]
});
```

## Utilities

### Icon Management
```javascript
// Initialize/refresh Lucide icons
UI.icons();

// Defer icon initialization (for dynamically added content)
UI.deferIcons();
```

### Theme Management
```javascript
// Get current theme
const theme = UI.theme.get(); // 'light' or 'dark'

// Set theme
UI.theme.set('dark');

// Toggle theme
UI.theme.toggle();
```

### CSS Class Builder
```javascript
// Build class string from conditionals
const className = UI.buildClasses(
    'btn',
    isPrimary && 'btn-primary',
    isLarge && 'btn-lg',
    customClass
);
// Result: "btn btn-primary btn-lg custom-class"
```

## Integration Examples

### React Component Wrapper
```jsx
import { button } from './styleui.esm.js';

function Button({ text, variant, onClick, ...props }) {
    const ref = useRef(null);
    
    useEffect(() => {
        const btn = button({ text, variant, onclick: onClick });
        ref.current.appendChild(btn);
        
        return () => btn.remove();
    }, [text, variant, onClick]);
    
    return <div ref={ref} {...props} />;
}
```

### Vue 3 Integration
```javascript
import { button } from './styleui.esm.js';

export default {
    props: ['text', 'variant'],
    mounted() {
        const btn = button({
            text: this.text,
            variant: this.variant,
            onclick: () => this.$emit('click')
        });
        this.$el.appendChild(btn);
    }
}
```

### jQuery Plugin
```javascript
$.fn.styleuiButton = function(options) {
    return this.each(function() {
        const btn = UI.button(options);
        $(this).empty().append(btn);
    });
};

// Usage
$('#myButton').styleuiButton({ text: 'Click Me', variant: 'primary' });
```

## CDN Usage

For quick prototyping, you can load StyleUI from a CDN:

```html
<!-- Replace VERSION with the desired version -->
<link rel="stylesheet" href="https://unpkg.com/styleui@VERSION/dist/styleui.css">
<script src="https://unpkg.com/styleui@VERSION/dist/styleui.min.js"></script>
```

## NPM Installation

```bash
npm install styleui
```

Then import in your JavaScript:
```javascript
import UI from 'styleui';
// or
import { button, modal } from 'styleui';
```

## Browser Support

StyleUI uses modern JavaScript features (ES6+) and CSS custom properties. It works in all modern browsers:
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT