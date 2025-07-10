(function() {
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