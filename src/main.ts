import { Notice, Plugin } from "obsidian";
import { CodeProcessor } from "./code-processor";
import { ShikiHighlighterManager } from "./highlighter";
import { CodeBlockParser } from "./parser";
import { ShikiSettingTab } from "./settings";
import { SettingsManager } from "./settings-manager";
import { TransformersManager } from "./transformers-manager";
import type { ShikiPluginSettings } from "./types";
import { UIManager } from "./ui-manager";

export default class ShikiCustomPlugin extends Plugin {
    settings: ShikiPluginSettings;
    highlighter: ShikiHighlighterManager;
    parser: CodeBlockParser;
    settingsTab: ShikiSettingTab;
    uiManager: UIManager;
    codeProcessor: CodeProcessor;
    transformersManager: TransformersManager;
    settingsManager: SettingsManager;

    async onload() {
        // Initialize managers first
        this.settingsManager = new SettingsManager();

        await this.loadSettings();

        this.uiManager = new UIManager(this.settings);
        this.transformersManager = new TransformersManager(this.settings);

        // Apply UI settings on startup
        this.uiManager.applyUISettings();

        // Initialize components
        this.highlighter = new ShikiHighlighterManager(this.settings);
        this.parser = new CodeBlockParser();
        this.codeProcessor = new CodeProcessor(
            this.settings,
            this.highlighter,
            this.parser,
            this.transformersManager,
        );

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
        this.registerMarkdownPostProcessor(
            this.codeProcessor.processCodeBlocks.bind(this.codeProcessor),
        );

        if (this.settings.enableInlineHighlight) {
            this.registerMarkdownPostProcessor(
                this.codeProcessor.processInlineCode.bind(this.codeProcessor),
            );
        }

        // Add settings tab
        this.settingsTab = new ShikiSettingTab(this.app, this);
        this.addSettingTab(this.settingsTab);

        // Register theme change event
        this.registerEvent(
            this.app.workspace.on("css-change", () => {
                if (this.settings.autoThemeSwitch) {
                    this.codeProcessor.refreshAllCodeBlocks();
                }
            }),
        );

        // Register commands
        this.addCommand({
            id: "refresh-highlighting",
            name: "Refresh Code Highlighting",
            callback: () => this.codeProcessor.refreshAllCodeBlocks(),
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
                new Notice(
                    `Line numbers ${this.settings.enableLineNumbers ? "enabled" : "disabled"}`,
                );
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

    async loadSettings() {
        const loadedData = await this.loadData();
        this.settings = this.settingsManager.mergeWithDefaults(loadedData);

        // Validate and migrate settings if needed
        this.validateAndMigrateSettings();

        if (this.settings.debugMode) {
            console.log("[Shiki Debug] Settings loaded:", this.settings);
        }
    }

    private validateAndMigrateSettings(): void {
        const result = this.settingsManager.validateAndMigrateSettings(
            this.settings,
        );
        this.settings = result.settings;

        // Save settings if they were changed during validation
        if (result.changed) {
            this.saveSettings();
            if (this.settings.debugMode) {
                console.log("[Shiki Debug] Settings validated and migrated");
            }
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);

        // Update component settings
        this.highlighter?.updateSettings(this.settings);
        this.uiManager?.updateSettings(this.settings);
        this.codeProcessor?.updateSettings(this.settings);

        // Apply UI settings
        this.uiManager?.applyUISettings();

        // Re-register inline processor if setting changed
        if (this.settings.enableInlineHighlight) {
            this.registerMarkdownPostProcessor(
                this.codeProcessor.processInlineCode.bind(this.codeProcessor),
            );
        }

        // Refresh all code blocks to apply new settings
        this.codeProcessor?.refreshAllCodeBlocks();
    }

    clearCache() {
        this.highlighter?.clearCache();
    }

    onunload() {
        this.clearCache();

        // Remove custom styles
        this.uiManager?.removeCustomStyles();
    }
}
