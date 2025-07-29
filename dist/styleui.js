/*! 
 * StyleUI - Lightweight UI Component Library
 * License: MIT
 */
(function() {
    'use strict';

    // --- core.js ---

    'use strict';

    // Configuration constants
    const CONFIG = {
        TOAST_DURATION: 5000,
        MODAL_ANIMATION_DURATION: 200,
        MENU_ANIMATION_DURATION: 150,
        TOOLTIP_MARGIN: 12,
        POPOVER_MARGIN: 8,
        MOBILE_BREAKPOINT: 768,
        ACCENT_COLORS: [
            { name: 'primary', color: 'var(--primary)' },
            { name: 'success', color: 'var(--success)' },
            { name: 'warning', color: 'var(--warning)' },
            { name: 'error', color: 'var(--error)' },
            { name: 'info', color: 'var(--info)' },
            { name: 'neutral', color: 'var(--neutral)' }
        ],
        TOAST_ICONS: {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        }
    };

    // --- Main UI Object Definition ---
    const UI = {
        // Initialize icons after adding elements
        icons() {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({ class: 'lucide' });
                const savedStrokeWidth = localStorage.getItem('styleui-stroke-width');
                if (savedStrokeWidth) {
                    document.querySelectorAll('.lucide').forEach(icon => {
                        icon.style.strokeWidth = savedStrokeWidth;
                    });
                }
            }
        },

        // Defer icon initialization
        deferIcons() {
            setTimeout(() => this.icons(), 0);
        },

        // Build CSS class string from array
        buildClasses(...classes) {
            return classes.filter(Boolean).join(' ');
        },

        // Theme management
        theme: {
            set(theme) {
                document.body.classList.toggle('dark', theme === 'dark');
                localStorage.setItem('styleui-theme', theme);
            },
            get() {
                return document.body.classList.contains('dark') ? 'dark' : 'light';
            },
            toggle() {
                const newTheme = this.get() === 'dark' ? 'light' : 'dark';
                this.set(newTheme);
                return newTheme;
            }
        },

        language: {
            translations: {}, // Will be populated by a separate language file loader if needed
            set(lang) {
                document.documentElement.setAttribute('lang', lang);
                localStorage.setItem('styleui-lang', lang);
            },
            get() {
                return document.documentElement.getAttribute('lang') || 'en';
            },
            translate(text) {
                // In a real app, this would look up the text in the translations object.
                // For this style guide, we'll keep it simple.
                return text;
            }
        },
        
        // --- Sections Management ---
        sections: {
            // This will be populated by individual section scripts, e.g., UI.sections.buttons = ...
            createAll(sectionData) {
                const container = document.getElementById('sections-container');
                if (!container) {
                    console.error('Sections container not found.');
                    return;
                }

                sectionData.forEach(group => {
                    const groupHeader = document.createElement('h1');
                    groupHeader.className = 'group-header';
                    groupHeader.textContent = group.name;
                    groupHeader.id = `group-${group.name.toLowerCase().replace(/\s+/g, '-')}`;
                    container.appendChild(groupHeader);

                    group.children.forEach(sectionName => {
                        if (UI.sections[sectionName] && typeof UI.sections[sectionName] === 'function') {
                            const sectionElement = UI.sections[sectionName]();
                            if (sectionElement) {
                                sectionElement.id = `section-${sectionName}`;
                                container.appendChild(sectionElement);
                            }
                        } else {
                            console.error(`UI.sections.${sectionName} is not defined or not a function.`);
                        }
                    });
                });
            }
        }
    };

    // Expose to window
    window.UI = UI;
    window.CONFIG = CONFIG;

    // Auto-initialize theme from localStorage
    document.addEventListener('DOMContentLoaded', () => {
        const savedTheme = localStorage.getItem('styleui-theme');
        if (savedTheme) {
            UI.theme.set(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            UI.theme.set(prefersDark ? 'dark' : 'light');
        }
    });

})(); 
    // --- button.js ---

    if (!window.UI) window.UI = {};

    /**
     * Creates a button element.
     * @param {string} text - The text content of the button.
     * @param {object} [options={}] - The options for the button.
     * @param {string} [options.icon] - The Lucide icon name.
     * @param {string} [options.variant] - The color variant (e.g., 'primary', 'success').
     * @param {string} [options.size] - The size variant (e.g., 'sm', 'lg').
     * @param {boolean} [options.mono] - Whether to use a monospace font.
     * @param {string} [options.class] - Additional CSS classes.
     * @param {function} [options.onclick] - The click event handler.
     * @param {boolean} [options.disabled] - Whether the button is disabled.
     * @returns {HTMLButtonElement} The button element.
     */
    UI.button = function(config = {}) {
        // Support legacy call signature: UI.button(text, options)
        if (typeof config === 'string') {
            config = { text: config, ...arguments[1] };
        }

        const {
            text,
            icon,
            variant,
            size,
            mono,
            class: customClass,
            onclick,
            disabled,
            iconPosition = 'left'
        } = config;

        const btn = document.createElement('button');
        const isIconOnly = icon && !text;

        btn.className = UI.buildClasses(
            'btn',
            variant && `btn-${variant}`,
            size && `btn-${size}`,
            mono && 'font-mono',
            isIconOnly && 'icon-only',
            customClass
        );

        const textSpan = text ? document.createElement('span') : null;
        if (textSpan) {
            textSpan.textContent = text;
        }

        if (icon) {
            const iconEl = document.createElement('i');
            iconEl.setAttribute('data-lucide', icon);
            iconEl.className = 'lucide';

            if (iconPosition === 'right' && textSpan) {
                btn.appendChild(textSpan);
                btn.appendChild(iconEl);
            } else {
                btn.appendChild(iconEl);
                if (textSpan) {
                    btn.appendChild(textSpan);
                }
            }
        } else if (textSpan) {
            btn.appendChild(textSpan);
        }


        if (onclick) btn.onclick = onclick;
        if (disabled) btn.disabled = true;

        if (config.attributes) {
            for (const [key, value] of Object.entries(config.attributes)) {
                btn.setAttribute(key, value);
            }
        }

        UI.deferIcons();

        return btn;
    };

    /**
     * Creates a stateful icon toggle button.
     * @param {object} [options={}] - The options for the button.
     * @param {string} options.iconOn - The Lucide icon for the 'on' state.
     * @param {string} options.iconOff - The Lucide icon for the 'off' state.
     * @param {string} [options.tooltip] - Tooltip to display.
     * @param {function} [options.initialState] - Function that returns the initial state (true/false).
     * @param {function} [options.onchange] - Callback function when the state changes.
     * @returns {HTMLButtonElement} The button element.
     */
    UI.iconToggle = function(config = {}) {
        const {
            iconOn,
            iconOff,
            tooltip,
            initialState,
            onchange
        } = config;
        
        let isChecked = initialState ? initialState() : false;

        const btn = UI.button({
            icon: isChecked ? iconOff : iconOn,
            onclick: (e) => {
                isChecked = !isChecked;
                const button = e.currentTarget;
                const newIconName = isChecked ? iconOff : iconOn;
                
                button.innerHTML = `<i data-lucide="${newIconName}"></i>`;
                
                lucide.createIcons({
                    nodes: [button]
                });

                if (onchange) onchange(isChecked);
            }
        });

        if (tooltip) {
            UI.tooltip(btn, tooltip);
        }
        
        // Initial state action
        if (onchange) {
            onchange(isChecked);
        }

        return btn;
    };

    /**
     * Creates a button that cycles through multiple states.
     * @param {object} [config={}] - The options for the button.
     * @param {Array<object>} config.states - Array of state objects { value: string, icon: string }.
     * @param {function} [config.initialState] - Function that returns the initial value.
     * @param {function} [config.onchange] - Callback with the new value.
     * @param {string} [config.tooltip] - Base tooltip text.
     * @returns {HTMLButtonElement} The button element.
     */
    UI.cycleButton = function(config = {}) {
        const {
            states,
            initialState,
            onchange,
            tooltip
        } = config;
        
        let currentIndex = 0;
        if (initialState) {
            const initialValue = initialState();
            const foundIndex = states.findIndex(s => s.value === initialValue);
            if (foundIndex !== -1) {
                currentIndex = foundIndex;
            }
        }

        const btn = UI.button({
            icon: states[currentIndex].icon,
            onclick: (e) => {
                currentIndex = (currentIndex + 1) % states.length;
                const newState = states[currentIndex];
                const button = e.currentTarget;
                
                button.innerHTML = `<i data-lucide="${newState.icon}"></i>`;
                lucide.createIcons({ nodes: [button] });
                
                if (tooltip) {
                    UI.tooltip(button, `${tooltip}: ${newState.value}`);
                }
                
                if (onchange) {
                    onchange(newState.value);
                }
            }
        });

        if (tooltip) {
            UI.tooltip(btn, `${tooltip}: ${states[currentIndex].value}`);
        }

        if (onchange) {
            onchange(states[currentIndex].value);
        }

        return btn;
    };

    /**
     * Creates a button that cycles through multiple color states.
     * @param {object} [config={}] - The options for the button.
     * @param {Array<object>} config.states - Array of state objects { value: string, colorVar: string }.
     * @param {function} [config.initialState] - Function that returns the initial value.
     * @param {function} [config.onchange] - Callback with the new state object.
     * @param {string} [config.tooltip] - Base tooltip text.
     * @returns {HTMLButtonElement} The button element.
     */
    UI.cycleSwatch = function(config = {}) {
        const {
            states,
            initialState,
            onchange,
            tooltip
        } = config;

        let currentIndex = 0;
        if (initialState) {
            const initialValue = initialState();
            const foundIndex = states.findIndex(s => s.value === initialValue);
            if (foundIndex !== -1) {
                currentIndex = foundIndex;
            }
        }

        const btn = document.createElement('button');
        btn.className = 'btn btn-swatch';

        const updateState = (index, isInitial = false) => {
            currentIndex = index;
            const state = states[currentIndex];
            btn.style.backgroundColor = `var(${state.colorVar})`;

            if (tooltip) {
                UI.tooltip(btn, `${tooltip}: ${state.value}`);
            }
            if (onchange && !isInitial) {
                onchange(state);
            }
        };
        
        btn.addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % states.length;
            updateState(nextIndex);
        });

        updateState(currentIndex, true);
        
        if (onchange) {
            // Set initial state without triggering animation/logic
            onchange(states[currentIndex]);
        }

        return btn;
    };

    /**
     * Creates a color swatch button.
     * @param {object} [options={}] - The options for the swatch.
     * @param {string} options.color - The CSS variable for the color (e.g., 'var(--primary)').
     * @param {string} [options.tooltip] - Tooltip to display.
     * @param {function} [options.onclick] - Callback function when clicked.
     * @returns {HTMLButtonElement} The button element.
     */
    UI.swatch = function(config = {}) {
        const {
            color,
            tooltip,
            onclick
        } = config;

        const btn = document.createElement('button');
        btn.className = 'btn btn-swatch';
        btn.style.backgroundColor = color;

        if (onclick) {
            btn.addEventListener('click', onclick);
        }

        if (tooltip) {
            UI.tooltip(btn, tooltip);
        }

        return btn;
    };
})(); 
    // --- card.js ---

    if (!window.UI) window.UI = {};

    /**
     * Creates a card element.
     * @param {string} title - The title of the card.
     * @param {string} content - The HTML content for the card body.
     * @param {object} [options={}] - Options for the card.
     * @param {string} [options.icon] - Lucide icon name for the header.
     * @param {Array<object>} [options.actions] - Action buttons for the header.
     * @param {string} [options.description] - Text for the card footer.
     * @param {string} [options.footer] - HTML content for the card footer.
     * @param {string} [options.class] - Additional CSS classes for the card.
     * @returns {HTMLElement} The card element.
     */
    UI.card = function(config) {
        const { title, content, ...options } = config;
        const card = document.createElement('div');
        card.className = UI.buildClasses('card', options.class);

        if (title) {
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';

            const headerLeft = document.createElement('div');
            headerLeft.className = 'card-header-left';

            if (options.icon) {
                const icon = document.createElement('i');
                icon.setAttribute('data-lucide', options.icon);
                icon.className = 'card-icon lucide';
                headerLeft.appendChild(icon);
            }

            const cardTitle = document.createElement('h3');
            cardTitle.className = 'card-title';
            cardTitle.textContent = title;
            headerLeft.appendChild(cardTitle);

            cardHeader.appendChild(headerLeft);

            if (options.actions) {
                const headerActions = document.createElement('div');
                headerActions.className = 'card-header-actions';
                options.actions.forEach(action => {
                    const btn = UI.button(action.text || '', {
                        icon: action.icon,
                        size: 'sm',
                        variant: action.variant,
                        onclick: action.onclick,
                        class: 'card-action-btn'
                    });
                    headerActions.appendChild(btn);
                });
                cardHeader.appendChild(headerActions);
            }
            card.appendChild(cardHeader);
        }

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // If content is a string, set it as innerHTML. If it's an element, append it.
        if (typeof content === 'string') {
            cardBody.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            cardBody.appendChild(content);
        }
        
        card.appendChild(cardBody);

        if (options.description || options.footer) {
            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';
            if (options.description) {
                const p = document.createElement('p');
                p.className = 'card-description';
                p.textContent = options.description;
                cardFooter.appendChild(p);
            }
            if (options.footer) {
                const footerContent = document.createElement('div');
                if (typeof options.footer === 'string') {
                    footerContent.innerHTML = options.footer;
                } else if (options.footer instanceof HTMLElement) {
                    footerContent.appendChild(options.footer);
                }
                cardFooter.appendChild(footerContent);
            }
            card.appendChild(cardFooter);
        }

        UI.deferIcons();
        return card;
    };
})(); 
    // --- form.js ---
