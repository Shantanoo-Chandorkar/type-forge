/**
 * Shared font size class map for UI strings that scale with the active
 * font size setting. Each entry provides two Tailwind text-size classes:
 *
 *   label — for section headings, column headers, and secondary text
 *   data  — for primary content: buttons, table rows, body strings
 *
 * small  → label: text-xs  (12px),  data: text-sm (14px)
 * medium → label: text-sm  (14px),  data: text-base (16px)
 * large  → label: text-base, (16px),  data: text-lg (18px)
 *
 * Consumed via getFontSizeClasses() to guarantee a safe fallback.
 */
const FONT_SIZE_CLASSES = {
    small: { label: 'text-xs', data: 'text-sm' },
    medium: { label: 'text-sm', data: 'text-base' },
    large: { label: 'text-base', data: 'text-lg' },
};

/**
 * Returns the label/data Tailwind class pair for the given font size id.
 * Falls back to medium if the id is unrecognised.
 *
 * @param {string} fontSizeId - One of 'small' | 'medium' | 'large'
 * @returns {{ label: string, data: string }}
 */
export function getFontSizeClasses(fontSizeId) {
    return FONT_SIZE_CLASSES[fontSizeId] ?? FONT_SIZE_CLASSES.medium;
}
