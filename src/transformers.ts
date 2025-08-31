import {
    transformerMetaHighlight,
    transformerMetaWordHighlight,
    transformerNotationDiff,
    transformerNotationErrorLevel,
    transformerNotationFocus,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
    transformerRemoveNotationEscape,
    transformerRenderWhitespace,
} from "@shikijs/transformers";
import type { ShikiTransformer } from "shiki";

import type { CodeBlockConfig, ShikiPluginSettings } from "./types";

// Custom transformer for line highlighting
export const createLineHighlightTransformer = (
    config: CodeBlockConfig,
): ShikiTransformer => {
    return {
        name: "line-highlight",
        line(node, lineNumber) {
            if (config.highlightLines.includes(lineNumber)) {
                this.addClassToHast(node, "highlighted-line");
            }
        },
    };
};

// Custom transformer for line numbers (not available in official transformers)
export const createLineNumberTransformer = (
    config: CodeBlockConfig,
): ShikiTransformer => {
    return {
        name: "line-numbers",
        pre(node) {
            if (config.showLineNumbers) {
                this.addClassToHast(node, "shiki-line-numbers");
            }
        },
        line(node, lineNumber) {
            if (config.showLineNumbers) {
                const actualLineNumber = lineNumber + config.startLineNumber - 1;
                // Add line number as data attribute for CSS to display
                node.properties = node.properties || {};
                node.properties["data-line"] = actualLineNumber.toString();
            }
        },
    };
};

// Custom transformer for title (not available in official transformers)
export const createTitleTransformer = (
    config: CodeBlockConfig,
): ShikiTransformer => {
    return {
        name: "title",
        pre(node) {
            if (config.title) {
                node.properties = node.properties || {};
                node.properties["data-title"] = config.title;
                this.addClassToHast(node, "shiki-with-title");
            }
        },
    };
};

// Custom transformer for folding (not available in official transformers)
export const createFoldingTransformer = (
    config: CodeBlockConfig,
): ShikiTransformer => {
    return {
        name: "folding",
        pre(node) {
            if (config.fold || config.unfold) {
                this.addClassToHast(node, "shiki-foldable");
                if (config.fold) {
                    this.addClassToHast(node, "shiki-folded");
                }
            }
        },
    };
};

// Custom transformer for copy button (not available in official transformers)
export const createCopyButtonTransformer = (): ShikiTransformer => {
    return {
        name: "copy-button",
        pre(node) {
            this.addClassToHast(node, "shiki-with-copy");
            // The copy button will be added via CSS ::before or JavaScript
            node.properties = node.properties || {};
            node.properties["data-copy"] = "true";
        },
    };
};

// Custom transformer for language label (not available in official transformers)
export const createLanguageLabelTransformer = (
    config: CodeBlockConfig,
): ShikiTransformer => {
    return {
        name: "language-label",
        pre(node) {
            if (config.language && config.language !== "text") {
                this.addClassToHast(node, "shiki-with-lang");
                node.properties = node.properties || {};
                node.properties["data-language"] = config.language;
            }
        },
    };
};

// Custom transformer for word wrap
export const createWordWrapTransformer = (): ShikiTransformer => {
    return {
        name: "word-wrap",
        pre(node) {
            this.addClassToHast(node, "shiki-word-wrap");
        },
    };
};

// Custom transformer for exclude (not available in official transformers)
export const createExcludeTransformer = (
    config: CodeBlockConfig,
): ShikiTransformer => {
    return {
        name: "exclude",
        pre(node) {
            if (config.exclude) {
                this.addClassToHast(node, "shiki-excluded");
                node.properties = node.properties || {};
                node.properties.style = "display: none;";
            }
        },
    };
};

// Note: Official Shiki transformers are now properly integrated!
// Users can use comment-based syntax in code blocks:
//
// ```js
// // [!code highlight]
// console.log('This line will be highlighted')
//
// // [!code ++]
// console.log('This line will be marked as added')
//
// // [!code --]
// console.log('This line will be marked as removed')
//
// // [!code focus]
// console.log('This line will be focused')
//
// // [!code error]
// console.log('This line will show an error')
//
// // [!code warning]
// console.log('This line will show a warning')
//
// // [!code word:Hello]
// console.log('Hello World') // 'Hello' will be highlighted
// ```
//
// Meta-based syntax is also supported:
// ```js {1,3-4}
// console.log('Line 1 - highlighted')
// console.log('Line 2 - normal')
// console.log('Line 3 - highlighted')
// console.log('Line 4 - highlighted')
// ```
//
// ```js /Hello/
// const msg = 'Hello World' // 'Hello' will be highlighted
// ```

export const getAllTransformers = (
    config: CodeBlockConfig,
    settings: ShikiPluginSettings,
): ShikiTransformer[] => {
    const transformers: ShikiTransformer[] = [];

    // Official Shiki transformers - these work with comment-based syntax
    transformers.push(
        transformerNotationDiff(), // [!code ++] and [!code --]
        transformerNotationHighlight(
            {
                matchAlgorithm: 'v3',
            }
        ), // [!code highlight]
        transformerNotationWordHighlight(), // [!code word:Hello]
        transformerNotationFocus(), // [!code focus]
        transformerNotationErrorLevel(), // [!code error] and [!code warning]
        transformerMetaHighlight(), // {1,3-4} meta syntax
        transformerMetaWordHighlight(), // /Hello/ meta syntax
        transformerRenderWhitespace(), // Render tabs and spaces
        transformerRemoveNotationEscape(), // Remove escape sequences
    );

    // Custom transformers for plugin-specific features
    if (config.highlightLines.length > 0) {
        transformers.push(createLineHighlightTransformer(config));
    }

    if (config.showLineNumbers || settings.enableLineNumbers) {
        transformers.push(createLineNumberTransformer(config));
    }

    if (config.title) {
        transformers.push(createTitleTransformer(config));
    }

    if (config.fold || config.unfold) {
        transformers.push(createFoldingTransformer(config));
    }

    if (config.exclude) {
        transformers.push(createExcludeTransformer(config));
    }

    // Include setting-based transformers
    if (settings.enableCodeCopy) {
        transformers.push(createCopyButtonTransformer());
    }

    if (settings.enableLanguageLabel) {
        transformers.push(createLanguageLabelTransformer(config));
    }

    if (settings.enableWordWrap) {
        transformers.push(createWordWrapTransformer());
    }

    return transformers;
};
