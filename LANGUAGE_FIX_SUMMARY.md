# Dynamic Language Loading - Fix Summary

## Problem

The Shiki plugin was only loading a small subset of languages defined in settings, causing many supported languages (like JSON, Go, Rust, PHP, etc.) to display without syntax highlighting.

## Root Cause

The highlighter was initialized with only `this.settings.languages` which had a limited list:

```typescript
// OLD - Only these languages worked
languages: ["javascript", "typescript", "python", "cpp", "java", "html", "css"];
```

This meant that even though Shiki supports 200+ languages, users could only get syntax highlighting for the 7 languages in the default list.

## Solution Implemented

### 1. Dynamic Language Loading

-   Modified `ShikiHighlighterManager` to load languages on-demand
-   Added `bundledLanguages` import to check available languages
-   Added `loadedLanguages` Set to track what's already loaded
-   Added `ensureLanguageLoaded()` method to auto-load languages

### 2. Enhanced Language Support

-   Expanded default languages to include JSON, YAML, Markdown, Shell
-   Added automatic language alias resolution (js→javascript, py→python, etc.)
-   Added graceful fallback to 'text' when language isn't available

### 3. Improved User Experience

-   Updated settings UI to clarify that all languages are supported
-   Added helpful info box explaining automatic language loading
-   Languages are now loaded the first time they're used

### 4. Key Changes Made

**src/highlighter.ts:**

-   Added `loadedLanguages` Set tracking
-   Modified `initialize()` to load core languages only
-   Enhanced `highlightCode()` with automatic language loading
-   Added `ensureLanguageLoaded()` method with alias support

**src/settings.ts:**

-   Expanded default languages list to include JSON
-   Updated UI labels and descriptions
-   Added informational message about 200+ supported languages

## Benefits

✅ **JSON now works out of the box**  
✅ **All 200+ Shiki languages are supported**  
✅ **Faster startup** (loads core languages only)  
✅ **Better performance** (languages loaded on-demand)  
✅ **Better UX** (clear documentation in settings)

## Testing

The fix has been tested with:

-   JSON syntax highlighting ✅
-   Go, Rust, PHP, YAML, TOML auto-loading ✅
-   Language aliases (js, py, yml) ✅
-   Fallback to text for unknown languages ✅

Users can now use any language that Shiki supports without manual configuration!
