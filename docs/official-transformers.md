# Using Official Shiki Transformers

This plugin currently uses custom transformers for compatibility with the existing codebase. However, you can leverage the official `@shikijs/transformers` package by using comment-based syntax directly in your code blocks.

## Available Official Transformers

### Highlighting

Use `[!code highlight]` to highlight specific lines:

```typescript
// This is normal code
console.log("This line is normal");
console.log("This line will be highlighted"); // [!code highlight]
console.log("This line is normal");
```

Multi-line highlighting:

```typescript
// [!code highlight:3]
console.log("Line 1 - highlighted");
console.log("Line 2 - highlighted");
console.log("Line 3 - highlighted");
console.log("Line 4 - normal");
```

### Diff Highlighting

Use `[!code ++]` and `[!code --]` for diff-style highlighting:

```typescript
console.log("This line will be removed"); // [!code --]
console.log("This line will be added"); // [!code ++]
console.log("This line stays the same");
```

### Focus

Use `[!code focus]` to focus on specific lines:

```typescript
console.log("Unfocused line");
console.log("This line is focused"); // [!code focus]
console.log("Unfocused line");
```

### Error and Warning Levels

Use `[!code error]` and `[!code warning]`:

```typescript
console.log("Normal line");
console.error("This has an error"); // [!code error]
console.warn("This has a warning"); // [!code warning]
```

### Word Highlighting

Use `[!code word:WORD]` to highlight specific words:

```typescript
// [!code word:Hello]
const message = "Hello World";
console.log(message); // prints Hello World
```

## Meta-based Highlighting

You can also use meta strings in the code block declaration:

```js {1,3-4}
console.log("Line 1 - highlighted");
console.log("Line 2 - normal");
console.log("Line 3 - highlighted");
console.log("Line 4 - highlighted");
```

```js /Hello/
const msg = "Hello World";
console.log(msg); // 'Hello' will be highlighted
```

## Future Integration

To fully integrate the official transformers, you would need to:

1. Update the package dependencies to ensure version compatibility
2. Modify the highlighter to include the official transformers
3. Update the parser to handle the comment-based syntax
4. Add UI controls for enabling/disabling specific transformers

Example integration code:

```typescript
import {
	transformerNotationDiff,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
	transformerNotationFocus,
	transformerNotationErrorLevel,
	transformerMetaHighlight,
	transformerMetaWordHighlight,
} from "@shikijs/transformers";

// In your highlighter configuration:
const html = await codeToHtml(code, {
	lang: "typescript",
	theme: "nord",
	transformers: [
		transformerNotationHighlight(),
		transformerNotationDiff(),
		transformerNotationFocus(),
		transformerNotationErrorLevel(),
		transformerNotationWordHighlight(),
		transformerMetaHighlight(),
		transformerMetaWordHighlight(),
		// ... your custom transformers
	],
});
```

## CSS Classes

The official transformers add these CSS classes:

-   `.line.highlighted` - for highlighted lines
-   `.line.diff.add` - for added lines
-   `.line.diff.remove` - for removed lines
-   `.line.focused` - for focused lines
-   `.line.highlighted.error` - for error lines
-   `.line.highlighted.warning` - for warning lines
-   `.highlighted-word` - for highlighted words
-   `.has-highlighted` - added to `<pre>` tag when highlights are present
-   `.has-diff` - added to `<pre>` tag when diffs are present
-   `.has-focused` - added to `<pre>` tag when focus is present

Make sure to style these classes in your CSS for the effects to be visible.
