/**
 * Shared layout constants to ensure visual consistency across the application.
 */

/** Width of the secondary detail sidebar */
export const DETAIL_SIDEBAR_WIDTH = "32rem";

/** Default transition duration for layout changes */
export const LAYOUT_TRANSITION_DURATION = "320ms";

/** Default transition curve for layout changes (Smooth Quart-Out) */
export const LAYOUT_TRANSITION_CURVE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Panels that trigger the key picker / editor overlay */
export const PANELS_SUPPORTING_PICKER = ["tapdances", "combos", "macros", "overrides"] as const;

/** Size of the scroll buffer used to hide workspace content under the sidebar */
export const SCROLL_BUFFER_SIZE = 1000;

/** Padding added to panels for visual separation */
export const PANEL_PADDING_X = "1.5rem"; // 24px
