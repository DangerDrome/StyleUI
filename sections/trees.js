(function() {
    if (!window.UI) window.UI = {};
    if (!UI.sections) UI.sections = {};

    UI.sections.trees = function() {
        const section = document.createElement('section');

        const title = 'Trees';
        const blurb = 'Trees are used to display hierarchical data. They can be used to represent a file system, a set of nested categories, or any other data that has a parent-child relationship.';
        
        const h2 = document.createElement('h2');
        h2.textContent = title;
        section.appendChild(h2);

        const p = document.createElement('p');
        p.className = 'text-lg text-secondary';
        p.textContent = blurb;
        section.appendChild(p);

        // --- Main container for the section ---
        const content = document.createElement('div');
        content.className = 'row';

        const h5 = document.createElement('h5');
        h5.textContent = 'Tree Examples';
        h5.className = 'col-12';
        content.appendChild(h5);

        // --- Refreshed Data Sets for Trees ---
        const fileExplorerData = [
            {
                label: 'Workspace', icon: 'folder', children: [
                    {
                        label: 'src', icon: 'folder', children: [
                            { label: 'index.js', icon: 'file-code' },
                            { label: 'helpers.js', icon: 'file-code' }
                        ]
                    },
                    {
                        label: 'assets', icon: 'folder', children: [
                            { label: 'logo.svg', icon: 'file-image' },
                            { label: 'bg.jpg', icon: 'file-image' }
                        ]
                    },
                    { label: 'package.json', icon: 'file-json' }
                ]
            }
        ];

        const navigationData = [
            {
                label: 'Sections', icon: 'list', children: [
                    { label: 'Introduction', href: '#intro', icon: 'book' },
                    { label: 'Getting Started', href: '#getting-started', icon: 'rocket' },
                    { label: 'API Reference', href: '#api', icon: 'code' }
                ]
            }
        ];

        // --- Settings Tree Data and Helpers ---
        function createDummyControl(controlData) {
            let controlElement;
            const container = document.createElement('div');
            container.className = 'setting-control-container';

            const labelsOnRight = ['Theme', 'Accent', 'Tint', 'Font', 'Spacing', 'Size', 'Stroke', 'Primary', 'Success', 'Warning', 'Error', 'Info', 'Language'];
            if (labelsOnRight.includes(controlData.label)) {
                container.classList.add('label-on-right');
            }

            const showLabel =
                (controlData.type !== 'icon-toggle' &&
                controlData.type !== 'swatch-picker' &&
                controlData.type !== 'cycle-button' &&
                controlData.type !== 'cycle-swatch') || labelsOnRight.includes(controlData.label);

            if (showLabel) {
                const label = document.createElement('span');
                label.className = 'setting-label';
                label.textContent = controlData.label;
                container.appendChild(label);
            }

            switch (controlData.type) {
                case 'icon-toggle':
                    controlElement = UI.iconToggle({
                        ...controlData, onchange: () => {}
                    });
                    break;
                case 'cycle-swatch':
                    controlElement = UI.cycleSwatch({...controlData, onchange: () => {} });
                    break;
                case 'cycle-button':
                     controlElement = UI.cycleButton({...controlData, onchange: () => {} });
                    break;
                case 'swatch-picker':
                    controlElement = document.createElement('button');
                    controlElement.className = 'btn btn-swatch';
                    controlElement.style.backgroundColor = `var(${controlData.property})`;
                    break;
            }
            if (controlElement) container.appendChild(controlElement);
            return container;
        }

        const settingsSections = [
            {
                id: 'settings-appearance', title: 'Appearance', icon: 'palette',
                controls: [
                    { type: 'icon-toggle', label: 'Theme', iconOn: 'moon', iconOff: 'sun' },
                    { type: 'cycle-swatch', label: 'Accent', states: [ { value: 'Default', colorVar: '--default-accent' }, { value: 'Primary', colorVar: '--primary' } ] },
                    { type: 'cycle-button', label: 'Tint', states: [ { value: 'none', icon: 'droplet' }, { value: 'primary', icon: 'zap' } ] }
                ]
            },
            {
                id: 'settings-typography', title: 'Typography', icon: 'type',
                controls: [ { type: 'icon-toggle', label: 'Font', iconOn: 'code', iconOff: 'text' } ]
            },
            {
                id: 'settings-icons', title: 'Icons', icon: 'award',
                controls: [
                    { type: 'icon-toggle', label: 'Size', iconOn: 'zoom-in', iconOff: 'zoom-out' },
                    { type: 'icon-toggle', label: 'Stroke', iconOn: 'bold', iconOff: 'minus' }
                ]
            },
            {
                id: 'settings-colors', title: 'Semantic Colors', icon: 'swatch-book',
                controls: [
                    { type: 'swatch-picker', label: 'Primary', property: '--primary' },
                    { type: 'swatch-picker', label: 'Success', property: '--success' },
                ]
            }
        ];
        
        const settingsTreeData = settingsSections.map(section => ({
            label: section.title,
            icon: section.icon,
            expanded: true,
            children: section.controls.map(controlData => ({
                label: '',
                icon: (controlData.type === 'icon-toggle' || controlData.type === 'swatch-picker' || controlData.type === 'cycle-button' || controlData.type === 'cycle-swatch') ? null : 'circle',
                element: createDummyControl(controlData)
            }))
        }));

        // --- Create Tree Examples in a Grid ---
        const createTreeExample = (title, data, isSettings = false) => {
            const col = document.createElement('div');
            col.className = isSettings ? 'col-6' : 'col-3';

            const card = UI.card({
                title,
                content: UI.tree(data),
                icon: 'tree-pine'
            });

            col.appendChild(card);
            return col;
        };

        content.appendChild(createTreeExample('File Explorer', fileExplorerData));
        content.appendChild(createTreeExample('Navigation', navigationData));
        content.appendChild(createTreeExample('Settings Panel', settingsTreeData, true));

        const panel = UI.panel('', content, { 
            icon: 'tree-pine',
            collapsible: false
        });

        section.appendChild(panel);
        UI.icons();
        return section;
    };
})(); 