# Step 4: Code Block Parser - Enhanced Implementation

## Overview

The `CodeBlockParser` class is responsible for parsing and interpreting code block configurations in Obsidian markdown. It supports a rich syntax for customizing code block appearance and behavior.

## Features Implemented

### 1. **Language Parsing**

-   Supports standard language identifiers (e.g., `javascript`, `python`, `cpp`)
-   Includes language aliases (e.g., `js` → `javascript`, `py` → `python`)
-   Normalizes language names for consistency

### 2. **Line Highlighting**

-   **Single lines**: `hl:3` highlights line 3
-   **Ranges**: `hl:1-5` highlights lines 1 through 5
-   **Multiple**: `hl:1,3,5-7` highlights lines 1, 3, and 5-7
-   **Error handling**: Invalid ranges are ignored with warnings

### 3. **Line Numbers**

-   **Enable**: `ln` or `ln:true` enables line numbers
-   **Disable**: `ln:false` disables line numbers
-   **Custom start**: `ln:10` starts numbering from line 10

### 4. **Titles and Labels**

-   **Title**: `title:"My Code"` sets a custom title
-   **File reference**: `file:script.js` shows filename as title
-   **Quote handling**: Supports both single and double quotes
-   **Escape sequences**: Handles `\"`, `\'`, `\\n`, `\\t`, etc.

### 5. **Folding Controls**

-   **Fold**: `fold` makes the code block collapsible
-   **Unfold**: `unfold` forces code block to be expanded
-   **Mutual exclusivity**: Cannot have both fold and unfold

### 6. **Advanced Options**

-   **Exclude**: `exclude` skips processing for this block
-   **Custom theme**: `theme:github-dark` applies specific theme

### 7. **Inline Code Support**

Multiple formats supported:

-   `{js} console.log("hello")` - Curly brace format
-   `python: print("hello")` - Colon format
-   `[ts] const x: string = "test"` - Bracket format

## Usage Examples

### Basic Usage

````markdown
```javascript
console.log("Hello World");
```
````

````

### With Line Numbers
```markdown
```python ln
def hello():
    print("Hello World")
````

````

### Complex Configuration
```markdown
```typescript hl:1,3-5 ln:10 title:"Main Function" fold theme:github-dark
interface User {
    name: string;
    age: number;
}

function createUser(name: string, age: number): User {
    return { name, age };
}
````

````

### Inline Code
- `{js} console.log("test")`
- `python: print("hello")`
- `[css] .class { color: red; }`

## API Reference

### `parseCodeBlockConfig(langString: string): CodeBlockConfig`
Parses a language string and returns a configuration object.

**Parameters:**
- `langString`: The language identifier and parameters (e.g., "javascript hl:1-3 ln")

**Returns:** `CodeBlockConfig` object with parsed settings

### `parseInlineCode(text: string): { lang: string; code: string } | null`
Parses inline code with language specification.

**Parameters:**
- `text`: Inline code text with language prefix

**Returns:** Object with `lang` and `code` properties, or `null` if not parseable

### `validateConfig(config: CodeBlockConfig): boolean`
Validates a code block configuration for correctness.

### `sanitizeConfig(config: CodeBlockConfig): CodeBlockConfig`
Sanitizes and normalizes a configuration object.

### `getSupportedLanguages(): string[]`
Returns array of supported language identifiers and aliases.

## Error Handling

The parser includes robust error handling:

1. **Invalid parameters** are logged as warnings and ignored
2. **Malformed ranges** (e.g., `hl:abc`) are skipped
3. **Empty inputs** default to safe values
4. **Conflicting options** (fold + unfold) are resolved automatically
5. **Invalid line numbers** are normalized to valid ranges

## Language Aliases

The parser supports common language aliases:

| Alias | Resolves To |
|-------|-------------|
| `js` | `javascript` |
| `ts` | `typescript` |
| `py` | `python` |
| `rb` | `ruby` |
| `sh`, `bash` | `shell` |
| `yml` | `yaml` |
| `md` | `markdown` |
| `jsx` | `javascript` |
| `tsx` | `typescript` |

## Integration

The parser integrates with the main plugin through:

1. **Main processor**: `processCodeBlocks()` method uses parser for each code block
2. **Inline processor**: `processInlineCode()` method handles inline syntax
3. **Settings**: Parser behavior can be configured through plugin settings
4. **Caching**: Parsed configurations can be cached for performance

## Testing

A comprehensive test suite is included in `parser.test.ts` covering:

- Basic language parsing
- Parameter combinations
- Edge cases and error conditions
- Inline code formats
- Validation and sanitization
- Language alias resolution

Run tests with:
```bash
npm test # (if test script is configured)
# or directly:
node dist/parser.test.js
````

## Performance Considerations

1. **Regex optimization**: Uses efficient regex patterns
2. **Duplicate removal**: Highlight ranges are deduplicated
3. **Input validation**: Early validation prevents processing invalid data
4. **Caching friendly**: Produces consistent output for identical inputs
5. **Memory efficient**: No unnecessary string allocations

## Future Enhancements

Potential future improvements:

1. **Text highlighting**: Support for highlighting specific text patterns
2. **Diff highlighting**: Support for added/removed line indicators
3. **Custom annotations**: Line-specific comments or markers
4. **Advanced folding**: Fold specific line ranges
5. **Export options**: Different output formats for copy/export
