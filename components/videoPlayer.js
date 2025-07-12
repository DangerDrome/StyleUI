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