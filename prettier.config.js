// @ts-check

/**
 * @param {string[][]} groups
 */
const generateImportOrder = groups => {
    const result = [];
    const groupBreak = '';

    for (const group of groups) {
        result.push(...group, groupBreak);
    }

    return result;
};

/**
 * @type {import('@ianvs/prettier-plugin-sort-imports').PrettierConfig}
 */
const config = {
    singleQuote: true,
    jsxSingleQuote: true,
    semi: true,
    arrowParens: 'avoid',
    printWidth: 120,
    tabWidth: 4,
    trailingComma: 'all',

    plugins: ['@ianvs/prettier-plugin-sort-imports'],
    importOrder: generateImportOrder([
        [
            '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
            '^(next/(.*)$)|^(next$)',
            '<BUILTIN_MODULES>',
            '<THIRD_PARTY_MODULES>',
        ],
        ['^@workspace/(.*)$'],
        ['^~(.*)$'],
        ['^[../]', '^[./]'],
    ]),

    /**
     * >=5.x
     */
    importOrderTypeScriptVersion: '5.0.0',
};

export default config;
