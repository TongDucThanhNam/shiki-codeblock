import { type MarkdownPostProcessorContext, Notice, Plugin } from "obsidian";
import { ShikiHighlighterManager } from "./highlighter";
import { CodeBlockParser } from "./parser";
import { DEFAULT_SETTINGS, ShikiSettingTab } from "./settings";
import type { CodeBlockConfig, ShikiPluginSettings } from "./types";

export default class ShikiCustomPlugin extends Plugin {
    settings: ShikiPluginSettings;
    highlighter: ShikiHighlighterManager;
    parser: CodeBlockParser;
    settingsTab: ShikiSettingTab;

    async onload() {
        await this.loadSettings();

        // Apply UI settings on startup
        this.applyUISettings();

        // Initialize components
        this.highlighter = new ShikiHighlighterManager(this.settings);
        this.parser = new CodeBlockParser();

        // Initialize highlighter
        try {
            await this.highlighter.initialize();
            if (this.settings.debugMode) {
                console.log("Shiki highlighter initialized successfully");
            }
        } catch (error) {
            console.error("Failed to initialize Shiki highlighter:", error);
            return;
        }

        // Register processors
        this.registerMarkdownPostProcessor(this.processCodeBlocks.bind(this));

        if (this.settings.enableInlineHighlight) {
            this.registerMarkdownPostProcessor(this.processInlineCode.bind(this));
        }

        // Add settings tab
        this.settingsTab = new ShikiSettingTab(this.app, this);
        this.addSettingTab(this.settingsTab);

        // Register theme change event
        this.registerEvent(
            this.app.workspace.on("css-change", () => {
                if (this.settings.autoThemeSwitch) {
                    this.refreshAllCodeBlocks();
                }
            }),
        );

        // Register commands
        this.addCommand({
            id: "refresh-highlighting",
            name: "Refresh Code Highlighting",
            callback: () => this.refreshAllCodeBlocks(),
        });

        this.addCommand({
            id: "clear-cache",
            name: "Clear Highlighting Cache",
            callback: () => {
                this.highlighter.clearCache();
                new Notice("Highlighting cache cleared");
            },
        });

        this.addCommand({
            id: "toggle-line-numbers",
            name: "Toggle Line Numbers",
            callback: async () => {
                this.settings.enableLineNumbers = !this.settings.enableLineNumbers;
                await this.saveSettings();
                new Notice(`Line numbers ${this.settings.enableLineNumbers ? 'enabled' : 'disabled'}`);
            },
        });

        this.addCommand({
            id: "export-settings",
            name: "Export Shiki Settings",
            callback: () => {
                this.settingsTab.exportSettings();
            },
        });
    }

