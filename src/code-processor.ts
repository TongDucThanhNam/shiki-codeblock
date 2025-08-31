import type { MarkdownPostProcessorContext } from "obsidian";
import type { ShikiHighlighterManager } from "./highlighter";
import type { CodeBlockParser } from "./parser";
import type { TransformersManager } from "./transformers-manager";
import type { ShikiPluginSettings } from "./types";

export class CodeProcessor {
    private settings: ShikiPluginSettings;
    private highlighter: ShikiHighlighterManager;
    private parser: CodeBlockParser;
    private transformersManager: TransformersManager;

    constructor(
        settings: ShikiPluginSettings,
        highlighter: ShikiHighlighterManager,
        parser: CodeBlockParser,
        transformersManager: TransformersManager,
    ) {
        this.settings = settings;
        this.highlighter = highlighter;
        this.parser = parser;
        this.transformersManager = transformersManager;
    }

    updateSettings(settings: ShikiPluginSettings): void {
        this.settings = settings;
        this.transformersManager.updateSettings(settings);
    }

    async processCodeBlocks(
        element: HTMLElement,
        _ctx: MarkdownPostProcessorContext,
    ): Promise<void> {
        const codeBlocks = element.querySelectorAll("pre > code");

        for (let i = 0; i < codeBlocks.length; i++) {
            const codeElement = codeBlocks[i];
            const preElement = codeElement.parentElement;
            if (!preElement) continue;

            // Skip if already processed
            if (preElement.hasClass("shiki-processed")) continue;

            try {
                await this.highlightCodeBlock(codeElement as HTMLElement, preElement);
                preElement.addClass("shiki-processed");
            } catch (error) {
                console.error("Error processing code block:", error);
            }
        }
    }

    async processInlineCode(element: HTMLElement): Promise<void> {
        const inlineCodes = element.querySelectorAll("code:not(pre > code)");

        for (let i = 0; i < inlineCodes.length; i++) {
            const codeElement = inlineCodes[i];
            if (codeElement.hasClass("shiki-inline-processed")) continue;

            const text = codeElement.textContent || "";
            const parsed = this.parser.parseInlineCode(text);

            if (parsed) {
                try {
                    const highlighted = await this.highlighter.highlightInlineCode(
                        parsed.code,
                        parsed.lang,
                    );
                    codeElement.innerHTML = highlighted;
                    codeElement.addClass("shiki-inline-processed");
                } catch (error) {
                    console.error("Error processing inline code:", error);
                }
            }
        }
    }

    private async highlightCodeBlock(
        codeElement: HTMLElement,
        preElement: HTMLElement,
    ): Promise<void> {
        const code = codeElement.textContent || "";
        const langClass = codeElement.className.match(/language-(\S+)/);
        const langString = langClass ? langClass[1] : "";

        // Parse configuration
        let config = this.parser.parseCodeBlockConfig(langString);

        // Validate and sanitize configuration
        if (!this.parser.validateConfig(config)) {
            if (this.settings.debugMode) {
                console.warn("Invalid code block configuration, sanitizing:", config);
            }
            config = this.parser.sanitizeConfig(config);
        }

        // Skip if excluded
        if (config.exclude) return;

        try {
            // Get highlighted HTML
            const highlightedHtml = await this.highlighter.highlightCode(
                code,
                config.language,
                config,
                config.customTheme,
            );

            // Parse the HTML to extract and modify
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = highlightedHtml;

            const shikiPre = tempDiv.querySelector("pre");
            const shikiCode = tempDiv.querySelector("code");

            if (!shikiPre || !shikiCode) return;

            // Store original data BEFORE transformations (for copy functionality)
            preElement.setAttribute("data-original-code", code);
            preElement.setAttribute("data-language", config.language);
            preElement.setAttribute("data-config", langString);

            // Copy data attributes to shikiPre for transformations
            shikiPre.setAttribute("data-original-code", code);
            shikiPre.setAttribute("data-language", config.language);
            shikiPre.setAttribute("data-config", langString);

            // Replace original content FIRST
            preElement.innerHTML = shikiPre.innerHTML;
            preElement.className = shikiPre.className;

            // Apply transformations to the REAL preElement (not the temporary one)
            this.transformersManager.applyCodeBlockTransformations(preElement, config);
        } catch (error) {
            console.error("Error highlighting code block:", error);
        }
    }

    refreshAllCodeBlocks(): void {
        // Find all processed code blocks and re-highlight them
        const processedBlocks = document.querySelectorAll("pre.shiki-processed");

        processedBlocks.forEach(async (preElement) => {
            const originalCode = preElement.getAttribute("data-original-code");
            const language = preElement.getAttribute("data-language");
            const configString = preElement.getAttribute("data-config");

            if (originalCode && language) {
                preElement.removeClass("shiki-processed");

                const codeElement = preElement.querySelector("code");
                if (codeElement) {
                    codeElement.textContent = originalCode;
                    codeElement.className = `language-${configString || language}`;

                    await this.highlightCodeBlock(codeElement, preElement as HTMLElement);
                }
            }
        });
    }
}
