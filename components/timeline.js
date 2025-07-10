(function() {
    if (!window.UI) window.UI = {};

    /**
     * Creates an interactive timeline widget with a draggable playhead.
     * @param {object} [config={}] - Configuration options.
     * @param {number} [config.duration=100] - Total length of the timeline (frames, seconds, etc.).
     * @param {number} [config.current=0] - Initial playhead position.
     * @param {Array<{time:number,color?:string}>} [config.markers] - Optional array of marker objects.
     * @param {function} [config.onchange] - Callback fired with new position whenever the playhead moves.
     * @returns {HTMLElement} Timeline element.
     */
    UI.timeline = function(config = {}) {
        const {
            duration = 100,
            current = 0,
            markers = [],
            tickInterval = 1,
            majorTickInterval = 50,
            labelInterval = 10,
            startRange = 0,
            endRange = duration,
            snapIncrement = 1,
            onchange,
            onrangechange
        } = config;

        // Helper function (hoisted)
        function clamp(val, min, max) {
            return Math.min(Math.max(val, min), max);
        }

        const snap = (val) => Math.round(val / snapIncrement) * snapIncrement;

        const container = document.createElement('div');
        container.className = 'timeline';

        const track = document.createElement('div');
        track.className = 'timeline-track';
        container.appendChild(track);

        // Progress (filled) bar
        const progressBar = document.createElement('div');
        progressBar.className = 'timeline-progress';
        track.appendChild(progressBar);

        // Draggable handle / playhead
        const handle = document.createElement('div');
        handle.className = 'timeline-handle';
        track.appendChild(handle);

        /* ---------------- Playback Range ---------------- */
        let rangeStart = clamp(startRange, 0, duration);
        let rangeEnd = clamp(endRange, rangeStart, duration);

        const rangeBar = document.createElement('div');
        rangeBar.className = 'timeline-range';
        track.appendChild(rangeBar);

        const startHandle = document.createElement('div');
        startHandle.className = 'timeline-range-handle handle-start';
        track.appendChild(startHandle);

        const endHandle = document.createElement('div');
        endHandle.className = 'timeline-range-handle handle-end';
        track.appendChild(endHandle);

        const updateRangeVisual = () => {
            const startPct = (rangeStart / duration) * 100;
            const endPct = (rangeEnd / duration) * 100;
            rangeBar.style.left = startPct + '%';
            rangeBar.style.width = (endPct - startPct) + '%';
            startHandle.style.left = startPct + '%';
            endHandle.style.left = endPct + '%';
        };

        const fireRangeChange = () => {
            if (typeof onrangechange === 'function') {
                onrangechange({ start: rangeStart, end: rangeEnd });
            }
        };

        updateRangeVisual();

        /* ----- Range Handle Interaction ----- */
        let draggingRangeHandle = null; // 'start' or 'end'

        const pointerDownRange = (type) => (e) => {
            draggingRangeHandle = type;
            document.addEventListener('pointermove', pointerMoveRange);
            document.addEventListener('pointerup', pointerUpRange, { once: true });
            e.stopPropagation();
            e.preventDefault();
        };

        const pointerMoveRange = (e) => {
            if (!draggingRangeHandle) return;
            const pos = clamp(positionFromEvent(e), 0, duration);
            if (draggingRangeHandle === 'start') {
                rangeStart = Math.min(pos, rangeEnd - 1);
            } else {
                rangeEnd = Math.max(pos, rangeStart + 1);
            }
            updateRangeVisual();
            fireRangeChange();
        };

        const pointerUpRange = () => {
            draggingRangeHandle = null;
            document.removeEventListener('pointermove', pointerMoveRange);
        };

        startHandle.addEventListener('pointerdown', pointerDownRange('start'));
        endHandle.addEventListener('pointerdown', pointerDownRange('end'));

        /* ---------------- Ruler ---------------- */
        const ruler = document.createElement('div');
        ruler.className = 'timeline-ruler';
        track.appendChild(ruler);

        if (tickInterval > 0) {
            for (let t = 0; t <= duration; t += tickInterval) {
                const pct = (t / duration) * 100;

                const tick = document.createElement('div');
                tick.className = 'timeline-tick';
                if (t % majorTickInterval === 0) {
                    tick.classList.add('timeline-tick-major');
                } else if (t % 10 === 0) {
                    tick.classList.add('timeline-tick-ten');
                } else if (t % 5 === 0) {
                    tick.classList.add('timeline-tick-five');
                }
                tick.style.left = pct + '%';
                ruler.appendChild(tick);

                if (t % labelInterval === 0) {
                    const label = document.createElement('span');
                    label.className = 'timeline-label';
                    label.textContent = t;
                    label.style.left = pct + '%';
                    ruler.appendChild(label);
                }
            }
        }

        /* ---------------- Markers ---------------- */
        const markerSet = new Set();

        const createMarker = (time, color) => {
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            if (color) marker.style.backgroundColor = color;
            const pct = (time / duration) * 100;
            marker.style.left = pct + '%';
            track.appendChild(marker);
        };

        // Render initial markers
        markers.forEach(({ time, color }) => {
            if (time < 0 || time > duration) return;
            if (markerSet.has(time)) return;
            markerSet.add(time);
            createMarker(time, color);
        });

        // ----- Helpers -----
        const setPosition = (pos) => {
            const clamped = clamp(snap(pos), 0, duration);
            const pct = (clamped / duration) * 100;
            progressBar.style.width = pct + '%';
            handle.style.left = pct + '%';
            if (typeof onchange === 'function') onchange(clamped);
        };

        // Initial render
        setPosition(current);

        // ----- Interaction -----
        let dragging = false;

        const positionFromEvent = (e) => {
            const rect = track.getBoundingClientRect();
            const x = e.clientX - rect.left; // distance from left edge
            const pct = clamp(x / rect.width, 0, 1);
            return snap(pct * duration);
        };

        const pointerDown = (e) => {
            dragging = true;
            document.addEventListener('pointermove', pointerMove);
            document.addEventListener('pointerup', pointerUp, { once: true });
            setPosition(positionFromEvent(e));
            e.preventDefault();
        };

        const pointerMove = (e) => {
            if (!dragging) return;
            setPosition(positionFromEvent(e));
        };

        const pointerUp = (e) => {
            dragging = false;
            document.removeEventListener('pointermove', pointerMove);
            setPosition(positionFromEvent(e));
        };

        // Click on track or drag handle
        track.addEventListener('pointerdown', pointerDown);
        handle.addEventListener('pointerdown', pointerDown);

        // Expose imperative API
        container.setPosition = setPosition;
        container.getPosition = () => +progressBar.style.width.replace('%', '') * duration / 100;

        container.addMarker = (time, color) => {
            const clamped = clamp(Math.round(time), 0, duration);
            if (markerSet.has(clamped)) return;
            markerSet.add(clamped);
            createMarker(clamped, color);
        };

        container.setRange = (start, end) => {
            rangeStart = clamp(snap(start), 0, duration);
            rangeEnd = clamp(snap(end), rangeStart, duration);
            updateRangeVisual();
        };

        container.getRange = () => ({ start: rangeStart, end: rangeEnd });

        // Initial range callback
        fireRangeChange();

        return container;
    };
})(); 