    async processCodeBlocks(
        element: HTMLElement,
        _ctx: MarkdownPostProcessorContext,
    ) {
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

    async processInlineCode(element: HTMLElement) {
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
    ) {
        const code = codeElement.textContent || "";
        const langClass = codeElement.className.match(/language-(\S+)/);
        const langString = langClass ? langClass[1] : "";

        // Parse configuration
        let config = this.parser.parseCodeBlockConfig(langString);

        // Validate and sanitize configuration
        if (!this.parser.validateConfig(config)) {
            if (this.settings.debugMode) {
                console.warn('Invalid code block configuration, sanitizing:', config);
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
                config.customTheme
            );

            // Parse the HTML to extract and modify
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = highlightedHtml;

            const shikiPre = tempDiv.querySelector("pre");
            const shikiCode = tempDiv.querySelector("code");

            if (!shikiPre || !shikiCode) return;

            // Apply transformations
            this.applyCodeBlockTransformations(shikiPre, config);

            // Replace original content
            preElement.innerHTML = shikiPre.innerHTML;
            preElement.className = shikiPre.className;

            // Store original data for refresh
            preElement.setAttribute("data-original-code", code);
            preElement.setAttribute("data-language", config.language);
            preElement.setAttribute("data-config", langString);
        } catch (error) {
            console.error("Error highlighting code block:", error);
        }
    }

    private applyCodeBlockTransformations(
        preElement: HTMLElement,
        config: CodeBlockConfig,
    ) {
        // Add line numbers
        if (config.showLineNumbers || this.settings.enableLineNumbers) {
            this.addLineNumbers(preElement, config.startLineNumber);
        }

        // Add line highlighting
        if (config.highlightLines.length > 0) {
            this.addLineHighlighting(preElement, config.highlightLines);
        }

        // Add title
        if (config.title) {
            this.addTitle(preElement, config.title);
        }

        // Add language label
        if (this.settings.enableLanguageLabel && config.language !== 'text') {
            this.addLanguageLabel(preElement, config.language);
        }

        // Add copy button
        if (this.settings.enableCodeCopy) {
            this.addCopyButton(preElement);
        }

        // Add folding capability
        if (config.fold || config.unfold || this.settings.enableFolding) {
            this.addFoldingCapability(preElement, config.fold);
        }
    }

    private addLineNumbers(preElement: HTMLElement, startNumber: number = 1) {
        preElement.addClass("shiki-line-numbers");
        const lines = preElement.querySelectorAll(".line");

        lines.forEach((line, index) => {
            const lineNumber = document.createElement("span");
            lineNumber.className = "line-number";
            lineNumber.textContent = (startNumber + index).toString();
            line.prepend(lineNumber);
        });
    }

    private addLineHighlighting(
        preElement: HTMLElement,
        highlightLines: number[],
    ) {
        const lines = preElement.querySelectorAll(".line");

        lines.forEach((line, index) => {
            if (highlightLines.includes(index + 1)) {
                line.addClass("highlighted-line");
            }
        });
    }

    private addTitle(preElement: HTMLElement, title: string) {
        const titleElement = document.createElement("div");
        titleElement.className = "shiki-title";
        titleElement.textContent = title;

        preElement.addClass("shiki-with-title");
        preElement.prepend(titleElement);
    }

    private addFoldingCapability(
        preElement: HTMLElement,
        folded: boolean = false,
    ) {
        preElement.addClass("shiki-foldable");

        if (folded) {
            preElement.addClass("shiki-folded");
        }

        // Add click handler for folding
        const titleElement = preElement.querySelector(".shiki-title");
        if (titleElement) {
            titleElement.addEventListener("click", () => {
                const isFolded = preElement.hasClass("shiki-folded");
                preElement.toggleClass("shiki-folded", !isFolded);
            });
            (titleElement as HTMLElement).style.cursor = "pointer";
        }
    }

    private addLanguageLabel(preElement: HTMLElement, language: string) {
        const header = this.getOrCreateHeader(preElement);

        const languageLabel = document.createElement("span");
        languageLabel.className = "shiki-language-label";
        languageLabel.textContent = language.toUpperCase();

        header.appendChild(languageLabel);
    }

    private addCopyButton(preElement: HTMLElement) {
        const header = this.getOrCreateHeader(preElement);

        const copyButton = document.createElement("button");
        copyButton.className = "shiki-copy-button";
        copyButton.textContent = "Copy";
        copyButton.title = "Copy code to clipboard";

        copyButton.addEventListener("click", async () => {
            const codeContent = this.getCodeContent(preElement);
            try {
                await navigator.clipboard.writeText(codeContent);
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 2000);
            } catch (error) {
                console.error("Failed to copy code:", error);
                copyButton.textContent = "Failed";
                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 2000);
            }
        });

