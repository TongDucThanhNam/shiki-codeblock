import {
    type BundledLanguage,
    type BundledTheme,
    bundledLanguages,
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
    private loadedLanguages = new Set<string>();

    constructor(settings: ShikiPluginSettings) {
        this.settings = settings;
    }

    async initialize(): Promise<void> {
        try {
            // Initialize with only core languages to start faster
            const coreLanguages = [
                "javascript", "typescript", "python", "html", "css",
                "json", "yaml", "markdown", "bash", "shell", "text"
            ];

            this.highlighter = await createHighlighter({
                themes: this.settings.themes,
                langs: coreLanguages,
            });

            // Track loaded languages
            coreLanguages.forEach(lang => this.loadedLanguages.add(lang));
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
            // Auto-load language if not already loaded
            if (!this.loadedLanguages.has(language)) {
                await this.ensureLanguageLoaded(language);
            }

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
            // If the error is about theme not found, try to load it
            if (error?.message?.includes('Theme') && error.message.includes('not found')) {
                try {
                    console.log(`Attempting to load theme: ${actualTheme}`);
                    await this.loadTheme(actualTheme);

                    // Retry the highlighting after loading the theme
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
                } catch (loadError) {
                    console.warn(`Failed to load theme ${actualTheme}:`, loadError);
                }
            }

            // If language loading failed, fall back to text
            if (error?.message?.includes('Language') || error?.message?.includes(language)) {
                console.warn(`Failed to highlight code for language ${language}:`, error);
                return this.highlighter.codeToHtml(code, {
                    lang: "text",
                    theme: actualTheme,
                });
            }

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
            this.loadedLanguages.add(language);
            if (!this.settings.languages.includes(language)) {
                this.settings.languages.push(language);
            }
        } catch (error) {
            console.warn(`Failed to load language ${language}:`, error);
        }
    }

    async ensureLanguageLoaded(language: string): Promise<void> {
        if (this.loadedLanguages.has(language)) {
            return; // Already loaded
        }

        // Check if it's a known bundled language
        const allBundledLanguages = Object.keys(bundledLanguages);
        if (allBundledLanguages.includes(language)) {
            console.log(`Auto-loading language: ${language}`);
            await this.loadLanguage(language);
        } else {
            // Handle common aliases
            const aliases: Record<string, string> = {
                'js': 'javascript',
                'ts': 'typescript',
                'py': 'python',
                'sh': 'bash',
                'yml': 'yaml',
                'md': 'markdown'
            };

            const resolvedLanguage = aliases[language];
            if (resolvedLanguage && allBundledLanguages.includes(resolvedLanguage)) {
                console.log(`Auto-loading aliased language: ${language} -> ${resolvedLanguage}`);
                await this.loadLanguage(resolvedLanguage);
                // Also mark the alias as loaded
                this.loadedLanguages.add(language);
            } else {
                console.warn(`Language ${language} is not available in bundled languages. Available: ${allBundledLanguages.slice(0, 10).join(', ')}...`);
            }
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
