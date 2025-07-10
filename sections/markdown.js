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

## Makrdown

### H3 Heading

**Bold text**, *italic text*, ~~strikethrough~~, \`inline code\`.

> Blockquote with some *emphasis*.

## Lists

1. First item
2. Second item

- Bullet item
  - Nested bullet

## Table

| Framework | Stars | License |
|-----------|------:|:-------:|
| StyleUI   | <i data-lucide="star"></i> <i data-lucide="star"></i> <i data-lucide="star"></i> | MIT |

## Code

\`\`\`js
function hello() {
  console.log('Hello, StyleUI!');
}
\`\`\`

## Horizontal Rule

---

## Link & Image

[Visit StyleUI](https://github.com/Danger-Noodle/StyleUI)

![Logo](https://via.placeholder.com/100)

## Video Examples

![video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

![video](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4 "Sample MP4")

## Additional Images

![Remote Image](https://placekitten.com/400/300)`;

        // Insert the editor panel with the sample markdown
        section.appendChild(UI.markdownEditor({ initialMarkdown: sampleMarkdown }));

        return section;
    };
})(); 