'use strict';

if (!window.UI) {
    window.UI = {};
}

(function(UI) {

    /**
     * Creates a form group with a label and an input control.
     * @param {object} config - The configuration for the form group.
     * @param {string} config.id - The unique ID for the input, used for the 'for' attribute.
     * @param {string} config.label - The text for the label.
     * @param {string} [config.type='text'] - The type of the input control (e.g., 'text', 'email', 'textarea').
     * @param {string} [config.placeholder=''] - The placeholder text for the input.
     * @param {string} [config.value=''] - The initial value of the input.
     * @returns {HTMLElement} The form group element.
     */
    UI.formGroup = function(config) {
        const { id, label, type = 'text', placeholder = '', value = '' } = config;

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id);
        labelEl.textContent = label;
        formGroup.appendChild(labelEl);

        let controlEl;
        if (type === 'textarea') {
            controlEl = document.createElement('textarea');
            controlEl.textContent = value;
        } else {
            controlEl = document.createElement('input');
            controlEl.type = type;
            controlEl.value = value;
        }
        
        controlEl.id = id;
        controlEl.className = 'form-control';
        controlEl.placeholder = placeholder;

        formGroup.appendChild(controlEl);

        return formGroup;
    };

    /**
     * Creates a custom select/dropdown component that is fully stylable.
     * @param {object} config - The configuration for the select group.
     * @param {string} config.id - The unique ID for the select.
     * @param {string} config.label - The text for the label.
     * @param {Array<object>} config.options - Array of options. {value: string, text: string}
     * @returns {HTMLElement} The form group element.
     */
    UI.customSelectGroup = function(config) {
        const { id, label, options = [] } = config;

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id);
        labelEl.textContent = label;
        formGroup.appendChild(labelEl);

        const selectContainer = document.createElement('div');
        selectContainer.className = 'custom-select';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = id;
        hiddenInput.name = id;
        
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'form-control custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const triggerValue = document.createElement('span');
        trigger.appendChild(triggerValue);

        const panel = document.createElement('div');
        panel.className = 'custom-select-panel';
        panel.setAttribute('role', 'listbox');

        options.forEach((opt, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'custom-select-option';
            optionEl.dataset.value = opt.value;
            optionEl.textContent = opt.text;
            optionEl.setAttribute('role', 'option');
            optionEl.setAttribute('aria-selected', 'false');
            optionEl.tabIndex = -1;

            if (index === 0) {
                triggerValue.textContent = opt.text;
                hiddenInput.value = opt.value;
                optionEl.classList.add('selected');
                optionEl.setAttribute('aria-selected', 'true');
            }

            optionEl.addEventListener('click', () => {
                triggerValue.textContent = optionEl.textContent;
                hiddenInput.value = optionEl.dataset.value;

                panel.querySelectorAll('.custom-select-option').forEach(o => {
                    o.classList.remove('selected');
                    o.setAttribute('aria-selected', 'false');
                });
                optionEl.classList.add('selected');
                optionEl.setAttribute('aria-selected', 'true');

                closePanel();
            });

            panel.appendChild(optionEl);
        });

        selectContainer.appendChild(hiddenInput);
        selectContainer.appendChild(trigger);
        selectContainer.appendChild(panel);

        const openPanel = () => {
            selectContainer.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            document.addEventListener('click', handleOutsideClick, true);
        };

        const closePanel = () => {
            selectContainer.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', handleOutsideClick, true);
        };

        const handleOutsideClick = (e) => {
            if (!selectContainer.contains(e.target)) {
                closePanel();
            }
        };
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectContainer.classList.contains('open')) {
                closePanel();
            } else {
                openPanel();
            }
        });

        formGroup.appendChild(selectContainer);

        return formGroup;
    };

    /**
     * Creates a single checkbox control.
     * @param {object} config - The configuration for the checkbox.
     * @param {string} config.id - The unique ID for the input.
     * @param {string} config.label - The text for the label.
     * @param {string} [config.name] - The name for the input.
     * @param {boolean} [config.checked=false] - If the checkbox is checked by default.
     * @param {string} [config.variant] - Semantic color variant.
     * @returns {HTMLElement} The checkbox label element containing the input and custom checkmark.
     */
    UI.checkbox = function(config) {
        const { id, label, name, checked = false, variant } = config;

        const labelEl = document.createElement('label');
        labelEl.className = `checkbox ${variant ? `checkbox-${variant}` : ''}`;
        labelEl.setAttribute('for', id);

        const inputEl = document.createElement('input');
        inputEl.type = 'checkbox';
        inputEl.id = id;
        if (name) inputEl.name = name;
        inputEl.checked = checked;

        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = label;

        labelEl.appendChild(inputEl);
        labelEl.appendChild(checkmark);
        labelEl.appendChild(textSpan);

        return labelEl;
    };

    /**
     * Creates a single radio button control.
     * @param {object} config - The configuration for the radio button.
     * @param {string} config.id - The unique ID for the input.
     * @param {string} config.label - The text for the label.
     * @param {string} config.name - The name for the input (required for grouping).
     * @param {boolean} [config.checked=false] - If the radio is checked by default.
     * @param {string} [config.variant] - Semantic color variant.
     * @returns {HTMLElement} The radio label element containing the input and custom radiomark.
     */
    UI.radio = function(config) {
        const { id, label, name, checked = false, variant } = config;
        
        const labelEl = document.createElement('label');
        labelEl.className = `radio ${variant ? `radio-${variant}` : ''}`;
        labelEl.setAttribute('for', id);

        const inputEl = document.createElement('input');
        inputEl.type = 'radio';
        inputEl.id = id;
        inputEl.name = name; // Important for radio group behavior
        inputEl.checked = checked;

        const radiomark = document.createElement('span');
        radiomark.className = 'radiomark';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = label;

        labelEl.appendChild(inputEl);
        labelEl.appendChild(radiomark);
        labelEl.appendChild(textSpan);

        return labelEl;
    };

    /**
     * Creates a range slider form group.
     * @param {object} config - The configuration for the range slider.
     * @param {string} config.id - The unique ID for the input.
     * @param {string} config.label - The text for the label.
     * @param {number} [config.min=0] - The minimum value.
     * @param {number} [config.max=100] - The maximum value.
     * @param {number} [config.step=1] - The step increment.
     * @param {number} [config.value=50] - The initial value.
     * @returns {HTMLElement} The form group element.
     */
    UI.rangeGroup = function(config) {
        const { id, label, min = 0, max = 100, step = 1, value = 50 } = config;

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const labelWrapper = document.createElement('div');
        labelWrapper.style.display = 'flex';
        labelWrapper.style.justifyContent = 'space-between';
        labelWrapper.style.alignItems = 'center';
        labelWrapper.style.marginBottom = 'var(--space-2)';

        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id);
        labelEl.textContent = label;
        labelEl.style.marginBottom = '0'; // Override default margin

        const valueSpan = document.createElement('span');
        valueSpan.className = 'text-secondary font-mono';
        valueSpan.textContent = value;
        
        labelWrapper.appendChild(labelEl);
        labelWrapper.appendChild(valueSpan);

        const inputEl = document.createElement('input');
        inputEl.type = 'range';
        inputEl.id = id;
        inputEl.className = 'form-control';
        inputEl.min = min;
        inputEl.max = max;
        inputEl.step = step;
        inputEl.value = value;
        
        inputEl.addEventListener('input', (e) => {
            valueSpan.textContent = e.target.value;
        });
        
        formGroup.appendChild(labelWrapper);
        formGroup.appendChild(inputEl);

        return formGroup;
    };

    /**
     * Creates a themed date picker form group.
     * @param {object} config - The configuration for the date picker.
     * @param {string} config.id - The unique ID for the input.
     * @param {string} config.label - The text for the label.
     * @param {string} [config.value] - The initial date value.
     * @returns {HTMLElement} The form group element.
     */
    UI.dateGroup = function(config) {
        const { id, label, value } = config;

        const formGroup = UI.formGroup({ id, label, type: 'text', value: value || '', placeholder: 'Select a date' });
        const inputEl = formGroup.querySelector('input');
        
        // Wrap input to add icon
        const inputWrapper = document.createElement('div');
        inputWrapper.style.position = 'relative';
        
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'calendar');
        icon.style.position = 'absolute';
        icon.style.right = 'var(--space-3)';
        icon.style.top = '50%';
        icon.style.transform = 'translateY(-50%)';
        icon.style.pointerEvents = 'none';
        icon.style.color = 'var(--text-tertiary)';
        
        inputWrapper.appendChild(inputEl.cloneNode(true));
        inputWrapper.appendChild(icon);
        formGroup.replaceChild(inputWrapper, inputEl);
        
        const realInput = formGroup.querySelector('input');
        
        // Defer initialization
        setTimeout(() => {
            new Datepicker(realInput, {
                autohide: true,
                format: 'yyyy-mm-dd',
                buttonClass: 'btn'
            });
            UI.deferIcons();
        }, 0);

        return formGroup;
    };
    
    /**
     * Creates a themed color picker form group.
     * @param {object} config - The configuration for the color picker.
     * @param {string} config.id - The unique ID for the input.
     * @param {string} config.label - The text for the label.
     * @param {string} [config.value='#b5d3b6'] - The initial color value.
     * @returns {HTMLElement} The form group element.
     */
    UI.colorGroup = function(config) {
        const { id, label, value = '#b5d3b6' } = config;

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id);
        labelEl.textContent = label;
        formGroup.appendChild(labelEl);
        
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = 'var(--space-2)';

        const colorSwatch = document.createElement('button');
        colorSwatch.type = 'button';
        colorSwatch.className = 'form-control';
        colorSwatch.style.width = '48px';
        colorSwatch.style.height = '38px';
        colorSwatch.style.flexShrink = '0';
        colorSwatch.style.padding = 'var(--space-1)';
        colorSwatch.style.backgroundColor = value;

        const inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.id = id;
        inputEl.className = 'form-control';
        inputEl.value = value;
        
        wrapper.appendChild(colorSwatch);
        wrapper.appendChild(inputEl);
        formGroup.appendChild(wrapper);

        // Defer initialization
        setTimeout(() => {
            const picker = new Picker({
                parent: colorSwatch,
                popup: 'right', // 'right'(default), 'left', 'top', 'bottom'
                color: value,
                editor: false,
                alpha: false
            });

            picker.onChange = function(color) {
                const hex = color.hex.slice(0, 7);
                colorSwatch.style.backgroundColor = hex;
                inputEl.value = hex;
            };

            inputEl.addEventListener('change', () => {
                picker.setColor(inputEl.value, true);
            });
        }, 0);

        return formGroup;
    };

}(window.UI)); 
    // --- menu.js ---
