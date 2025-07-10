(function() {
    'use strict';

    const createVariablesSection = () => {
        const section = document.createElement('section');

        const title = 'CSS Variables';
        const blurb = 'This section documents all the global CSS variables (custom properties) used in the design system. These variables are the foundation of the UI\'s look and feel.';

        const h2 = document.createElement('h2');
        h2.textContent = title;
        section.appendChild(h2);

        const p = document.createElement('p');
        p.className = 'text-lg text-secondary';
        p.textContent = blurb;
        section.appendChild(p);

        const content = document.createElement('div');
        content.className = 'row';

        const createCardAndHeader = (title, variables) => {
            if (!variables || variables.length === 0) return null;
            
            const container = document.createElement('div');
            container.className = 'col-6';

            const h5 = document.createElement('h5');
            h5.textContent = title;
            container.appendChild(h5);

            const table = document.createElement('table');
            table.className = 'variables-table';
            
            const tbody = document.createElement('tbody');
            variables.forEach(v => {
                const tr = document.createElement('tr');
                let preview = '';

                if (v.type === 'color') {
                    preview = `<span class="variable-color-swatch" style="background-color: ${v.value};"></span>`;
                } else if (v.type === 'font') {
                    preview = `<span style="font-family: ${v.value};">Sample Text</span>`;
                } else if (v.type === 'spacing') {
                    preview = `<div style="width: ${v.value}; height: 20px; background: var(--accent); border-radius: var(--radius-sm);"></div>`;
                } else if (v.type === 'radius') {
                    preview = `<div style="width: 80px; height: 30px; background: var(--accent); border-radius: ${v.value};"></div>`;
                } else {
                    preview = `<code>${v.value}</code>`;
                }

                tr.innerHTML = `
                    <td><code>${v.name}</code><p class="small text-secondary" style="margin:0;max-width:none;">${v.desc}</p></td>
                    <td>${preview}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            container.appendChild(table);
            return container;
        };

        const varGroups = {
            'Typography': [
                { name: '--font-system', value: "Inter, 'Noto Sans SC', PingFang SC, 'Microsoft YaHei', Heiti SC, sans-serif", desc: 'Primary application font family.', type: 'font' },
                { name: '--font-mono', value: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace", desc: 'Monospaced font for code.', type: 'font' },
                { name: '--font-size-3xs', value: "0.5rem", desc: 'Tiny size, e.g., for tags.', type: 'spacing' },
                { name: '--text-xs', value: "0.75rem", desc: 'Extra-small text size.', type: 'spacing' },
                { name: '--text-sm', value: "0.875rem", desc: 'Small text size.', type: 'spacing' },
                { name: '--text-base', value: "1rem", desc: 'Base text size.', type: 'spacing' },
                { name: '--text-lg', value: "1.125rem", desc: 'Large text size.', type: 'spacing' },
                { name: '--font-light', value: "300", desc: 'Light font weight.', type: 'string' },
                { name: '--font-normal', value: "400", desc: 'Normal font weight.', type: 'string' },
                { name: '--font-medium', value: "500", desc: 'Medium font weight.', type: 'string' },
                { name: '--font-semibold', value: "600", desc: 'Semibold font weight.', type: 'string' },
                { name: '--font-bold', value: "700", desc: 'Bold font weight.', type: 'string' },
                { name: '--line-height-tight', value: "1.25", desc: 'Tight line height.', type: 'string' },
                { name: '--line-height-normal', value: "1.5", desc: 'Normal line height.', type: 'string' },
                { name: '--line-height-relaxed', value: "1.75", desc: 'Relaxed line height.', type: 'string' },
            ],
            'Colors': [
                { name: '--accent', value: '#b5d3b6', desc: 'Main accent color.', type: 'color' },
                { name: '--accent-hover', value: '#9fc5a1', desc: 'Accent hover color.', type: 'color' },
                { name: '--accent-text', value: '#2c592d', desc: 'Text on accent background.', type: 'color' },
                { name: '--primary', value: '#b3d9ff', desc: 'Primary action color.', type: 'color' },
                { name: '--success', value: '#b8e6b8', desc: 'Success state color.', type: 'color' },
                { name: '--warning', value: '#ffe4a3', desc: 'Warning state color.', type: 'color' },
                { name: '--error', value: '#ffb3ba', desc: 'Error state color.', type: 'color' },
                { name: '--info', value: '#d4c5f9', desc: 'Information color.', type: 'color' },
                { name: '--neutral', value: '#e8e3d9', desc: 'Neutral state color.', type: 'color' },
                { name: '--primary-dark', value: '#0059b3', desc: 'Dark primary for text.', type: 'color' },
                { name: '--success-dark', value: '#1e7e34', desc: 'Dark success for text.', type: 'color' },
                { name: '--warning-dark', value: '#856404', desc: 'Dark warning for text.', type: 'color' },
                { name: '--error-dark', value: '#721c24', desc: 'Dark error for text.', type: 'color' },
                { name: '--info-dark', value: '#492a7c', desc: 'Dark info for text.', type: 'color' },
            ],
            'Background Colors': [
                 { name: '--bg-layer-0', value: "#a8a8a0", desc: 'Base background layer.', type: 'color' },
                 { name: '--bg-layer-1', value: "#b4b4ac", desc: 'First-level background.', type: 'color' },
                 { name: '--bg-layer-2', value: "#c0c0b8", desc: 'Second-level background.', type: 'color' },
                 { name: '--bg-layer-3', value: "#9c9c94", desc: 'Third-level background.', type: 'color' },
                 { name: '--bg-layer-4', value: "#90908c", desc: 'Fourth-level background.', type: 'color' },
            ],
            'Text Colors': [
                { name: '--text-primary', value: '#424242', desc: 'Primary text color.', type: 'color' },
                { name: '--text-secondary', value: '#616161', desc: 'Secondary text color.', type: 'color' },
                { name: '--text-tertiary', value: '#757575', desc: 'Tertiary text color.', type: 'color' },
                { name: '--text-disabled', value: '#bdbdbd', desc: 'Disabled text color.', type: 'color' },
            ],
            'Spacing': [
                { name: '--space-1', value: '0.25rem', desc: '2px', type: 'spacing' },
                { name: '--space-2', value: '0.5rem', desc: '4px', type: 'spacing' },
                { name: '--space-4', value: '1rem', desc: '8px', type: 'spacing' },
                { name: '--space-6', value: '1.5rem', desc: '12px', type: 'spacing' },
                { name: '--space-8', value: '2rem', desc: '16px', type: 'spacing' },
                { name: '--space-12', value: '3rem', desc: '24px', type: 'spacing' },
            ],
            'Border Radius': [
                { name: '--radius-sm', value: '0.25rem', desc: 'Small border radius.', type: 'radius' },
                { name: '--radius-md', value: '0.375rem', desc: 'Medium border radius.', type: 'radius' },
                { name: '--radius-lg', value: '0.5rem', desc: 'Large border radius.', type: 'radius' },
                { name: '--radius-full', value: '9999px', desc: 'Full (pill) border radius.', type: 'radius' },
            ],
            'Shadows': [
                { name: '--shadow-sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', desc: 'Small shadow.', type: 'string' },
                { name: '--shadow-md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), ...', desc: 'Medium shadow.', type: 'string' },
                { name: '--shadow-lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), ...', desc: 'Large shadow.', type: 'string' },
            ],
            'Z-Index': [
                { name: '--z-dropdown', value: '1000', desc: 'Dropdowns.', type: 'string' },
                { name: '--z-modal', value: '1050', desc: 'Modals.', type: 'string' },
                { name: '--z-tooltip', value: '1070', desc: 'Tooltips.', type: 'string' },
            ]
        };

        for (const groupName in varGroups) {
            const cardElement = createCardAndHeader(groupName, varGroups[groupName]);
            if (cardElement) {
                content.appendChild(cardElement);
            }
        }

        const panel = UI.panel('', content, {
            icon: 'book-marked',
            collapsible: false
        });
        
        section.appendChild(panel);

        return section;
    };

    window.UI = window.UI || {};
    window.UI.sections = window.UI.sections || {};
    window.UI.sections.variables = createVariablesSection;

})(); 