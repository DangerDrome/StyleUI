(function() {
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

        // ----- Path Edge Layer -----
        const edgeLayer = document.createElement('div');
        edgeLayer.className = 'tree-edge-layer';
        edgeLayer.style.position = 'absolute';
        edgeLayer.style.top = '0';
        edgeLayer.style.left = '0';
        edgeLayer.style.right = '0';
        edgeLayer.style.bottom = '0';
        container.appendChild(edgeLayer);

        let selectedContent = null;

        const EDGE_THICKNESS = 2; // must match CSS thickness
        const CONNECTOR_OFFSET = 8; // left offset used in CSS
        const EDGE_GAP = 6; // gap between edge and item content (px)

        function clearEdges() {
            edgeLayer.innerHTML = '';
        }

        function addEdge(style) {
            const edge = document.createElement('div');
            edge.className = 'tree-edge-dynamic';
            Object.assign(edge.style, style);
            edgeLayer.appendChild(edge);
        }

        function positionEdges(targetContent) {
            clearEdges();
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
                    addEdge({
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
                    addEdge({
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
                addEdge({
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