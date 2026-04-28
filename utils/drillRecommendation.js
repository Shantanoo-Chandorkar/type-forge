const PUNCTUATION_KEYS = new Set([',', '.', ';', "'", '-', ':', '!', '?']);
const NUMBER_KEYS = new Set([
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
]);
const CODE_SYMBOL_KEYS = new Set([
    '{',
    '}',
    '(',
    ')',
    '[',
    ']',
    '=',
    '>',
    '<',
    '/',
    '\\',
    '|',
    '+',
    '_',
    '`',
]);

/**
 * Analyzes a per-key error map and returns a drill recommendation based on
 * the dominant error category (punctuation, numbers, code symbols, or letters).
 *
 * @param {Record<string, number>} keyErrors - Map of character to error count for this test
 * @param {number} wpm - Words per minute achieved in this test
 * @returns {{ contentMode: string, difficulty: string, label: string } | null}
 *   Null when no errors were recorded.
 */
export function getDrillRecommendation(keyErrors, wpm) {
    const entries = Object.entries(keyErrors ?? {});
    if (entries.length === 0) return null;

    let punctCount = 0;
    let numberCount = 0;
    let codeCount = 0;
    let letterCount = 0;

    for (const [key, count] of entries) {
        if (PUNCTUATION_KEYS.has(key)) punctCount += count;
        else if (NUMBER_KEYS.has(key)) numberCount += count;
        else if (CODE_SYMBOL_KEYS.has(key)) codeCount += count;
        else if (/[a-zA-Z]/.test(key)) letterCount += count;
    }

    const total = punctCount + numberCount + codeCount + letterCount;
    if (total === 0) return null;

    if (codeCount / total > 0.3) {
        return {
            contentMode: 'code',
            difficulty: 'easy',
            label: 'Code symbols drill (JavaScript)',
        };
    }
    if (numberCount / total > 0.3) {
        return {
            contentMode: 'punctuation',
            difficulty: 'hard',
            label: 'Numbers & symbols drill (Hard)',
        };
    }
    if (punctCount / total > 0.3) {
        return {
            contentMode: 'punctuation',
            difficulty: 'medium',
            label: 'Punctuation drill (Medium)',
        };
    }
    if (letterCount / total > 0.5 && wpm < 40) {
        return {
            contentMode: 'common-words',
            difficulty: 'easy',
            label: 'Common words drill (Easy)',
        };
    }
    if (letterCount / total > 0.5) {
        return {
            contentMode: 'common-words',
            difficulty: 'medium',
            label: 'Common words drill (Medium)',
        };
    }

    return { contentMode: 'quotes', difficulty: 'medium', label: 'Quotes (Medium)' };
}
