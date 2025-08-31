export interface ShikiPluginSettings {
    // Theme settings
    defaultTheme: string;
    defaultDarkTheme: string;
    defaultLightTheme: string;
    autoThemeSwitch: boolean;
    customThemePath: string;
    themes: string[];

    // Feature settings
    enableLineNumbers: boolean;
    enableInlineHighlight: boolean;
    enableFolding: boolean;
    enableCodeCopy: boolean;
    enableLanguageLabel: boolean;
    enableWordWrap: boolean;

    // Language settings
    languages: string[];
    autoDetectLanguage: boolean;
    fallbackLanguage: string;

    // Performance settings
    cacheEnabled: boolean;
    maxCacheSize: number;
    cacheExpirationDays: number;
    lazyLoading: boolean;

    // UI settings
    fontSize: string;
    fontFamily: string;
    lineHeight: string;
    borderRadius: string;
    showBackground: boolean;
    padding: string;

    // Advanced settings
    enableTransformers: boolean;
    customCSS: string;
    debugMode: boolean;
}

export interface CodeBlockConfig {
    language: string;
    highlightLines: number[];
    showLineNumbers: boolean;
    startLineNumber: number;
    title?: string;
    fold: boolean;
    unfold: boolean;
    exclude: boolean;
    customTheme?: string;
}

export interface HighlightRange {
    start: number;
    end: number;
    type: "line" | "text";
    text?: string;
}

export interface CacheEntry {
    html: string;
    timestamp: number;
}

export type ThemeMode = "light" | "dark";
