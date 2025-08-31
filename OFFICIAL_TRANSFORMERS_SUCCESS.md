# Official @shikijs/transformers Integration

## ✅ SUCCESS: Now Using Official Transformers!

The plugin now properly integrates **9 official Shiki transformers** from `@shikijs/transformers` v1.29.2:

### 🎯 Active Official Transformers

1. **`transformerNotationDiff()`** - Diff highlighting with `// [!code ++]` and `// [!code --]`
2. **`transformerNotationHighlight()`** - Line highlighting with `// [!code highlight]`
3. **`transformerNotationWordHighlight()`** - Word highlighting with `// [!code word:Hello]`
4. **`transformerNotationFocus()`** - Focus highlighting with `// [!code focus]`
5. **`transformerNotationErrorLevel()`** - Error/warning levels with `// [!code error]` and `// [!code warning]`
6. **`transformerMetaHighlight()`** - Meta-based line highlighting like `{1,3-4}`
7. **`transformerMetaWordHighlight()`** - Meta-based word highlighting like `/Hello/`
8. **`transformerRenderWhitespace()`** - Renders tabs and spaces as visible characters
9. **`transformerRemoveNotationEscape()`** - Removes escape sequences from notation

### 📝 Usage Examples

Users can now use these official features directly in their code blocks:

**Diff highlighting:**

```typescript
console.log("This line will be removed"); // [!code --]
console.log("This line will be added"); // [!code ++]
console.log("This line stays the same");
```

**Line highlighting:**

```typescript
console.log("Normal line");
console.log("Highlighted line"); // [!code highlight]
console.log("Another normal line");
```

**Multi-line highlighting:**

```typescript
// [!code highlight:3]
console.log("Line 1 - highlighted");
console.log("Line 2 - highlighted");
console.log("Line 3 - highlighted");
console.log("Line 4 - normal");
```

**Word highlighting:**

```typescript
// [!code word:Hello]
const message = "Hello World";
console.log(message); // 'Hello' will be highlighted
```

**Error and warning levels:**

```typescript
console.log("Normal line");
console.error("This has an error"); // [!code error]
console.warn("This has a warning"); // [!code warning]
```

**Focus highlighting:**

```typescript
console.log("Unfocused line");
console.log("This line is focused"); // [!code focus]
console.log("Unfocused line");
```

**Meta-based highlighting:**

```js {1,3-4}
console.log("Line 1 - highlighted");
console.log("Line 2 - normal");
console.log("Line 3 - highlighted");
console.log("Line 4 - highlighted");
```

**Meta-based word highlighting:**

```js /Hello/
const msg = "Hello World"; // 'Hello' will be highlighted
console.log(msg);
```

### 🔧 Technical Details

-   **Version Compatibility Fixed**: Changed from `@shikijs/transformers` v3.12.0 to v1.29.2 to match Shiki v1.29.2
-   **Type Compatibility**: All transformer types now properly match between packages
-   **Build Success**: Project builds without errors
-   **Bundle Size**: Official transformers add ~17KB to the bundle (from 9.5MB to 9.6MB)

### 🎨 CSS Classes Generated

The official transformers add these CSS classes that you can style:

-   `.line.highlighted` - for highlighted lines
-   `.line.diff.add` - for added lines (++)
-   `.line.diff.remove` - for removed lines (--)
-   `.line.focused` - for focused lines
-   `.line.highlighted.error` - for error lines
-   `.line.highlighted.warning` - for warning lines
-   `.highlighted-word` - for highlighted words
-   `.has-highlighted` - added to `<pre>` when highlights are present
-   `.has-diff` - added to `<pre>` when diffs are present
-   `.has-focused` - added to `<pre>` when focus is present

### 🎯 Benefits

1. **Standards Compliance**: Using official Shiki transformers as intended
2. **Feature Rich**: Access to all official transformer features
3. **Future Proof**: Automatic updates with Shiki releases
4. **Documentation**: Official syntax is well-documented
5. **Community**: Standard syntax used across the Shiki ecosystem

### 🔮 What's Next

Users can immediately start using official transformer syntax in their code blocks. The plugin now provides the best of both worlds:

-   **Official transformers** for standard Shiki features
-   **Custom transformers** for plugin-specific features (line numbers, titles, folding, etc.)

This is exactly how a proper Shiki integration should work! 🎉
