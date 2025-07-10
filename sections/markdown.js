(function() {
    if (!window.UI) window.UI = {};
    if (!UI.sections) UI.sections = {};

    UI.sections.markdown = function() {
        const section = document.createElement('section');
        section.id = 'section-markdown';

        const h2 = document.createElement('h2');
        h2.textContent = 'Markdown Editor';
        section.appendChild(h2);

        const p = document.createElement('p');
        p.className = 'text-lg text-secondary';
        p.textContent = 'An embedded Markdown editor with live preview using StyleUI components.';
        section.appendChild(p);

        // Comprehensive sample demonstrating various markdown features
        const sampleMarkdown = `# StyleUI

## Styles
---

**Bold text**, *italic text*, ~~strikethrough~~, \`inline code\`.

> Blockquote with some *emphasis*.


## Lists
---

1. First item
2. Second item

- Bullet item
  - Nested bullet

## Table
---

| Framework | Stars | License |
|-----------|------:|:-------:|
| StyleUI   | <i data-lucide="star"></i> <i data-lucide="star"></i> <i data-lucide="star"></i> | MIT |

## Code
---
\`\`\`js
function hello() {
  console.log('Hello, StyleUI!');
}
\`\`\`

## Video
---
![video](@/media/sqr_demo.mp4 "Local MP4")

## Image
---
![Remote Image](@/media/sqr_demo_thumb.webp)`;

        // Insert the editor panel with the sample markdown
        section.appendChild(UI.markdownEditor({ initialMarkdown: sampleMarkdown }));

        return section;
    };
})(); 