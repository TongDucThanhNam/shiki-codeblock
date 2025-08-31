import type { CodeBlockConfig } from "./types";

export class CustomTransformers {
    static createLineHighlightTransformer(config: CodeBlockConfig) {
        return {
            name: "line-highlight",
            line(node: any, lineNumber: number) {
                if (config.highlightLines.includes(lineNumber)) {
                    node.properties = node.properties || {};
                    node.properties.class =
                        (node.properties.class || "") + " highlighted-line";
                }
            },
        };
    }

    static createLineNumberTransformer(config: CodeBlockConfig) {
        return {
            name: "line-numbers",
            pre(node: any) {
                if (config.showLineNumbers) {
                    node.properties = node.properties || {};
                    node.properties.class =
                        (node.properties.class || "") + " shiki-line-numbers";
                }
            },
            line(node: any, lineNumber: number) {
                if (config.showLineNumbers) {
                    const actualLineNumber = lineNumber + config.startLineNumber - 1;
                    node.children.unshift({
                        type: "element",
                        tagName: "span",
                        properties: {
                            class: "line-number",
                            "data-line": actualLineNumber.toString(),
                        },
                        children: [
                            {
                                type: "text",
                                value: actualLineNumber.toString().padStart(3, " "),
                            },
                        ],
                    });
                }
            },
        };
    }

    static createTitleTransformer(config: CodeBlockConfig) {
        return {
            name: "title",
            pre(node: any) {
                if (config.title) {
                    node.properties = node.properties || {};
                    node.properties["data-title"] = config.title;
                    node.properties.class =
                        (node.properties.class || "") + " shiki-with-title";
                }
            },
        };
    }

    static createFoldingTransformer(config: CodeBlockConfig) {
        return {
            name: "folding",
            pre(node: any) {
                if (config.fold || config.unfold) {
                    node.properties = node.properties || {};
                    node.properties.class =
                        (node.properties.class || "") + " shiki-foldable";

                    if (config.fold) {
                        node.properties.class += " shiki-folded";
                    }
                }
            },
        };
    }
}