if (!window.UI) {
    window.UI = {};
}

(function(UI) {

    /**
     * Creates menu items, including sub-menus, from an array of item data.
     * This is an internal helper function.
     * @param {Array<object>} items - The items for the menu.
     * @param {function} closeMenuCallback - The function to call when an item is clicked.
     * @returns {DocumentFragment} - A fragment containing the menu items.
     */
    const createMenuItems = (items, closeMenuCallback) => {
        const fragment = document.createDocumentFragment();
        items.forEach(itemData => {
            if (itemData.type === 'divider') {
                const divider = document.createElement('div');
                divider.className = 'menu-divider';
                divider.setAttribute('role', 'separator');
                fragment.appendChild(divider);
                return;
            }

            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.setAttribute('role', 'menuitem');
            menuItem.tabIndex = -1;

            if (itemData.icon) {
                const icon = document.createElement('i');
                icon.setAttribute('data-lucide', itemData.icon);
                menuItem.appendChild(icon);
            }

            const text = document.createElement('span');
            text.textContent = itemData.text;
            menuItem.appendChild(text);

            if (itemData.children && itemData.children.length > 0) {
                menuItem.classList.add('has-submenu');

                const subMenuIcon = document.createElement('i');
                subMenuIcon.setAttribute('data-lucide', 'chevron-right');
                menuItem.appendChild(subMenuIcon);

                const subMenuPanel = document.createElement('div');
                subMenuPanel.className = 'menu-panel';
                const subMenuItems = createMenuItems(itemData.children, closeMenuCallback);
                subMenuPanel.appendChild(subMenuItems);
                menuItem.appendChild(subMenuPanel);
            } else {
                if (itemData.shortcut) {
                    const shortcut = document.createElement('span');
                    shortcut.className = 'menu-shortcut tag';
                    shortcut.textContent = itemData.shortcut;
                    menuItem.appendChild(shortcut);
                }
                if (itemData.onClick) {
                    menuItem.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent closing parent menus
                        itemData.onClick();
                        if (closeMenuCallback) {
                            closeMenuCallback();
                        }
                    });
                }
            }
            fragment.appendChild(menuItem);
        });
        return fragment;
    };

    /**
     * Creates a menu component.
     * @param {object} config - The configuration for the menu.
     * @param {object} config.trigger - The configuration for the trigger button.
     * @param {string} config.trigger.text - The text for the trigger button.
     * @param {string} [config.trigger.icon] - The Lucide icon for the trigger button.
     * @param {Array<object>} config.items - The items for the menu.
     * @param {string} [config.placement] - The placement of the menu ('top', 'right', 'bottom', 'left').
     * @returns {HTMLElement} - The menu component.
     */
    UI.menu = (config) => {
        const { trigger, items, placement } = config;

        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu';

        const triggerConfig = {
            iconPosition: 'right',
            variant: 'secondary',
            ...trigger,
            attributes: {
                'aria-haspopup': 'true',
                'aria-expanded': 'false',
                ...(trigger.attributes || {})
            }
        };
        const triggerButton = UI.button(triggerConfig);
        triggerButton.classList.add('menu-trigger');

        const menuPanel = document.createElement('div');
        menuPanel.className = 'menu-panel';
        menuPanel.setAttribute('role', 'menu');

        const closeMenu = () => {
            menuContainer.classList.remove('open', 'menu--top', 'menu--right', 'menu--left');
            triggerButton.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', handleOutsideClick, true);

            const parentPanel = menuContainer.closest('.panel');
            if (parentPanel) {
                parentPanel.classList.remove('panel--active');
            }
        };
        
        const menuItems = createMenuItems(items, closeMenu);
        menuPanel.appendChild(menuItems);

        menuContainer.appendChild(triggerButton);
        menuContainer.appendChild(menuPanel);

        UI.deferIcons();

        const toggleMenu = (e) => {
            e.stopPropagation();
            const isOpen = menuContainer.classList.contains('open');

            document.querySelectorAll('.menu.open').forEach(openMenu => {
                if (openMenu !== menuContainer) {
                    openMenu.classList.remove('open', 'menu--top', 'menu--right', 'menu--left');
                    openMenu.querySelector('.menu-trigger').setAttribute('aria-expanded', 'false');
                    
                    const otherPanel = openMenu.closest('.panel');
                    if (otherPanel) {
                        otherPanel.classList.remove('panel--active');
                    }
                }
            });

            if (isOpen) {
                closeMenu();
            } else {
                const parentPanel = menuContainer.closest('.panel');
                if (parentPanel) {
                    parentPanel.classList.add('panel--active');
                }

                let finalPlacement = placement;
                
                if (!finalPlacement) {
                    const triggerRect = triggerButton.getBoundingClientRect();
                    
                    menuPanel.style.visibility = 'hidden';
                    menuPanel.style.display = 'block';
                    const panelHeight = menuPanel.offsetHeight;
                    menuPanel.style.visibility = '';
                    menuPanel.style.display = '';

                    const spaceBelow = window.innerHeight - triggerRect.bottom;
                    if (spaceBelow < panelHeight && triggerRect.top > panelHeight) {
                        finalPlacement = 'top';
                    }
                }
                
                if (finalPlacement) {
                    menuContainer.classList.add(`menu--${finalPlacement}`);
                }

                menuContainer.classList.add('open');
                triggerButton.setAttribute('aria-expanded', 'true');
                document.addEventListener('click', handleOutsideClick, true);
            }
        };

        const handleOutsideClick = (e) => {
            if (!menuContainer.contains(e.target)) {
                closeMenu();
            }
        };

        triggerButton.addEventListener('click', toggleMenu);

        return menuContainer;
    };
    
    /**
     * Attaches a context menu to a target element.
     * @param {HTMLElement} target - The element to attach the context menu to.
     * @param {Array<object>} items - The items for the menu.
     */
    UI.contextMenu = (target, items) => {
        const showMenu = (e) => {
            e.preventDefault();
            
            // Remove any existing context menu
            hideMenu();

            let container = document.getElementById('context-menu-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'context-menu-container';
                document.body.appendChild(container);
            }
            
            const menuPanel = document.createElement('div');
            menuPanel.className = 'menu-panel';
            menuPanel.style.display = 'block'; // Make it visible to calculate size
            menuPanel.style.position = 'static';

            const menuItems = createMenuItems(items, hideMenu);
            menuPanel.appendChild(menuItems);
            
            container.appendChild(menuPanel);
            UI.icons();

            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = menuPanel;
            
            let top = clientY;
            let left = clientX;

            if (clientY + offsetHeight > innerHeight) { top = innerHeight - offsetHeight - 5; }
            if (clientX + offsetWidth > innerWidth) { left = innerWidth - offsetWidth - 5; }
            
            container.style.top = `${top}px`;
            container.style.left = `${left}px`;

            document.addEventListener('click', hideMenu, { once: true, capture: true });
        };

        const hideMenu = (e) => {
            let container = document.getElementById('context-menu-container');
            if (container) {
                if (e && container.contains(e.target)) {
                    document.addEventListener('click', hideMenu, { once: true, capture: true });
                    return;
                }
                container.innerHTML = '';
                document.removeEventListener('click', hideMenu, { once: true, capture: true });
            }
        };

        target.addEventListener('contextmenu', showMenu);

        return {
            destroy: () => {
                target.removeEventListener('contextmenu', showMenu);
            }
        };
    };
    
}(window.UI)); 
    // --- modal.js ---

    if (!window.UI) window.UI = {};

    /**
     * Shows a modal dialog.
     * @param {string|HTMLElement} content - The HTML string or element for the modal body.
     * @param {object} [options={}] - Options for the modal.
     * @param {string} [options.title] - The title for the modal header.
     * @param {string} [options.icon] - Lucide icon name for the header.
     * @param {string} [options.size] - The size variant (e.g., 'sm', 'lg').
     * @param {Array<object>} [options.actions] - Action buttons for the footer.
     * @param {boolean} [options.closeOnBackdrop=true] - If the modal should close when clicking the backdrop.
     * @param {function} [options.onclose] - Callback function when the modal is closed.
     * @returns {{modal: HTMLElement, backdrop: HTMLElement, close: function}} The modal elements and close function.
     */
    UI.modal = function(config = {}) {
        const {
            content,
            title = '',
            icon,
            size,
            actions = [],
            closeOnBackdrop = true,
            onclose
        } = config;

        const modal = document.createElement('div');
        modal.className = this.buildClasses('modal', size && `modal-${size}`);

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        let cardFooter = null;
        if (actions.length > 0) {
            cardFooter = document.createElement('div');
            // The card component will add its own footer class.
            actions.forEach(action => {
                const btn = this.button(action.text, {
                    variant: action.variant,
                    size: action.size,
                    onclick: () => {
                        if (action.onclick) action.onclick();
                        if (action.closeModal !== false) closeModal();
                    }
                });
                cardFooter.appendChild(btn);
            });
        }

        const card = UI.card({
            title,
            content,
            icon,
            footer: cardFooter,
            actions: title ? [{
                icon: 'x',
                onclick: () => closeModal(),
                ariaLabel: 'Close'
            }] : null
        });
        
        modal.appendChild(card);
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        this.icons();

        requestAnimationFrame(() => {
            backdrop.classList.add('show');
            modal.classList.add('show');
        });

        const closeModal = () => {
            backdrop.classList.remove('show');
            modal.classList.remove('show');
            
            // Allow animation to complete before removing from DOM
            setTimeout(() => {
                backdrop.remove();
                document.removeEventListener('keydown', escapeHandler);
            }, CONFIG.MODAL_ANIMATION_DURATION); // Match this with --transition-base

            if (onclose) onclose();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        backdrop.onclick = (e) => {
            if (e.target === backdrop && closeOnBackdrop) {
                closeModal();
            }
        };
        
        document.addEventListener('keydown', escapeHandler);

        return { modal, backdrop, close: closeModal };
    };
})(); 
    // --- panel.js ---
