// @ts-check

/**
 * @type {import('monocart-coverage-reports').CoverageReportOptions}
 */
const config = {
    reports: ['v8', 'text', 'text-summary', 'lcov'],
    outputDir: 'coverage',
    entryFilter: {
        '**/node_modules/**': false,
        '**/tests/**': false,
        '**/lib/**': true
    },
    sourceFilter: {
        '**/node_modules/**': false,
        '**/tests/**': false,
        '**/lib/**': true
    },
    onEnd: (coverageResults) => {
        const { summary } = coverageResults;
        const threshold = 100;
        /** @type {string[]} */
        const errors = [];

        for (const key of ['statements', 'branches', 'functions', 'lines']) {
            const actual = summary[key]?.pct;
            if (actual !== undefined && actual < threshold) {
                errors.push(`Coverage for ${key}: ${actual}% < ${threshold}%`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Coverage check failed:\n${errors.join('\n')}`);
        }
    }
};

module.exports = config;
