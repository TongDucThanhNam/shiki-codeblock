import {
    type BundledLanguage,
    type BundledTheme,
    createHighlighter,
    type Highlighter,
} from "shiki";

import { getAllTransformers } from "./transformers";
import type { CacheEntry, CodeBlockConfig, ShikiPluginSettings } from "./types";

export class ShikiHighlighterManager {
    private highlighter: Highlighter | null = null;
    private cache = new Map<string, CacheEntry>();
    private settings: ShikiPluginSettings;
    private readonly CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

    constructor(settings: ShikiPluginSettings) {
        this.settings = settings;
    }

    async initialize(): Promise<void> {
        try {
            this.highlighter = await createHighlighter({
                themes: this.settings.themes,
                langs: this.settings.languages,
            });
        } catch (error) {
            console.error("Failed to initialize Shiki highlighter:", error);
            throw error;
        }
    }

    async highlightCode(
        code: string,
        language: string,
        config: CodeBlockConfig,
        theme?: string,
    ): Promise<string> {
        if (!this.highlighter) {
            throw new Error("Highlighter not initialized");
        }

        const actualTheme = theme || config.customTheme || this.getCurrentTheme();
        const cacheKey = this.generateCacheKey(code, language, actualTheme);

        // Check cache first
        if (this.settings.cacheEnabled && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
                return cached.html;
            }
        }

        try {
            // Get transformers based on config and settings
            const transformers = this.settings.enableTransformers
                ? getAllTransformers(config, this.settings)
                : [];

            const html = await this.highlighter.codeToHtml(code, {
                lang: language,
                theme: actualTheme,
                transformers: transformers
            });

            // Cache the result
            if (this.settings.cacheEnabled) {
                this.cache.set(cacheKey, {
                    html,
                    timestamp: Date.now(),
                });
            }

            return html;
        } catch (error) {
            console.warn(`Failed to highlight code for language ${language}:`, error);
            // Fallback to plain text
            return this.highlighter.codeToHtml(code, {
                lang: "text",
                theme: actualTheme,
            });
        }
    }

    async highlightInlineCode(code: string, language: string): Promise<string> {
        if (!this.highlighter) {
            throw new Error("Highlighter not initialized");
        }

        try {
            const html = await this.highlighter.codeToHtml(code, {
                lang: language,
                theme: this.getCurrentTheme(),
                transformers: [],
            });

            // Extract just the code content without the pre wrapper
            const match = html.match(
                /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/,
            );
            return match ? match[1] : code;
        } catch (error) {
            console.warn(
                `Failed to highlight inline code for language ${language}:`,
                error,
            );
            return code;
        }
    }

    getCurrentTheme(): string {
        const isDark = document.body.classList.contains("theme-dark");
        return isDark
            ? this.settings.defaultDarkTheme
            : this.settings.defaultLightTheme;
    }

    updateSettings(settings: ShikiPluginSettings): void {
        this.settings = settings;
    }

    clearCache(): void {
        this.cache.clear();
    }

    private generateCacheKey(
        code: string,
        language: string,
        theme: string,
    ): string {
        const hash = this.simpleHash(code);
        return `${language}-${theme}-${hash}`;
    }

    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    async loadLanguage(language: BundledLanguage | string): Promise<void> {
        if (!this.highlighter) return;

        try {
            await this.highlighter.loadLanguage(language as BundledLanguage);
            if (!this.settings.languages.includes(language)) {
                this.settings.languages.push(language);
            }
        } catch (error) {
            console.warn(`Failed to load language ${language}:`, error);
        }
    }

    async loadTheme(theme: BundledTheme | string): Promise<void> {
        if (!this.highlighter) return;

        try {
            await this.highlighter.loadTheme(theme as BundledTheme);
            if (!this.settings.themes.includes(theme)) {
                this.settings.themes.push(theme);
            }
        } catch (error) {
            console.warn(`Failed to load theme ${theme}:`, error);
        }
    }
}