'use strict';

// Ensure the UI namespace exists
window.UI = window.UI || {};

(function(UI) {

    /**
     * Creates a panel component.
     * @param {string} title - The title of the panel.
     * @param {string|HTMLElement} content - The content of the panel.
     * @param {object} [options={}] - The options for the panel.
     * @param {string} [options.icon] - The icon to display in the panel header.
     * @param {boolean} [options.collapsible=false] - Whether the panel is collapsible.
     * @param {boolean} [options.startCollapsed=false] - Whether the panel should be collapsed initially.
     * @returns {HTMLElement} The panel element.
     */
    UI.panel = function(title, content, options = {}) {
        const panel = document.createElement('div');
        panel.className = 'panel';
        if (options.collapsible) {
            panel.classList.add('panel-collapsible');
        }
        if (options.collapsible && options.startCollapsed) {
            panel.classList.add('panel-collapsed');
        }

        // Header
        const header = document.createElement('div');
        header.className = 'panel-header';

        // Title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'panel-title';

        if (options.icon) {
            const icon = document.createElement('i');
            icon.setAttribute('data-lucide', options.icon);
            icon.className = 'lucide';
            titleDiv.appendChild(icon);
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        titleDiv.appendChild(titleSpan);

        // Actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'panel-actions';

        let toggleButton;
        if (options.collapsible) {
            toggleButton = UI.button({ icon: 'chevron-down' });
            toggleButton.classList.add('panel-toggle');
            actionsDiv.appendChild(toggleButton);
        }

        header.appendChild(titleDiv);
        header.appendChild(actionsDiv);

        // Body
        const body = document.createElement('div');
        body.className = 'panel-body';

        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }

        panel.appendChild(header);
        panel.appendChild(body);

        // Add collapse functionality
        if (options.collapsible && toggleButton) {
            toggleButton.onclick = () => {
                panel.classList.toggle('panel-collapsed');
            };
        }

        // Initialize icons
        UI.deferIcons();

        return panel;
    };

}(window.UI)); 
    // --- toast.js ---

    if (!window.UI) window.UI = {};

    /**
     * Shows a toast notification.
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - The type of toast (info, success, warning, error).
     * @param {object} [options={}] - Options for the toast.
     * @param {number} [options.duration] - How long the toast appears in ms.
     * @param {boolean} [options.dismissible] - If the toast can be closed by the user.
     * @param {object} [options.action] - An action button to show on the toast.
     * @param {string} options.action.text - The text for the action button.
     * @param {function} options.action.callback - The function to call when the action is clicked.
     * @param {boolean} [options.preloader] - Show a loading spinner instead of an icon.
     * @returns {HTMLElement} The toast element.
     */
    UI.toast = function(message, type = 'info', options = {}) {
        message = UI.language.translate(message);
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = CONFIG.TOAST_ICONS;
        let iconHTML = '';
        if (options.preloader) {
            const spinnerClass = type ? `loading-spinner-${type}` : 'loading-spinner';
            iconHTML = `<div class="${spinnerClass} toast-icon"></div>`;
        } else {
            iconHTML = `<i data-lucide="${icons[type] || 'info'}" class="toast-icon lucide"></i>`;
        }

        let toastHTML = `${iconHTML}<span class="toast-message">${message}</span>`;
        if (options.action) {
            toastHTML += `<div class="toast-action"><button class="btn btn-sm">${options.action.text}</button></div>`;
        }
        if (options.dismissible) {
            toastHTML += `<i data-lucide="x" class="toast-close lucide"></i>`;
        }
        toast.innerHTML = toastHTML;

        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress';
        const duration = options.duration || CONFIG.TOAST_DURATION;
        progressBar.style.setProperty('--toast-duration', duration + 'ms');
        toast.appendChild(progressBar);

        container.appendChild(toast);
        this.icons();

        // Add the slide-in animation class
        toast.classList.add('anim-slideInRight');

        const removeToast = () => {
            clearTimeout(autoRemoveTimeout);
            
            // Remove the slide-in class and add the slide-out class
            toast.classList.remove('anim-slideInRight');
            toast.classList.add('anim-slideOutRight');
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                if (container.children.length === 0) {
                    container.remove();
                }
            }, CONFIG.MODAL_ANIMATION_DURATION);
        };
        
        if (options.action) {
            toast.querySelector('.toast-action button').addEventListener('click', () => {
                options.action.callback();
                removeToast();
            });
        }
        if (options.dismissible) {
            toast.querySelector('.toast-close').addEventListener('click', removeToast);
        }

        const autoRemoveTimeout = setTimeout(removeToast, duration);

        return toast;
    };
})(); 
    // --- tooltip.js ---
