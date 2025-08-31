import { type App, type Plugin, PluginSettingTab, Setting } from "obsidian";
import type { ShikiPluginSettings } from "./types";

// Define an interface for the plugin methods we need
interface ShikiPlugin extends Plugin {
    settings: ShikiPluginSettings;
    saveSettings(): Promise<void>;
    clearCache(): void;
}

export const DEFAULT_SETTINGS: ShikiPluginSettings = {
    // Theme settings
    defaultTheme: "dark-plus",
    defaultDarkTheme: "dark-plus",
    defaultLightTheme: "light-plus",
    autoThemeSwitch: true,
    customThemePath: "",
    themes: ["dark-plus", "light-plus", "github-dark", "github-light"],

    // Feature settings
    enableLineNumbers: false,
    enableInlineHighlight: true,
    enableFolding: true,
    enableCodeCopy: true,
    enableLanguageLabel: true,
    enableWordWrap: false,

    // Language settings
    languages: [
        "javascript",
        "typescript",
        "python",
        "cpp",
        "java",
        "html",
        "css",
    ],
    autoDetectLanguage: true,
    fallbackLanguage: "text",

    // Performance settings
    cacheEnabled: true,
    maxCacheSize: 100,
    cacheExpirationDays: 7,
    lazyLoading: false,

    // UI settings
    fontSize: "14px",
    fontFamily: "Consolas, 'Courier New', monospace",
    lineHeight: "1.4",
    borderRadius: "4px",
    showBackground: true,
    padding: "16px",

    // Advanced settings
    enableTransformers: true,
    customCSS: "",
    debugMode: false,
};

export class ShikiSettingTab extends PluginSettingTab {
    plugin: ShikiPlugin;

