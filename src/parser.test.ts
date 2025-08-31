import { CodeBlockParser } from './parser';

// Simple test function - can be run with node if needed
function testCodeBlockParser() {
    const parser = new CodeBlockParser();

    console.log('Testing Code Block Parser...\n');

    // Test 1: Basic language parsing
    const config1 = parser.parseCodeBlockConfig('javascript');
    console.log('Test 1 - Basic language:', config1);
    console.assert(config1.language === 'javascript', 'Should parse basic language');

    // Test 2: Language with line numbers
    const config2 = parser.parseCodeBlockConfig('typescript ln');
    console.log('Test 2 - With line numbers:', config2);
    console.assert(config2.showLineNumbers === true, 'Should enable line numbers');

    // Test 3: Complex configuration
    const config3 = parser.parseCodeBlockConfig('python hl:1,3-5 ln:10 title:"My Script" fold');
    console.log('Test 3 - Complex config:', config3);
    console.assert(config3.language === 'python', 'Should parse language');
    console.assert(config3.highlightLines.includes(1), 'Should include line 1');
    console.assert(config3.highlightLines.includes(3), 'Should include line 3');
    console.assert(config3.highlightLines.includes(5), 'Should include line 5');
    console.assert(config3.startLineNumber === 10, 'Should start at line 10');
    console.assert(config3.title === 'My Script', 'Should parse title');
    console.assert(config3.fold === true, 'Should enable folding');

    // Test 4: Language aliases
    const config4 = parser.parseCodeBlockConfig('js');
    console.log('Test 4 - Language alias:', config4);
    console.assert(config4.language === 'javascript', 'Should normalize js to javascript');

    // Test 5: Invalid input handling
    const config5 = parser.parseCodeBlockConfig('');
    console.log('Test 5 - Empty input:', config5);
    console.assert(config5.language === 'text', 'Should default to text');

    // Test 6: Inline code parsing
    const inline1 = parser.parseInlineCode('{js} console.log("hello")');
    console.log('Test 6 - Inline code (format 1):', inline1);
    console.assert(inline1?.lang === 'javascript', 'Should parse js inline code');

    const inline2 = parser.parseInlineCode('python: print("hello")');
    console.log('Test 7 - Inline code (format 2):', inline2);
    console.assert(inline2?.lang === 'python', 'Should parse python inline code');

    const inline3 = parser.parseInlineCode('[ts] const x: string = "test"');
    console.log('Test 8 - Inline code (format 3):', inline3);
    console.assert(inline3?.lang === 'typescript', 'Should parse ts inline code');

    // Test 7: Config validation
    const validConfig = {
        language: 'javascript',
        highlightLines: [1, 2, 3],
        showLineNumbers: true,
        startLineNumber: 1,
        fold: false,
        unfold: false,
        exclude: false
    };
    const isValid = parser.validateConfig(validConfig);
    console.log('Test 9 - Config validation (valid):', isValid);
    console.assert(isValid === true, 'Should validate correct config');

    const invalidConfig = {
        language: 'javascript',
        highlightLines: [1, 2, 3],
        showLineNumbers: true,
        startLineNumber: -1, // Invalid
        fold: true,
        unfold: true, // Conflicting with fold
        exclude: false
    };
    const isInvalid = parser.validateConfig(invalidConfig);
    console.log('Test 10 - Config validation (invalid):', isInvalid);
    console.assert(isInvalid === false, 'Should reject invalid config');

    // Test 8: Config sanitization
    const sanitized = parser.sanitizeConfig(invalidConfig);
    console.log('Test 11 - Config sanitization:', sanitized);
    console.assert(sanitized.startLineNumber === 1, 'Should fix invalid start line');
    console.assert(sanitized.fold === false, 'Should resolve fold/unfold conflict');

    console.log('\n✅ All tests passed!');
}

// Export for use in other files
export { testCodeBlockParser };

// If this file is run directly, execute tests
if (require.main === module) {
    testCodeBlockParser();
}
