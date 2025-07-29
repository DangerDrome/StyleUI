/*! 
 * StyleUI ES Module Export
 * License: MIT
 */

// Import the bundled StyleUI (you'll need to include styleui.js before this in your HTML)
// Or use this module after the UI global is available

// Helper to ensure UI is available
const getUI = () => {
    if (typeof window !== 'undefined' && window.UI) {
        return window.UI;
    }
    throw new Error('StyleUI: window.UI is not available. Make sure to load styleui.js first.');
};

// Export all component factories
export const button = (...args) => getUI().button(...args);
export const iconToggle = (...args) => getUI().iconToggle(...args);
export const cycleButton = (...args) => getUI().cycleButton(...args);
export const cycleSwatch = (...args) => getUI().cycleSwatch(...args);
export const swatch = (...args) => getUI().swatch(...args);

export const card = (...args) => getUI().card(...args);

export const form = (...args) => getUI().form(...args);
export const field = (...args) => getUI().field(...args);
export const input = (...args) => getUI().input(...args);
export const select = (...args) => getUI().select(...args);
export const textarea = (...args) => getUI().textarea(...args);
export const checkbox = (...args) => getUI().checkbox(...args);
export const radio = (...args) => getUI().radio(...args);
export const toggle = (...args) => getUI().toggle(...args);
export const datepicker = (...args) => getUI().datepicker(...args);
export const colorpicker = (...args) => getUI().colorpicker(...args);

export const menu = (...args) => getUI().menu(...args);
export const menuItem = (...args) => getUI().menuItem(...args);
export const menuDivider = () => getUI().menuDivider();

export const modal = (...args) => getUI().modal(...args);

export const panel = (...args) => getUI().panel(...args);

export const toast = (...args) => getUI().toast(...args);

export const tooltip = (...args) => getUI().tooltip(...args);

export const tree = (...args) => getUI().tree(...args);

export const timeline = (...args) => getUI().timeline(...args);

export const videoPlayer = (...args) => getUI().videoPlayer(...args);

export const markdownEditor = (...args) => getUI().markdownEditor(...args);

// Export utility functions
export const icons = () => getUI().icons();
export const deferIcons = () => getUI().deferIcons();
export const buildClasses = (...args) => getUI().buildClasses(...args);
export const escapeHtml = (...args) => getUI().escapeHtml(...args);
export const renderMarkdown = (...args) => getUI().renderMarkdown(...args);

// Export theme utilities
export const theme = {
    get: () => getUI().theme.get(),
    set: (theme) => getUI().theme.set(theme),
    toggle: () => getUI().theme.toggle()
};

// Export sections (if needed for programmatic use)
export const sections = {
    createAll: (container) => getUI().sections.createAll(container),
    // Add individual section creators if needed
};

// Default export of the entire UI object
export default getUI;