(function(UI) {
    'use strict';

    let tooltipElement;

    function showTooltip(target, text, position) {
        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            // Initial class is just 'tooltip'
            tooltipElement.className = 'tooltip';
            document.body.appendChild(tooltipElement);
        }

        tooltipElement.textContent = text;
        // The positionTooltip function will now handle adding the correct classes
        positionTooltip(target, position);
        tooltipElement.classList.add('is-visible');
    }

    function hideTooltip() {
        if (tooltipElement) {
            tooltipElement.classList.remove('is-visible');
        }
    }

    function positionTooltip(target, position) {
        // Reset classes before positioning
        tooltipElement.className = 'tooltip';
        tooltipElement.classList.add(`tooltip--${position}`);

        const targetRect = target.getBoundingClientRect();
        // Recalculate tooltipRect *after* setting the text and class
        const tooltipRect = tooltipElement.getBoundingClientRect();
        
        let top, left;

        switch (position) {
            case 'top':
                top = targetRect.top - tooltipRect.height - 8;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = targetRect.bottom + 8;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + 8;
                break;
            default: // Default to 'top'
                top = targetRect.top - tooltipRect.height - 8;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
        }

        tooltipElement.style.top = `${top + window.scrollY}px`;
        tooltipElement.style.left = `${left + window.scrollX}px`;
    }

    /**
     * Attaches a tooltip to a target element.
     * @param {HTMLElement} target - The element to attach the tooltip to.
     * @param {string} text - The text to display in the tooltip.
     * @param {string} [position='top'] - The position of the tooltip ('top', 'bottom', 'left', 'right').
     */
    UI.tooltip = (target, text, position = 'top') => {
        const show = () => showTooltip(target, text, position);
        const hide = () => hideTooltip();

        target.addEventListener('mouseenter', show);
        target.addEventListener('mouseleave', hide);
        target.addEventListener('focus', show);
        target.addEventListener('blur', hide);

        return {
            destroy() {
                target.removeEventListener('mouseenter', show);
                target.removeEventListener('mouseleave', hide);
                target.removeEventListener('focus', show);
                target.removeEventListener('blur', hide);
            }
        };
    };

}(window.UI || (window.UI = {}))); 
    // --- tree.js ---

    if (!window.UI) window.UI = {};
    if (!UI.components) UI.components = {};

    /**
     * Creates a collapsible tree component.
     * @param {Array<Object>} items - An array of item objects.
     * @param {string} items[].label - The text to display for the item.
     * @param {string} [items[].icon] - The Lucide icon name for the item.
     * @param {Array<Object>} [items[].children] - An array of child items.
     * @returns {HTMLElement} The tree component container.
     */
    UI.tree = function(items) {
        const container = document.createElement('ul');
        container.className = 'tree';

        // ----- Base (grey) Edge Layer -----
        const baseEdgeLayer = document.createElement('div');
        baseEdgeLayer.className = 'tree-edge-base-layer';
        Object.assign(baseEdgeLayer.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            pointerEvents: 'none'
        });
        container.appendChild(baseEdgeLayer);

        // ----- Accent Edge Layer -----
        const edgeLayer = document.createElement('div');
        edgeLayer.className = 'tree-edge-layer';
        Object.assign(edgeLayer.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            pointerEvents: 'none'
        });
        container.appendChild(edgeLayer);

        let selectedContent = null;

        const EDGE_THICKNESS = 2; // must match CSS thickness
        const CONNECTOR_OFFSET = 8; // left offset used in CSS
        const EDGE_GAP = 6; // gap between edge and item content (px)

        function clearAccentEdges() {
            edgeLayer.innerHTML = '';
        }

        function clearBaseEdges() {
            baseEdgeLayer.innerHTML = '';
        }

        function addAccentEdge(style) {
            const edge = document.createElement('div');
            edge.className = 'tree-edge-dynamic';
            Object.assign(edge.style, style);
            edgeLayer.appendChild(edge);
        }

        function addBaseEdge(style) {
            const edge = document.createElement('div');
            edge.className = 'tree-edge-base';
            Object.assign(edge.style, style);
            baseEdgeLayer.appendChild(edge);
        }

        const BASE_EDGE_THICKNESS = 1;

        function drawBaseEdges() {
            clearBaseEdges();

            const containerRect = container.getBoundingClientRect();

            const prevCenterByPath = new Map();

            const items = Array.from(container.querySelectorAll('.tree-item'));
            items.forEach(li => {
                // Skip items inside collapsed branches
                if (li.closest('.tree-item.collapsed')) return;

                const contentEl = li.querySelector('.tree-item-content');
                if (!contentEl) return;

                const contentRect = contentEl.getBoundingClientRect();
                const liRect = li.getBoundingClientRect();

                const centerY = contentRect.top - containerRect.top + contentRect.height / 2;
                const pathLeft = liRect.left - containerRect.left + CONNECTOR_OFFSET;

                // Horizontal line from vertical spine to content (gap retained)
                let horizontalWidth = contentRect.left - containerRect.left - pathLeft - EDGE_GAP;
                if (horizontalWidth < 0) horizontalWidth = 0;
                addBaseEdge({
                    position: 'absolute',
                    left: `${pathLeft}px`,
                    top: `${centerY - BASE_EDGE_THICKNESS / 2}px`,
                    width: `${horizontalWidth}px`,
                    height: `${BASE_EDGE_THICKNESS}px`,
                });

                // Vertical spine segments
                if (!prevCenterByPath.has(pathLeft)) {
                    // First node on this path: draw from top to centerY
                    addBaseEdge({
                        position: 'absolute',
                        left: `${pathLeft}px`,
                        top: '0',
                        width: `${BASE_EDGE_THICKNESS}px`,
                        height: `${centerY}px`,
                    });
                } else {
                    const prevY = prevCenterByPath.get(pathLeft);
                    const top = Math.min(prevY, centerY);
                    const height = Math.abs(prevY - centerY);
                    addBaseEdge({
                        position: 'absolute',
                        left: `${pathLeft}px`,
                        top: `${top}px`,
                        width: `${BASE_EDGE_THICKNESS}px`,
                        height: `${height}px`,
                    });
                }

                prevCenterByPath.set(pathLeft, centerY);
            });
        }

        function positionEdges(targetContent) {
            clearAccentEdges();
            drawBaseEdges();
            if (!targetContent) return;

            const containerRect = container.getBoundingClientRect();

            // Build path from root to selected
            const pathNodes = [];
            let currentContent = targetContent;
            while (currentContent) {
                pathNodes.unshift(currentContent);
                const parentLi = currentContent.parentElement.parentElement.closest('.tree-item');
                currentContent = parentLi ? parentLi.querySelector('.tree-item-content') : null;
            }

            let prevCenterY = 0;

            pathNodes.forEach((contentEl, index) => {
                const contentRect = contentEl.getBoundingClientRect();
                const liRect = contentEl.parentElement.getBoundingClientRect();

                const centerY = contentRect.top - containerRect.top + contentRect.height / 2;
                const pathLeft = liRect.left - containerRect.left + CONNECTOR_OFFSET;

                // Draw vertical segment from previous node to this node (skip for root which starts at 0)
                if (index === 0) {
                    // Root vertical from top to center
                    addAccentEdge({
                        position: 'absolute',
                        left: `${pathLeft}px`,
                        top: '0',
                        width: `${EDGE_THICKNESS}px`,
                        height: `${centerY}px`,
                        background: 'var(--accent)',
                    });
                } else {
                    const top = Math.min(prevCenterY, centerY);
                    const height = Math.abs(centerY - prevCenterY);
                    addAccentEdge({
                        position: 'absolute',
                        left: `${pathLeft}px`,
                        top: `${top}px`,
                        width: `${EDGE_THICKNESS}px`,
                        height: `${height}px`,
                        background: 'var(--accent)',
                    });
                }

                // Horizontal segment from vertical line to content label
                let horizontalWidth = contentRect.left - containerRect.left - pathLeft - EDGE_GAP;
                if (horizontalWidth < 0) horizontalWidth = 0;
                addAccentEdge({
                    position: 'absolute',
                    left: `${pathLeft}px`,
                    top: `${centerY - EDGE_THICKNESS / 2}px`,
                    width: `${horizontalWidth}px`,
                    height: `${EDGE_THICKNESS}px`,
                    background: 'var(--accent)',
                });

                prevCenterY = centerY;
            });
        }

        function updateEdges() {
            const currentSelected = container.querySelector('.tree-item-content.selected');
            if (currentSelected !== selectedContent) {
                selectedContent = currentSelected;
            }
            positionEdges(selectedContent);
        }

        // Recalculate on scroll and resize events
        window.addEventListener('scroll', updateEdges, { passive: true });
        window.addEventListener('resize', updateEdges);
        // Also recalc when the tree container itself scrolls (in case of overflow)
        container.addEventListener('scroll', updateEdges, { passive: true });

        function createTree(parent, items) {
            items.forEach(itemData => {
                const li = document.createElement('li');
                li.className = 'tree-item';
                if (itemData.children && itemData.children.length > 0) {
                    li.classList.add('has-children');
                    if (!itemData.expanded) {
                        li.classList.add('expanded');
                    }
                }

                const isLink = itemData.href && typeof itemData.href === 'string';
                const content = isLink ? document.createElement('a') : document.createElement('div');
                content.className = 'tree-item-content btn btn-ghost';
                if (isLink) {
                    content.href = itemData.href;
                }
                
                const toggle = document.createElement('span');
                toggle.className = 'tree-item-toggle';
                if (itemData.children && itemData.children.length > 0) {
                    const icon = document.createElement('i');
                    icon.setAttribute('data-lucide', 'chevron-down');
                    toggle.appendChild(icon);
                }
                
                content.appendChild(toggle);
                
                if (itemData.icon) {
                    const icon = document.createElement('i');
                    icon.setAttribute('data-lucide', itemData.icon);
                    content.appendChild(icon);
                }
                
                const label = document.createElement('span');
                label.className = 'tree-item-label';
                label.textContent = itemData.label;
                content.appendChild(label);
                
                if (itemData.element) {
                    content.appendChild(itemData.element);
                }

                li.appendChild(content);

                if (itemData.children && itemData.children.length > 0) {
                    const childrenContainer = document.createElement('ul');
                    childrenContainer.className = 'tree-children';
                    createTree(childrenContainer, itemData.children);
                    li.appendChild(childrenContainer);
                }

                parent.appendChild(li);
            });
        }

        createTree(container, items);

        container.addEventListener('click', function(e) {
            const content = e.target.closest('.tree-item-content');
            if (content) {
                const item = content.parentElement;

                // If this is a link navigation item, defer all visual updates;
                // let the scroll-spy handle selection and edge redraw.
                if (content.tagName === 'A') {
                    return; // keep current edge/path until scroll event updates
                }

                // --- Selection ---
                // Clear previous selection
                container.querySelectorAll('.selected').forEach(el => {
                    el.classList.remove('selected');
                });

                // Apply new selection
                content.classList.add('selected');
                item.classList.add('selected');
                
                // --- Collapse/Expand Logic ---
                if (item.classList.contains('tree-item') && item.querySelector('.tree-children')) {
                    item.classList.toggle('collapsed');
                    e.stopPropagation(); // Prevent event from bubbling up to parent tree items
                }

                // --- Click Logic ---
                if (content.closest('.tree-item').itemData?.onclick && typeof content.closest('.tree-item').itemData.onclick === 'function' && !isLink) {
                    content.closest('.tree-item').itemData.onclick();
                }

                // --- Edge Positioning ---
                positionEdges(content);
            }
        });
        
        // Initial edge positioning (in case a tree item is preselected by scroll spy)
        updateEdges();

        // After creating the tree, render any Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        return container;
    };
})(); 
    // --- timeline.js ---

    if (!window.UI) window.UI = {};

    /**
     * Creates an interactive timeline widget with a draggable playhead.
     * @param {object} [config={}] - Configuration options.
     * @param {number} [config.duration=100] - Total length of the timeline (frames, seconds, etc.).
     * @param {number} [config.current=0] - Initial playhead position.
     * @param {Array<{time:number,color?:string}>} [config.markers] - Optional array of marker objects.
     * @param {function} [config.onchange] - Callback fired with new position whenever the playhead moves.
     * @returns {HTMLElement} Timeline element.
     */
    UI.timeline = function(config = {}) {
        const {
            duration = 100,
            current = 0,
            markers = [],
            tickInterval = 1,
            majorTickInterval = 50,
            labelInterval = 10,
            startRange = 0,
            endRange = duration,
            snapIncrement = 1,
            onchange,
            onrangechange,
            onMarkerHover
        } = config;

        // Helper function (hoisted)
        function clamp(val, min, max) {
            return Math.min(Math.max(val, min), max);
        }

        const snap = (val) => Math.round(val / snapIncrement) * snapIncrement;

        const container = document.createElement('div');
        container.className = 'timeline';

        const track = document.createElement('div');
        track.className = 'timeline-track';
        container.appendChild(track);

        // Progress (filled) bar
        const progressBar = document.createElement('div');
        progressBar.className = 'timeline-progress';
        track.appendChild(progressBar);

        // Draggable handle / playhead
        const handle = document.createElement('div');
        handle.className = 'timeline-handle';
        // Insert playhead icon using Lucide
        handle.innerHTML = `
            <div class="timeline-playhead-label"></div>
            <div class="timeline-playhead-line"></div>
        `;
        // Set width to represent exactly one frame
        const framePct = 100 / duration;
        handle.style.width = framePct + '%';
        track.appendChild(handle);

        // Render the icon if Lucide is available
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons({ nodes: [handle] });
        }

        const playheadLabel = handle.querySelector('.timeline-playhead-label');

        /* ---------------- Playback Range ---------------- */
        let rangeStart = clamp(startRange, 0, duration);
        let rangeEnd = clamp(endRange, rangeStart, duration);

        const rangeBar = document.createElement('div');
        rangeBar.className = 'timeline-range';
        track.appendChild(rangeBar);

        const startHandle = document.createElement('div');
        startHandle.className = 'timeline-range-handle handle-start';
        track.appendChild(startHandle);

        const endHandle = document.createElement('div');
        endHandle.className = 'timeline-range-handle handle-end';
        track.appendChild(endHandle);

        const updateRangeVisual = () => {
            const startPct = (rangeStart / duration) * 100;
            const endPct = (rangeEnd / duration) * 100;
            rangeBar.style.left = startPct + '%';
            rangeBar.style.width = (endPct - startPct) + '%';
            startHandle.style.left = startPct + '%';
            endHandle.style.left = endPct + '%';
        };

        const fireRangeChange = () => {
            if (typeof onrangechange === 'function') {
                onrangechange({ start: rangeStart, end: rangeEnd });
            }
        };

        updateRangeVisual();

        /* ----- Range Handle Interaction ----- */
        let draggingRangeHandle = null; // 'start' or 'end'

        const pointerDownRange = (type) => (e) => {
            draggingRangeHandle = type;
            document.addEventListener('pointermove', pointerMoveRange);
            document.addEventListener('pointerup', pointerUpRange, { once: true });
            e.stopPropagation();
            e.preventDefault();
        };

        const pointerMoveRange = (e) => {
            if (!draggingRangeHandle) return;
            const pos = clamp(positionFromEvent(e), 0, duration);
            if (draggingRangeHandle === 'start') {
                rangeStart = Math.min(pos, rangeEnd - 1);
            } else {
                rangeEnd = Math.max(pos, rangeStart + 1);
            }
            updateRangeVisual();
            fireRangeChange();
        };

        const pointerUpRange = () => {
            draggingRangeHandle = null;
            document.removeEventListener('pointermove', pointerMoveRange);
        };

        startHandle.addEventListener('pointerdown', pointerDownRange('start'));
        endHandle.addEventListener('pointerdown', pointerDownRange('end'));

        /* ---------------- Ruler ---------------- */
        const ruler = document.createElement('div');
        ruler.className = 'timeline-ruler';
        track.appendChild(ruler);

        if (tickInterval > 0) {
            for (let t = 0; t <= duration; t += tickInterval) {
                const pct = (t / duration) * 100;

                // Only create ticks for intervals of 5 and 10
                if (t > 0 && t % 5 === 0) {
                    const tick = document.createElement('div');
                    tick.className = 'timeline-tick';
                    if (t % majorTickInterval === 0) {
                        tick.classList.add('timeline-tick-major');
                    } else if (t % 10 === 0) {
                        tick.classList.add('timeline-tick-ten');
                    } else {
                        tick.classList.add('timeline-tick-five');
                    }
                    tick.style.left = pct + '%';
                    ruler.appendChild(tick);
                }

                if (t % labelInterval === 0) {
                    const label = document.createElement('span');
                    label.className = 'timeline-label';
                    label.textContent = t;
                    label.style.left = pct + '%';
                    ruler.appendChild(label);
                }
            }
        }

        /* ---------------- Markers ---------------- */
        const markerSet = new Set();

        const createMarker = (time, color) => {
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            if (color) marker.style.backgroundColor = color;
            const pct = (time / duration) * 100;
            marker.style.left = pct + '%';

            if (typeof onMarkerHover === 'function') {
                marker.addEventListener('pointerenter', () => onMarkerHover(time, marker));
                marker.addEventListener('pointerleave', () => onMarkerHover(null, null));
            }

            track.appendChild(marker);
        };

        // Render initial markers
        markers.forEach(({ time, color }) => {
            if (time < 0 || time > duration) return;
            if (markerSet.has(time)) return;
            markerSet.add(time);
            createMarker(time, color);
        });

        // ----- Helpers -----
        const setPosition = (pos) => {
            const clamped = clamp(snap(pos), 0, duration);
            const pct = (clamped / duration) * 100;
            progressBar.style.width = pct + '%';
            handle.style.left = pct + '%';
            if (playheadLabel) {
                playheadLabel.textContent = clamped.toFixed(0);
            }
            if (typeof onchange === 'function') onchange(clamped);
        };

        // Initial render
        setPosition(current);

        // ----- Interaction -----
        let dragging = false;

        const positionFromEvent = (e) => {
            const rect = track.getBoundingClientRect();
            const x = e.clientX - rect.left; // distance from left edge
            const pct = clamp(x / rect.width, 0, 1);
            return snap(pct * duration);
        };

        const pointerDown = (e) => {
            dragging = true;
            document.addEventListener('pointermove', pointerMove);
            document.addEventListener('pointerup', pointerUp, { once: true });
            setPosition(positionFromEvent(e));
            e.preventDefault();
        };

        const pointerMove = (e) => {
            if (!dragging) return;
            setPosition(positionFromEvent(e));
        };

        const pointerUp = (e) => {
            dragging = false;
            document.removeEventListener('pointermove', pointerMove);
            setPosition(positionFromEvent(e));
        };

        // Click on track or drag handle
        track.addEventListener('pointerdown', pointerDown);
        handle.addEventListener('pointerdown', pointerDown);

        // Expose imperative API
        container.setPosition = setPosition;
        container.getPosition = () => +progressBar.style.width.replace('%', '') * duration / 100;

        container.addMarker = (time, color) => {
            const clamped = clamp(Math.round(time), 0, duration);
            if (markerSet.has(clamped)) return;
            markerSet.add(clamped);
            createMarker(clamped, color);
        };

        container.setRange = (start, end) => {
            rangeStart = clamp(snap(start), 0, duration);
            rangeEnd = clamp(snap(end), rangeStart, duration);
            updateRangeVisual();
        };

        container.getRange = () => ({ start: rangeStart, end: rangeEnd });

        // Initial range callback
        fireRangeChange();

        return container;
    };
})(); 
    // --- videoPlayer.js ---

    if (!window.UI) window.UI = {};

    /**
     * Creates a video player widget with custom controls and StyleUI components.
     * @param {object} config - Configuration options.
     * @param {string} config.src - Video source URL.
     * @param {string} [config.poster] - Poster image URL.
     * @param {boolean} [config.autoplay=false] - Whether to autoplay.
     * @param {boolean} [config.loop=false] - Whether to loop the video.
     * @returns {HTMLElement} Video player element.
     */
    UI.videoPlayer = function(config = {}) {
        const { src, poster, autoplay = false, loop = false, fps = 24 } = config;
        if (!src) {
            throw new Error('UI.videoPlayer requires a "src" option.');
        }

        /* ---------------- Layout ---------------- */
        const wrapper = document.createElement('div');
        wrapper.className = 'video-player';
        wrapper.style.position = 'relative';

        const thumbnailPreview = document.createElement('img');
        thumbnailPreview.className = 'video-thumbnail-preview';
        wrapper.appendChild(thumbnailPreview);

        const video = document.createElement('video');
        video.src = src;
        if (poster) video.poster = poster;
        video.playsInline = true;
        video.preload = 'metadata';
        video.style.width = '100%';
        if (loop) video.loop = true;
        wrapper.appendChild(video);

        /* ---------------- Overlay Canvas ---------------- */
        const overlay = document.createElement('canvas');
        overlay.className = 'video-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.pointerEvents = 'none';
        wrapper.appendChild(overlay);

        const ctx = overlay.getContext('2d');
        const strokesByFrame = new Map(); // frame -> array of strokes (each stroke array of points)

        const resizeOverlay = () => {
            const rect = video.getBoundingClientRect();
            overlay.style.width = rect.width + 'px';
            overlay.style.height = rect.height + 'px';
            overlay.width = rect.width;
            overlay.height = rect.height;
            redrawCurrentFrame();
        };

        const controls = document.createElement('div');
        controls.className = 'video-controls';
        wrapper.appendChild(controls);

        /* ---------------- Draw Button ---------------- */
        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const DRAW_COLOR_VARS = ['--error', '--warning', '--success', '--info'];
        const DRAW_COLORS = DRAW_COLOR_VARS.map(v => getCSSVar(v) || 'red');

        let drawColorIndex = 0;
        let drawingEnabled = true; // Drawing is now always on
        let currentStroke = null;

        const drawButton = UI.button({
            icon: 'edit',
            tooltip: 'Next Draw Color',
            onclick: () => {
                drawColorIndex = (drawColorIndex + 1) % DRAW_COLORS.length;
                drawButton.style.color = DRAW_COLORS[drawColorIndex];
            }
        });
        drawButton.style.color = DRAW_COLORS[drawColorIndex];
        overlay.style.pointerEvents = 'auto'; // Always listen for pointer events

        // Play / Pause button
        const playBtn = UI.button({ icon: 'play', variant: 'ghost' });
        controls.appendChild(playBtn);

        // Step backward / forward buttons (append later)
        const stepBackBtn = UI.button({ icon: 'skip-back', variant: 'ghost' });
        const stepFwdBtn = UI.button({ icon: 'skip-forward', variant: 'ghost' });

        // Loop toggle using iconToggle (append later)
        let loopToggle;
        const setLoopStyle = (enabled) => {
            loopToggle.classList.toggle('btn-primary', enabled);
        };

        loopToggle = UI.iconToggle({
            iconOn: 'infinity',
            iconOff: 'rotate-ccw',
            tooltip: 'Toggle Loop',
            initialState: () => loop,
            onchange: (enabled) => {
                video.loop = enabled;
                setTimeout(() => setLoopStyle(enabled), 0);
            }
        });

        // Apply initial style
        setLoopStyle(loop);

        // Append step, loop, draw buttons after timeline
        controls.appendChild(stepBackBtn);
        controls.appendChild(stepFwdBtn);
        controls.appendChild(loopToggle);
        controls.appendChild(drawButton);

        const timelineHolder = document.createElement('div');
        timelineHolder.style.flex = '1';
        timelineHolder.style.margin = '0 var(--space-2)';
        controls.appendChild(timelineHolder);

        // Time label
        const timeLabel = document.createElement('span');
        timeLabel.className = 'video-time-label font-mono';
        timeLabel.style.minWidth = '72px';
        timeLabel.style.textAlign = 'right';
        controls.appendChild(timeLabel);

        UI.deferIcons();

        /* ---------------- Helpers ---------------- */
        const formatTime = (secs) => {
            if (isNaN(secs)) return '0:00';
            const minutes = Math.floor(secs / 60);
            const seconds = Math.floor(secs % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        };

        let timeline = null;
        let totalFrames = 0;

        const initTimeline = (duration) => {
            totalFrames = Math.round(duration * fps);
            
            // Clear old timeline from holder
            timelineHolder.innerHTML = '';

            timeline = UI.timeline({
                duration: totalFrames,
                onchange: (frame) => {
                    video.currentTime = frame / fps;
                },
                onMarkerHover: (frame, markerElement) => {
                    if (frame !== null && strokesByFrame.has(frame)) {
                        const frameData = strokesByFrame.get(frame);
                        if (frameData.thumbnail) {
                            const markerRect = markerElement.getBoundingClientRect();
                            const wrapperRect = wrapper.getBoundingClientRect();
                            thumbnailPreview.src = frameData.thumbnail;
                            thumbnailPreview.style.display = 'block';
                            const top = markerRect.top - wrapperRect.top - 100; // 90px height + 10px margin
                            const left = markerRect.left - wrapperRect.left + (markerRect.width / 2) - 60; // 120px width / 2
                            thumbnailPreview.style.top = `${top}px`;
                            thumbnailPreview.style.left = `${left}px`;
                        }
                    } else {
                        thumbnailPreview.style.display = 'none';
                    }
                }
            });
            timelineHolder.appendChild(timeline);
        };

        /* ---------------- Events ---------------- */
        playBtn.onclick = () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        };

        const STEP_SECONDS = 1 / fps;

        stepBackBtn.onclick = () => {
            video.currentTime = Math.max(0, video.currentTime - STEP_SECONDS);
        };

        stepFwdBtn.onclick = () => {
            video.currentTime = Math.min(video.duration, video.currentTime + STEP_SECONDS);
        };

        const updatePlayIcon = () => {
            const iconName = video.paused ? 'play' : 'pause';
            playBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
            lucide.createIcons({ nodes: [playBtn] });
        };

        video.addEventListener('play', updatePlayIcon);
        video.addEventListener('pause', updatePlayIcon);
        updatePlayIcon();

        video.addEventListener('loadedmetadata', () => {
            initTimeline(video.duration);
            const paddedTotal = String(totalFrames).padStart(4, '0');
            timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)} (0000/${paddedTotal})`;
            if (timeline) timeline.setRange(0, totalFrames);
            if (autoplay) video.play();
        });

        video.addEventListener('timeupdate', () => {
            const currentFrame = Math.round(video.currentTime * fps);
            if (timeline) timeline.setPosition(currentFrame);
            const paddedFrame = String(currentFrame).padStart(4, '0');
            const paddedTotal = String(totalFrames).padStart(4, '0');
            timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)} (${paddedFrame}/${paddedTotal})`;

            redrawCurrentFrame();
        });

        /* ---------------- Drawing Logic ---------------- */
        const getCurrentFrame = () => Math.round(video.currentTime * fps);

        const DASH_PATTERN = [4, 4];

        const addPoint = (x, y) => {
            if (!currentStroke) return;
            currentStroke.points.push({ x, y });
        };

        const pointerDownDraw = (e) => {
            if (!drawingEnabled) return;
            e.preventDefault();
            video.pause();
            const rect = overlay.getBoundingClientRect();
            currentStroke = {
                color: DRAW_COLORS[drawColorIndex],
                colorVar: `var(${DRAW_COLOR_VARS[drawColorIndex]})`,
                points: []
            };
            addPoint(e.clientX - rect.left, e.clientY - rect.top);
            overlay.addEventListener('pointermove', pointerMoveDraw);
            document.addEventListener('pointerup', pointerUpDraw, { once: true });
        };

        const pointerMoveDraw = (e) => {
            const rect = overlay.getBoundingClientRect();
            addPoint(e.clientX - rect.left, e.clientY - rect.top);
            redrawCurrentFrame();
        };

        const pointerUpDraw = () => {
            overlay.removeEventListener('pointermove', pointerMoveDraw);
            if (currentStroke && currentStroke.points.length > 1) {
                const frame = getCurrentFrame();
                if (!strokesByFrame.has(frame)) {
                    strokesByFrame.set(frame, { strokes: [], thumbnail: null });
                }
                const frameData = strokesByFrame.get(frame);
                frameData.strokes.push(currentStroke);

                if (timeline && typeof timeline.addMarker === 'function') {
                    timeline.addMarker(frame, currentStroke.colorVar);
                }

                currentStroke = null;
                redrawCurrentFrame();
                frameData.thumbnail = overlay.toDataURL('image/png');
            }
            currentStroke = null;
        };

        const redrawCurrentFrame = () => {
            ctx.clearRect(0, 0, overlay.width, overlay.height);
            const frame = getCurrentFrame();
            const frameData = strokesByFrame.get(frame);
            const strokes = frameData ? frameData.strokes : [];

            const drawStroke = (stroke) => {
                if (!stroke || stroke.points.length < 2) return;
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = 2;
                ctx.setLineDash(DASH_PATTERN);
                ctx.beginPath();
                stroke.points.forEach((pt, idx) => {
                    if (idx === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                });
                ctx.stroke();
            };

            // Draw completed strokes for the current frame
            strokes.forEach(drawStroke);

            // Draw the live, in-progress stroke
            drawStroke(currentStroke);

            ctx.setLineDash([]); // reset
        };

        overlay.addEventListener('pointerdown', pointerDownDraw);

        // Resize observer to keep canvas in sync
        const resizeObs = new ResizeObserver(resizeOverlay);
        resizeObs.observe(video);

        // Initial overlay sizing after DOM ready
        setTimeout(resizeOverlay, 0);

        return wrapper;
    };
})(); 
    // --- markdownEditor.js ---

    if (!window.UI) window.UI = {};

    const md = window.markdownit({
        html: true,
        linkify: true,
        breaks: true
    });

    // --- Custom image rule to handle video embedding ---
    const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    const isYouTube = (url) => {
        const m = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
        return m ? m[1] : null;
    };

    md.renderer.rules.image = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const alt = (token.content || '').trim().toLowerCase();
        let url = token.attrGet('src');

        // Resolve '@/media' shorthand
        if (url && url.startsWith('@/media/')) {
            url = url.slice(2); // 'media/...'
        }

        if (alt === 'video') {
            const ytId = isYouTube(url);
            if (ytId) {
                return `<div class="markdown-video"><iframe width="560" height="315" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
            }
            return `<video class="markdown-video" controls src="${url}"><source src="${url}" type="video/mp4"></video>`;
        }

        // Update token src if modified
        if (url && url !== token.attrGet('src')) {
            token.attrSet('src', url);
        }
        // Not a video → fall back
        return defaultImageRender(tokens, idx, options, env, self);
    };

    // markdown-it handles parsing; no marked config needed

    /**
     * Creates a Markdown editor panel with live preview.
     * @param {object} [config]
     * @param {string} [config.initialMarkdown] - Initial markdown content.
     * @param {string} [config.height="300px"] - Height of the textarea editor.
     * @returns {HTMLElement} Panel element containing the editor.
     */
    UI.markdownEditor = function(config = {}) {
        const { initialMarkdown = '' } = config;

        const editorWrapper = document.createElement('div');
        editorWrapper.className = 'markdown-editor';

        /* ---------------- Toolbar ---------------- */
        const toolbar = document.createElement('div');
        toolbar.className = 'markdown-toolbar';

        let textarea;
        const surroundSelection = (prefix, suffix = prefix) => {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            textarea.value = value.slice(0, start) + prefix + value.slice(start, end) + suffix + value.slice(end);
            textarea.focus();
            textarea.selectionStart = start + prefix.length;
            textarea.selectionEnd = end + prefix.length;
            updatePreview();
        };

        const addToolbarButton = (icon, title, action) => {
            const btn = UI.button({ icon, variant: 'secondary', onclick: action, attributes: { title } });
            toolbar.appendChild(btn);
        };

        addToolbarButton('bold', 'Bold (**text**)', () => surroundSelection('**'));
        addToolbarButton('italic', 'Italic (*text*)', () => surroundSelection('*'));
        addToolbarButton('code', 'Inline Code (`code`)', () => surroundSelection('`'));
        addToolbarButton('hash', 'Heading (# )', () => surroundSelection('# ', ''));
        addToolbarButton('link', 'Link [text](url)', () => surroundSelection('[', '](url)'));

        const insertMarkdown = (snippet) => {
            const start = textarea.selectionStart;
            const value = textarea.value;
            textarea.value = value.slice(0, start) + snippet + value.slice(start);
            // Move caret to end of snippet
            const caret = start + snippet.length;
            textarea.selectionStart = textarea.selectionEnd = caret;
            updatePreview();
        };

        // Image and Video insert prompts
        addToolbarButton('image', 'Insert Image', () => {
            const url = prompt('Enter image URL');
            if (url) {
                insertMarkdown(`![alt text](${url})`);
            }
        });

        addToolbarButton('video', 'Insert Video', () => {
            const url = prompt('Enter video URL (YouTube link or video file)');
            if (url) {
                insertMarkdown(`![video](${url})`);
            }
        });

        /* ---------------- Editor ---------------- */
        const editorContainer = document.createElement('div');
        editorContainer.className = 'editor-container';

        textarea = document.createElement('textarea');
        textarea.className = 'form-control';
        // textarea will stretch via CSS flex to fill container height
        textarea.value = initialMarkdown;
        editorContainer.appendChild(textarea);

        /* ---------------- Preview ---------------- */
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';

        const preview = document.createElement('div');
        preview.className = 'markdown-preview';
        previewContainer.appendChild(preview);

        const contentRow = document.createElement('div');
        contentRow.className = 'editor-content-row';
        contentRow.appendChild(editorContainer);
        contentRow.appendChild(previewContainer);

        editorWrapper.appendChild(toolbar);
        editorWrapper.appendChild(contentRow);

        const updatePreview = () => {
            const raw = textarea.value;
            // Convert blank lines outside code fences to <br>
            const preprocess = (text) => {
                const lines = text.split('\n');
                let inCode = false;
                return lines.map(line => {
                    if (line.startsWith('```')) { inCode = !inCode; return line; }
                    if (!inCode && line.trim() === '') { return '<br>\n'; }
                    return line;
                }).join('\n');
            };

            const processed = preprocess(raw);
            let html = md.render(processed);

            html = DOMPurify.sanitize(html, {
                USE_PROFILES: { html: true },
                ADD_TAGS: ['video', 'source', 'iframe'],
                ADD_ATTR: ['controls', 'src', 'title', 'allow', 'allowfullscreen', 'frameborder', 'type']
            });
            preview.innerHTML = html;
            preview.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
            // Initialize Lucide icons within preview
            if (window.UI && typeof UI.deferIcons === 'function') {
                UI.deferIcons();
            }
        };

        textarea.addEventListener('input', updatePreview);
        setTimeout(updatePreview, 0);

        /* ---------------- Wrap in Panel ---------------- */
        const panel = UI.panel('Markdown Editor', editorWrapper, { icon: 'file-text', collapsible: true });
        return panel;
    };
})(); 
})();
