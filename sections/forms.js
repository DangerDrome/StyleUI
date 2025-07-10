(function() {
    'use strict';

    function createFormsSection() {
        const section = document.createElement('section');
        
        const title = 'Forms';
        const blurb = 'This section demonstrates various form controls, including text inputs, selection inputs, checkboxes, and radio buttons. All components are styled for consistency and accessibility.';

        const h2 = document.createElement('h2');
        h2.textContent = title;
        section.appendChild(h2);

        const p = document.createElement('p');
        p.className = 'text-lg text-secondary';
        p.textContent = blurb;
        section.appendChild(p);
        
        const content = document.createElement('div');
        
        const form = document.createElement('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            UI.toast('Form submitted! (Not really)', 'success');
        });

        // --- Text Inputs ---
        const h5Text = document.createElement('h5');
        h5Text.textContent = 'Text Inputs';
        form.appendChild(h5Text);
        
        const row1 = document.createElement('div');
        row1.className = 'row';
        const col1_1 = document.createElement('div');
        col1_1.className = 'col-6';
        col1_1.appendChild(UI.formGroup({ id: 'name-ex', label: 'Full Name', placeholder: 'Enter your full name' }));
        const col1_2 = document.createElement('div');
        col1_2.className = 'col-6';
        col1_2.appendChild(UI.formGroup({ id: 'email-ex', type: 'email', label: 'Email Address', placeholder: 'you@example.com' }));
        row1.appendChild(col1_1);
        row1.appendChild(col1_2);
        form.appendChild(row1);

        const row2 = document.createElement('div');
        row2.className = 'row';
        const col2_1 = document.createElement('div');
        col2_1.className = 'col-6';
        col2_1.appendChild(UI.formGroup({ id: 'password-ex', type: 'password', label: 'Password', placeholder: 'Enter a secure password' }));
        const col2_2 = document.createElement('div');
        col2_2.className = 'col-6';
        col2_2.appendChild(UI.formGroup({ id: 'number-ex', type: 'number', label: 'Quantity', placeholder: '1' }));
        row2.appendChild(col2_1);
        row2.appendChild(col2_2);
        form.appendChild(row2);
        
        const row3 = document.createElement('div');
        row3.className = 'row';
        const col3_1 = document.createElement('div');
        col3_1.className = 'col-6';
        col3_1.appendChild(UI.dateGroup({ id: 'date-ex', label: 'Start Date' }));
        const col3_2 = document.createElement('div');
        col3_2.className = 'col-6';
        col3_2.appendChild(UI.colorGroup({ id: 'color-ex', label: 'Accent Color', value: '#b5d3b6' }));
        row3.appendChild(col3_1);
        row3.appendChild(col3_2);
        form.appendChild(row3);

        const row4 = document.createElement('div');
        row4.className = 'row';
        const col4_1 = document.createElement('div');
        col4_1.className = 'col-12';
        col4_1.appendChild(UI.formGroup({ id: 'message-ex', type: 'textarea', label: 'Message', placeholder: 'Write your message here...' }));
        row4.appendChild(col4_1);
        form.appendChild(row4);


        // --- Selection Inputs ---
        const h5Select = document.createElement('h5');
        h5Select.textContent = 'Selection Inputs';
        form.appendChild(h5Select);

        form.appendChild(UI.customSelectGroup({
            id: 'country-ex',
            label: 'Country',
            options: [
                { value: 'us', text: 'United States' },
                { value: 'ca', text: 'Canada' },
                { value: 'gb', text: 'United Kingdom' },
                { value: 'au', text: 'Australia' },
            ]
        }));

        form.appendChild(UI.rangeGroup({
            id: 'zoom-ex',
            label: 'Range Slider',
            min: 50,
            max: 200,
            step: 10,
            value: 100
        }));

        // --- Checkboxes & Radio Buttons ---
        const h5Check = document.createElement('h5');
        h5Check.textContent = 'Checkboxes & Radio Buttons';
        form.appendChild(h5Check);

        const checkRow = document.createElement('div');
        checkRow.className = 'row';

        // Checkboxes
        const checkContainer = document.createElement('div');
        checkContainer.className = 'col-6';
        const pCheck = document.createElement('p');
        pCheck.textContent = 'Semantic Checkboxes';
        pCheck.className = 'text-secondary';
        checkContainer.appendChild(pCheck);
        const checkGroup = document.createElement('div');
        checkGroup.className = 'check-group';
        
        ['primary', 'success', 'warning', 'error', 'info'].forEach((variant, i) => {
            checkGroup.appendChild(UI.checkbox({ id: `check-${variant}`, label: variant.charAt(0).toUpperCase() + variant.slice(1), name: `check-group-${variant}`, variant: variant, checked: i < 2 }));
        });

        checkContainer.appendChild(checkGroup);
        checkRow.appendChild(checkContainer);

        // Radios
        const radioContainer = document.createElement('div');
        radioContainer.className = 'col-6';
        const pRadio = document.createElement('p');
        pRadio.textContent = 'Semantic Radio Buttons';
        pRadio.className = 'text-secondary';
        radioContainer.appendChild(pRadio);
        const radioGroup = document.createElement('div');
        radioGroup.className = 'check-group';
        ['primary', 'success', 'warning', 'error', 'info'].forEach((variant, i) => {
            radioGroup.appendChild(UI.radio({ id: `radio-${variant}`, label: variant.charAt(0).toUpperCase() + variant.slice(1), name: 'radio-group-semantic', variant: variant, checked: i === 0 }));
        });
        radioContainer.appendChild(radioGroup);
        checkRow.appendChild(radioContainer);

        form.appendChild(checkRow);
        
        // --- Form Actions ---
        const actions = document.createElement('div');
        actions.className = 'form-actions';
        actions.appendChild(UI.button({ text: 'Cancel', variant: 'secondary' }));
        actions.appendChild(UI.button({ text: 'Submit', variant: 'primary', attributes: { type: 'submit' }}));
        form.appendChild(actions);

        content.appendChild(form);

        const panel = UI.panel('', content, {
            icon: 'text-cursor-input',
            collapsible: false
        });

        section.appendChild(panel);

        return section;
    }

    // Expose to global scope
    window.UI = window.UI || {};
    window.UI.sections = window.UI.sections || {};
    window.UI.sections.forms = createFormsSection;

})(); 