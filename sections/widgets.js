(function() {
    if (!window.UI) window.UI = {};
    if (!UI.sections) UI.sections = {};

    UI.sections.widgets = function() {
        const section = document.createElement('section');

        const title = 'Widgets';
        const blurb = 'Custom UI widgets for media and VFX tasks, such as interactive timelines.';

        const h2 = document.createElement('h2');
        h2.textContent = title;
        section.appendChild(h2);

        const p = document.createElement('p');
        p.className = 'text-lg text-secondary';
        p.textContent = blurb;
        section.appendChild(p);

        /* ---------------- Timeline Panel ---------------- */
        const timelineContent = document.createElement('div');

        const h5 = document.createElement('h5');
        h5.textContent = 'Timeline';
        timelineContent.appendChild(h5);

        const demoRow = document.createElement('div');
        demoRow.className = 'demo-row';
        timelineContent.appendChild(demoRow);

        const timelineContainer = document.createElement('div');
        timelineContainer.style.flex = '1';
        demoRow.appendChild(timelineContainer);

        const positionLabel = document.createElement('span');
        positionLabel.className = 'font-mono text-secondary';
        positionLabel.style.marginLeft = 'var(--space-3)';
        demoRow.appendChild(positionLabel);

        const timeline = UI.timeline({
            duration: 240,
            current: 60,
            markers: [
                { time: 120, color: 'var(--error)' },
                { time: 180, color: 'var(--warning)' }
            ],
            onchange(pos) {
                positionLabel.textContent = `${pos.toFixed(0)} / 240`;
            }
        });
        timelineContainer.appendChild(timeline);
        // Initial label value
        positionLabel.textContent = '60 / 240';

        const timelinePanel = UI.panel('Timeline', timelineContent, {
            icon: 'activity',
            collapsible: false
        });
        section.appendChild(timelinePanel);

        /* ---------------- Video Player Panel ---------------- */
        const player = UI.videoPlayer({ src: 'media/sqr_demo.mp4', poster: 'media/sqr_demo_thumb.webp' });
        const videoPanel = UI.panel('Video Player', player, {
            icon: 'video',
            collapsible: false
        });
        section.appendChild(videoPanel);

        return section;
    };
})(); 