    constructor(app: App, plugin: ShikiPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "Shiki Code Highlighting Settings" });

        // Theme Settings Section
        this.addThemeSettings(containerEl);

        // Feature Settings Section
        this.addFeatureSettings(containerEl);

        // Language Settings Section
        this.addLanguageSettings(containerEl);

        // Performance Settings Section
        this.addPerformanceSettings(containerEl);

        // UI Settings Section
        this.addUISettings(containerEl);

        // Advanced Settings Section
        this.addAdvancedSettings(containerEl);

        // Import/Export Section
        this.addImportExportSettings(containerEl);
    }

    private addThemeSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Theme Settings" });

        new Setting(containerEl)
            .setName("Auto Theme Switch")
            .setDesc(
                "Automatically switch between light and dark themes based on Obsidian's theme",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.autoThemeSwitch)
                    .onChange(async (value) => {
                        this.plugin.settings.autoThemeSwitch = value;
                        await this.plugin.saveSettings();
                        this.display(); // Refresh to show/hide theme options
                    }),
            );

        if (this.plugin.settings.autoThemeSwitch) {
            new Setting(containerEl)
                .setName("Default Dark Theme")
                .setDesc("Theme to use in dark mode")
                .addDropdown((dropdown) => {
                    const darkThemes = {
                        "dark-plus": "Dark Plus",
                        "github-dark": "GitHub Dark",
                        dracula: "Dracula",
                        monokai: "Monokai",
                        "one-dark-pro": "One Dark Pro",
                        "material-theme-darker": "Material Darker",
                    };
                    dropdown.addOptions(darkThemes);
                    dropdown.setValue(this.plugin.settings.defaultDarkTheme);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.defaultDarkTheme = value;
                        await this.plugin.saveSettings();
                    });
                });

            new Setting(containerEl)
                .setName("Default Light Theme")
                .setDesc("Theme to use in light mode")
                .addDropdown((dropdown) => {
                    const lightThemes = {
                        "light-plus": "Light Plus",
                        "github-light": "GitHub Light",
                        "min-light": "Min Light",
                        "solarized-light": "Solarized Light",
                        "material-theme-lighter": "Material Lighter",
                    };
                    dropdown.addOptions(lightThemes);
                    dropdown.setValue(this.plugin.settings.defaultLightTheme);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.defaultLightTheme = value;
                        await this.plugin.saveSettings();
                    });
                });
        } else {
            new Setting(containerEl)
                .setName("Default Theme")
                .setDesc("Single theme to use for all code blocks")
                .addDropdown((dropdown) => {
                    const allThemes = {
                        "dark-plus": "Dark Plus",
                        "light-plus": "Light Plus",
                        "github-dark": "GitHub Dark",
                        "github-light": "GitHub Light",
                        dracula: "Dracula",
                        monokai: "Monokai",
                        "one-dark-pro": "One Dark Pro",
                        "solarized-light": "Solarized Light",
                    };
                    dropdown.addOptions(allThemes);
                    dropdown.setValue(this.plugin.settings.defaultTheme);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.defaultTheme = value;
                        await this.plugin.saveSettings();
                    });
                });
        }

        new Setting(containerEl)
            .setName("Custom Theme Path")
            .setDesc("Path to custom theme JSON file (optional)")
            .addText((text) =>
                text
                    .setPlaceholder("path/to/theme.json")
                    .setValue(this.plugin.settings.customThemePath)
                    .onChange(async (value) => {
                        this.plugin.settings.customThemePath = value;
                        await this.plugin.saveSettings();
                    }),
            );
    }

    private addFeatureSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Feature Settings" });

        new Setting(containerEl)
            .setName("Enable Line Numbers")
            .setDesc("Show line numbers by default for all code blocks")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableLineNumbers)
                    .onChange(async (value) => {
                        this.plugin.settings.enableLineNumbers = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Enable Inline Highlighting")
            .setDesc("Enable syntax highlighting for inline code")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableInlineHighlight)
                    .onChange(async (value) => {
                        this.plugin.settings.enableInlineHighlight = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Enable Code Folding")
            .setDesc("Allow collapsing/expanding code blocks")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableFolding)
                    .onChange(async (value) => {
                        this.plugin.settings.enableFolding = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Enable Copy Button")
            .setDesc("Show copy button on code blocks")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableCodeCopy)
                    .onChange(async (value) => {
                        this.plugin.settings.enableCodeCopy = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Enable Language Label")
            .setDesc("Show language name in code block header")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableLanguageLabel)
                    .onChange(async (value) => {
                        this.plugin.settings.enableLanguageLabel = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Enable Word Wrap")
            .setDesc("Wrap long lines instead of showing horizontal scrollbar")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableWordWrap)
                    .onChange(async (value) => {
                        this.plugin.settings.enableWordWrap = value;
                        await this.plugin.saveSettings();
                    }),
            );
    }

    private addLanguageSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Language Settings" });

        new Setting(containerEl)
            .setName("Auto Detect Language")
            .setDesc("Attempt to automatically detect language when not specified")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.autoDetectLanguage)
                    .onChange(async (value) => {
                        this.plugin.settings.autoDetectLanguage = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Fallback Language")
            .setDesc("Language to use when detection fails")
            .addDropdown((dropdown) => {
                const fallbackOptions = {
                    text: "Plain Text",
                    javascript: "JavaScript",
                    typescript: "TypeScript",
                    python: "Python",
                    markdown: "Markdown",
                };
                dropdown.addOptions(fallbackOptions);
                dropdown.setValue(this.plugin.settings.fallbackLanguage);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.fallbackLanguage = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Supported Languages")
            .setDesc("Comma-separated list of languages to load")
            .addTextArea((text) => {
                text.setValue(this.plugin.settings.languages.join(", "));
                text.onChange(async (value) => {
                    this.plugin.settings.languages = value
                        .split(",")
                        .map((lang) => lang.trim())
                        .filter((lang) => lang.length > 0);
                    await this.plugin.saveSettings();
                });
                text.inputEl.rows = 3;
            });
    }

    private addPerformanceSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Performance Settings" });

        new Setting(containerEl)
            .setName("Enable Caching")
            .setDesc("Cache highlighted code for better performance")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.cacheEnabled)
                    .onChange(async (value) => {
                        this.plugin.settings.cacheEnabled = value;
                        await this.plugin.saveSettings();
                        if (!value) {
                            this.plugin.clearCache();
                        }
                    }),
            );

        new Setting(containerEl)
            .setName("Max Cache Size")
            .setDesc("Maximum number of cached entries")
            .addSlider((slider) =>
                slider
                    .setLimits(10, 1000, 10)
                    .setValue(this.plugin.settings.maxCacheSize)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.maxCacheSize = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Cache Expiration (Days)")
            .setDesc("Days before cache entries expire")
            .addSlider((slider) =>
                slider
                    .setLimits(1, 30, 1)
                    .setValue(this.plugin.settings.cacheExpirationDays)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.cacheExpirationDays = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Lazy Loading")
            .setDesc("Load syntax highlighter only when needed")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.lazyLoading)
                    .onChange(async (value) => {
                        this.plugin.settings.lazyLoading = value;
                        await this.plugin.saveSettings();
                    }),
            );
    }

    private addUISettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "UI Settings" });

        new Setting(containerEl)
            .setName("Font Size")
            .setDesc("Font size for code blocks")
            .addDropdown((dropdown) => {
                const fontSizes = {
                    "12px": "12px",
                    "13px": "13px",
                    "14px": "14px (Default)",
                    "15px": "15px",
                    "16px": "16px",
                    "18px": "18px",
                };
                dropdown.addOptions(fontSizes);
                dropdown.setValue(this.plugin.settings.fontSize);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.fontSize = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Font Family")
            .setDesc("Font family for code blocks")
            .addText((text) =>
                text
                    .setPlaceholder("Consolas, 'Courier New', monospace")
                    .setValue(this.plugin.settings.fontFamily)
                    .onChange(async (value) => {
                        this.plugin.settings.fontFamily = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Line Height")
            .setDesc("Line height for code blocks")
            .addDropdown((dropdown) => {
                const lineHeights = {
                    "1.2": "1.2",
                    "1.3": "1.3",
                    "1.4": "1.4 (Default)",
                    "1.5": "1.5",
                    "1.6": "1.6",
                };
                dropdown.addOptions(lineHeights);
                dropdown.setValue(this.plugin.settings.lineHeight);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.lineHeight = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Border Radius")
            .setDesc("Border radius for code blocks")
            .addText((text) =>
                text
                    .setPlaceholder("4px")
                    .setValue(this.plugin.settings.borderRadius)
                    .onChange(async (value) => {
                        this.plugin.settings.borderRadius = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Show Background")
            .setDesc("Show background color for code blocks")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.showBackground)
                    .onChange(async (value) => {
                        this.plugin.settings.showBackground = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Padding")
            .setDesc("Padding for code blocks")
            .addText((text) =>
                text
                    .setPlaceholder("16px")
                    .setValue(this.plugin.settings.padding)
                    .onChange(async (value) => {
                        this.plugin.settings.padding = value;
                        await this.plugin.saveSettings();
                    }),
            );
    }

    private addAdvancedSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Advanced Settings" });

        new Setting(containerEl)
            .setName("Enable Transformers")
            .setDesc("Enable custom code transformers for additional features")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableTransformers)
                    .onChange(async (value) => {
                        this.plugin.settings.enableTransformers = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Debug Mode")
            .setDesc("Enable debug logging for troubleshooting")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.debugMode)
                    .onChange(async (value) => {
                        this.plugin.settings.debugMode = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Custom CSS")
            .setDesc("Custom CSS to apply to code blocks")
            .addTextArea((text) => {
                text.setPlaceholder("/* Custom CSS rules */");
                text.setValue(this.plugin.settings.customCSS);
                text.onChange(async (value) => {
                    this.plugin.settings.customCSS = value;
                    await this.plugin.saveSettings();
                });
                text.inputEl.rows = 5;
            });
    }

    private addImportExportSettings(containerEl: HTMLElement): void {
        containerEl.createEl("h3", { text: "Import/Export Settings" });

        new Setting(containerEl)
            .setName("Export Settings")
            .setDesc("Export current settings to a file")
            .addButton((button) =>
                button
                    .setButtonText("Export")
                    .setCta()
                    .onClick(() => {
                        this.exportSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Import Settings")
            .setDesc("Import settings from a file")
            .addButton((button) =>
                button.setButtonText("Import").onClick(() => {
                    this.importSettings();
                }),
            );

        new Setting(containerEl)
            .setName("Reset to Defaults")
            .setDesc("Reset all settings to their default values")
            .addButton((button) =>
                button
                    .setButtonText("Reset")
                    .setWarning()
                    .onClick(async () => {
                        if (
                            confirm(
                                "Are you sure you want to reset all settings to defaults?",
                            )
                        ) {
                            this.plugin.settings = { ...DEFAULT_SETTINGS };
                            await this.plugin.saveSettings();
                            this.display();
                        }
                    }),
            );
    }

    exportSettings(): void {
        const settings = JSON.stringify(this.plugin.settings, null, 2);
        const blob = new Blob([settings], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "shiki-settings.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importSettings(): void {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importedSettings = JSON.parse(text);

                // Validate imported settings
                if (this.validateSettings(importedSettings)) {
                    this.plugin.settings = { ...DEFAULT_SETTINGS, ...importedSettings };
                    await this.plugin.saveSettings();
                    this.display();
                    alert("Settings imported successfully!");
                } else {
                    alert("Invalid settings file format!");
                }
            } catch (error) {
                alert("Error importing settings: " + error.message);
            }
        };

        input.click();
    }

    private validateSettings(settings: Record<string, unknown>): boolean {
        // Basic validation to ensure required properties exist
        const requiredProps = [
            "defaultTheme",
            "defaultDarkTheme",
            "defaultLightTheme",
            "enableLineNumbers",
            "enableInlineHighlight",
            "cacheEnabled",
        ];

        return requiredProps.every((prop) => prop in settings);
    }
}
