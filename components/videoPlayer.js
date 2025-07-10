(function() {
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

        /* ---------------- Draw Toggle ---------------- */
        let drawToggle;
        let drawingEnabled = false;
        let currentStroke = null;

        const setDrawStyle = (enabled) => {
            drawToggle.classList.toggle('btn-primary', enabled);
            overlay.style.pointerEvents = enabled ? 'auto' : 'none';
        };

        drawToggle = UI.iconToggle({
            iconOn: 'edit-3',
            iconOff: 'edit',
            tooltip: 'Toggle Draw',
            initialState: () => false,
            onchange: (enabled) => {
                drawingEnabled = enabled;
                setTimeout(() => setDrawStyle(enabled), 0);
            }
        });

        // Apply initial style
        setDrawStyle(false);

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

        // Timeline placeholder container (flex:1)
        const timelineHolder = document.createElement('div');
        timelineHolder.style.flex = '1';
        controls.appendChild(timelineHolder);

        // Append step, loop, draw buttons after timeline
        controls.appendChild(stepBackBtn);
        controls.appendChild(stepFwdBtn);
        controls.appendChild(loopToggle);
        controls.appendChild(drawToggle);

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

        const initTimeline = (durationSec) => {
            totalFrames = Math.round(durationSec * fps);
            if (timeline) timelineHolder.removeChild(timeline);
            timeline = UI.timeline({
                duration: totalFrames,
                current: 0,
                tickInterval: 1,
                majorTickInterval: 10,
                labelInterval: 10,
                snapIncrement: 1,
                onchange: (posFrame) => {
                    const targetTime = posFrame / fps;
                    if (Math.abs(video.currentTime - targetTime) > 0.02) {
                        video.currentTime = targetTime;
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
            timeLabel.textContent = `0:00 / ${formatTime(video.duration)} (0/${totalFrames})`;
            if (autoplay) video.play();
        });

        video.addEventListener('timeupdate', () => {
            const currentFrame = Math.round(video.currentTime * fps);
            if (timeline) timeline.setPosition(currentFrame);
            timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)} (${currentFrame}/${totalFrames})`;

            redrawCurrentFrame();
        });

        /* ---------------- Drawing Logic ---------------- */
        const getCurrentFrame = () => Math.round(video.currentTime * fps);

        const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#ff0000';
        const DRAW_COLOR = getCSSVar('--error');
        const DASH_PATTERN = [4, 4];

        const addPoint = (x, y) => {
            if (!currentStroke) return;
            currentStroke.push({ x, y });
            if (currentStroke.length > 1) {
                const p1 = currentStroke[currentStroke.length - 2];
                const p2 = currentStroke[currentStroke.length - 1];
                ctx.strokeStyle = DRAW_COLOR;
                ctx.lineWidth = 2;
                ctx.setLineDash(DASH_PATTERN);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        };

        const pointerDownDraw = (e) => {
            if (!drawingEnabled) return;
            e.preventDefault();
            const rect = overlay.getBoundingClientRect();
            currentStroke = [];
            addPoint(e.clientX - rect.left, e.clientY - rect.top);
            overlay.addEventListener('pointermove', pointerMoveDraw);
            document.addEventListener('pointerup', pointerUpDraw, { once: true });
        };

        const pointerMoveDraw = (e) => {
            const rect = overlay.getBoundingClientRect();
            addPoint(e.clientX - rect.left, e.clientY - rect.top);
        };

        const pointerUpDraw = () => {
            overlay.removeEventListener('pointermove', pointerMoveDraw);
            if (currentStroke && currentStroke.length > 1) {
                const frame = getCurrentFrame();
                if (!strokesByFrame.has(frame)) strokesByFrame.set(frame, []);
                strokesByFrame.get(frame).push(currentStroke);
                if (timeline && typeof timeline.addMarker === 'function') {
                    timeline.addMarker(frame, 'var(--error)');
                }
            }
            currentStroke = null;
        };

        const redrawCurrentFrame = () => {
            ctx.clearRect(0, 0, overlay.width, overlay.height);
            const frame = getCurrentFrame();
            const strokes = strokesByFrame.get(frame) || [];
            ctx.strokeStyle = DRAW_COLOR;
            ctx.lineWidth = 2;
            ctx.setLineDash(DASH_PATTERN);
            strokes.forEach(stroke => {
                ctx.beginPath();
                stroke.forEach((pt, idx) => {
                    if (idx === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                });
                ctx.stroke();
            });
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