        header.appendChild(copyButton);
    }

    private getOrCreateHeader(preElement: HTMLElement): HTMLElement {
        let header = preElement.querySelector(".shiki-header") as HTMLElement;

        if (!header) {
            header = document.createElement("div");
            header.className = "shiki-header";
            preElement.prepend(header);
            preElement.addClass("shiki-with-header");
        }

        return header;
    }

    private getCodeContent(preElement: HTMLElement): string {
        // Get original code from data attribute first
        const originalCode = preElement.getAttribute("data-original-code");
        if (originalCode) {
            return originalCode;
        }

        // Fallback to extracting from DOM
        const lines = preElement.querySelectorAll(".line");
        return Array.from(lines)
            .map(line => line.textContent || "")
            .join("\n");
    }

    private refreshAllCodeBlocks() {
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

    async loadSettings() {
        const loadedData = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);

        // Validate and migrate settings if needed
        this.validateAndMigrateSettings();

        if (this.settings.debugMode) {
            console.log('[Shiki Debug] Settings loaded:', this.settings);
        }
    }

    private validateAndMigrateSettings(): void {
        let settingsChanged = false;

        // Ensure arrays exist and have valid values
        if (!Array.isArray(this.settings.languages) || this.settings.languages.length === 0) {
            this.settings.languages = DEFAULT_SETTINGS.languages;
            settingsChanged = true;
        }

        if (!Array.isArray(this.settings.themes) || this.settings.themes.length === 0) {
            this.settings.themes = DEFAULT_SETTINGS.themes;
            settingsChanged = true;
        }

        // Validate numeric values
        if (typeof this.settings.maxCacheSize !== 'number' || this.settings.maxCacheSize < 1) {
            this.settings.maxCacheSize = DEFAULT_SETTINGS.maxCacheSize;
            settingsChanged = true;
        }

        if (typeof this.settings.cacheExpirationDays !== 'number' || this.settings.cacheExpirationDays < 1) {
            this.settings.cacheExpirationDays = DEFAULT_SETTINGS.cacheExpirationDays;
            settingsChanged = true;
        }

        // Validate string values
        if (!this.settings.fontSize || typeof this.settings.fontSize !== 'string') {
            this.settings.fontSize = DEFAULT_SETTINGS.fontSize;
            settingsChanged = true;
        }

        if (!this.settings.fontFamily || typeof this.settings.fontFamily !== 'string') {
            this.settings.fontFamily = DEFAULT_SETTINGS.fontFamily;
            settingsChanged = true;
        }

        // Ensure theme values are valid
        const validThemes = [...DEFAULT_SETTINGS.themes, 'dracula', 'monokai', 'one-dark-pro', 'solarized-light', 'material-theme-darker', 'material-theme-lighter'];

        if (!validThemes.includes(this.settings.defaultTheme)) {
            this.settings.defaultTheme = DEFAULT_SETTINGS.defaultTheme;
            settingsChanged = true;
        }

        if (!validThemes.includes(this.settings.defaultDarkTheme)) {
            this.settings.defaultDarkTheme = DEFAULT_SETTINGS.defaultDarkTheme;
            settingsChanged = true;
        }

        if (!validThemes.includes(this.settings.defaultLightTheme)) {
            this.settings.defaultLightTheme = DEFAULT_SETTINGS.defaultLightTheme;
            settingsChanged = true;
        }

        // Add any new settings that might not exist in older versions by merging with defaults
        const mergedSettings = { ...DEFAULT_SETTINGS, ...this.settings };
        if (JSON.stringify(mergedSettings) !== JSON.stringify(this.settings)) {
            this.settings = mergedSettings;
            settingsChanged = true;
        }

        // Save settings if they were changed during validation
        if (settingsChanged) {
            this.saveSettings();
            if (this.settings.debugMode) {
                console.log('[Shiki Debug] Settings validated and migrated');
            }
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);

        // Update highlighter settings
        this.highlighter?.updateSettings(this.settings);

        // Apply UI settings
        this.applyUISettings();

        // Re-register inline processor if setting changed
        if (this.settings.enableInlineHighlight) {
            this.registerMarkdownPostProcessor(this.processInlineCode.bind(this));
        }

        // Refresh all code blocks to apply new settings
        this.refreshAllCodeBlocks();
    }

    private applyUISettings(): void {
        // Apply custom CSS
        const styleId = 'shiki-custom-styles';
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        const customCSS = `
            .shiki {
                font-size: ${this.settings.fontSize} !important;
                font-family: ${this.settings.fontFamily} !important;
                line-height: ${this.settings.lineHeight} !important;
                border-radius: ${this.settings.borderRadius} !important;
                padding: ${this.settings.padding} !important;
                ${!this.settings.showBackground ? 'background: transparent !important;' : ''}
                ${this.settings.enableWordWrap ? 'white-space: pre-wrap !important; word-wrap: break-word !important;' : ''}
                position: relative;
            }
            
            .shiki code {
                font-size: inherit !important;
                font-family: inherit !important;
            }
            
            /* Header styles */
            .shiki-with-header {
                position: relative;
            }
            
            .shiki-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: ${this.settings.borderRadius} ${this.settings.borderRadius} 0 0;
                font-size: 12px;
                font-weight: 500;
            }
            
            .shiki-language-label {
                color: var(--text-muted);
                font-family: var(--font-ui);
            }
            
            .shiki-copy-button {
                background: transparent;
                border: 1px solid var(--background-modifier-border);
                color: var(--text-muted);
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
            }
            
            .shiki-copy-button:hover {
                background: var(--background-modifier-hover);
                color: var(--text-normal);
            }
            
            /* Title styles */
            .shiki-title {
                background: var(--background-secondary);
                padding: 8px 12px;
                font-weight: 600;
                border-bottom: 1px solid var(--background-modifier-border);
                margin-bottom: 0;
            }
            
            .shiki-with-title .shiki-title {
                border-radius: ${this.settings.borderRadius} ${this.settings.borderRadius} 0 0;
            }
            
            /* Line number styles */
            .shiki-line-numbers .line {
                position: relative;
                padding-left: 3em;
            }
            
            .line-number {
                position: absolute;
                left: 0;
                width: 2.5em;
                text-align: right;
                color: var(--text-muted);
                user-select: none;
                font-variant-numeric: tabular-nums;
            }
            
            /* Highlighted lines */
            .highlighted-line {
                background: rgba(255, 255, 0, 0.1);
                position: relative;
            }
            
            .highlighted-line::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 3px;
                background: var(--text-accent);
            }
            
            /* Folding styles */
            .shiki-foldable .shiki-title::after {
                content: '▼';
                margin-left: auto;
                transition: transform 0.2s ease;
            }
            
            .shiki-folded .shiki-title::after {
                transform: rotate(-90deg);
            }
            
            .shiki-folded pre {
                display: none;
            }
            
            /* Custom scrollbar for code blocks */
            .shiki pre {
                scrollbar-width: thin;
                scrollbar-color: var(--scrollbar-thumb-bg) var(--scrollbar-bg);
            }
            
            .shiki pre::-webkit-scrollbar {
                height: 8px;
                width: 8px;
            }
            
            .shiki pre::-webkit-scrollbar-track {
                background: var(--scrollbar-bg);
            }
            
            .shiki pre::-webkit-scrollbar-thumb {
                background: var(--scrollbar-thumb-bg);
                border-radius: 4px;
            }
            
            .shiki pre::-webkit-scrollbar-thumb:hover {
                background: var(--scrollbar-thumb-hover);
            }
            
            ${this.settings.customCSS}
        `;

        styleEl.textContent = customCSS;

        if (this.settings.debugMode) {
            console.log('[Shiki Debug] Applied UI settings:', this.settings);
        }
    }

    clearCache() {
        this.highlighter?.clearCache();
    }

    onunload() {
        this.clearCache();

        // Remove custom styles
        const styleEl = document.getElementById('shiki-custom-styles');
        if (styleEl) {
            styleEl.remove();
        }
    }
}
