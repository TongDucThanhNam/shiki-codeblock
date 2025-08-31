import { DEFAULT_SETTINGS } from "./settings";
import type { ShikiPluginSettings } from "./types";

export class SettingsManager {
    validateAndMigrateSettings(settings: ShikiPluginSettings): {
        settings: ShikiPluginSettings;
        changed: boolean;
    } {
        let settingsChanged = false;
        const newSettings = { ...settings };

        // Ensure arrays exist and have valid values
        if (
            !Array.isArray(newSettings.languages) ||
            newSettings.languages.length === 0
        ) {
            newSettings.languages = DEFAULT_SETTINGS.languages;
            settingsChanged = true;
        }

        if (!Array.isArray(newSettings.themes) || newSettings.themes.length === 0) {
            newSettings.themes = DEFAULT_SETTINGS.themes;
            settingsChanged = true;
        }

        // Validate numeric values
        if (
            typeof newSettings.maxCacheSize !== "number" ||
            newSettings.maxCacheSize < 1
        ) {
            newSettings.maxCacheSize = DEFAULT_SETTINGS.maxCacheSize;
            settingsChanged = true;
        }

        if (
            typeof newSettings.cacheExpirationDays !== "number" ||
            newSettings.cacheExpirationDays < 1
        ) {
            newSettings.cacheExpirationDays = DEFAULT_SETTINGS.cacheExpirationDays;
            settingsChanged = true;
        }

        // Validate string values
        if (!newSettings.fontSize || typeof newSettings.fontSize !== "string") {
            newSettings.fontSize = DEFAULT_SETTINGS.fontSize;
            settingsChanged = true;
        }

        if (!newSettings.fontFamily || typeof newSettings.fontFamily !== "string") {
            newSettings.fontFamily = DEFAULT_SETTINGS.fontFamily;
            settingsChanged = true;
        }

        // Ensure theme values are valid
        const validThemes = [
            ...DEFAULT_SETTINGS.themes,
            "dracula",
            "monokai",
            "one-dark-pro",
            "one-light",
            "solarized-light",
            "material-theme-darker",
            "material-theme-lighter",
        ];

        if (!validThemes.includes(newSettings.defaultTheme)) {
            newSettings.defaultTheme = DEFAULT_SETTINGS.defaultTheme;
            settingsChanged = true;
        }

        if (!validThemes.includes(newSettings.defaultDarkTheme)) {
            newSettings.defaultDarkTheme = DEFAULT_SETTINGS.defaultDarkTheme;
            settingsChanged = true;
        }

        if (!validThemes.includes(newSettings.defaultLightTheme)) {
            newSettings.defaultLightTheme = DEFAULT_SETTINGS.defaultLightTheme;
            settingsChanged = true;
        }

        // Add any new settings that might not exist in older versions by merging with defaults
        const mergedSettings = { ...DEFAULT_SETTINGS, ...newSettings };
        if (JSON.stringify(mergedSettings) !== JSON.stringify(newSettings)) {
            Object.assign(newSettings, mergedSettings);
            settingsChanged = true;
        }

        return { settings: newSettings, changed: settingsChanged };
    }

    mergeWithDefaults(
        loadedData: Partial<ShikiPluginSettings>,
    ): ShikiPluginSettings {
        return Object.assign({}, DEFAULT_SETTINGS, loadedData);
    }
}
