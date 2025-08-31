import type { ShikiPluginSettings } from "./types"

export class UIManager {
    private settings: ShikiPluginSettings

    constructor(settings: ShikiPluginSettings) {
        this.settings = settings
    }

    updateSettings(settings: ShikiPluginSettings): void {
        this.settings = settings
    }

    applyUISettings(): void {
        // Apply custom CSS
        const styleId = "shiki-custom-styles"
        let styleEl = document.getElementById(styleId) as HTMLStyleElement

        if (!styleEl) {
            styleEl = document.createElement("style")
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }

        const customCSS = `
            /* Base code block styles - Match React CodeEditor component */
            .shiki {
                font-size: ${this.settings.fontSize} !important;
                font-family: ${this.settings.fontFamily} !important;
                line-height: ${this.settings.lineHeight} !important;
                border-radius: 0.75rem !important;
                padding: 0 !important;
                ${!this.settings.showBackground ? "background: transparent !important;" : ""}
                ${this.settings.enableWordWrap
                ? "white-space: pre-wrap !important; word-wrap: break-word !important; overflow-x: visible !important;"
                : "white-space: pre !important; word-wrap: normal !important; overflow-x: auto !important;"
            }
                position: relative;
                margin: 1rem 0;
                border: 1px solid hsl(var(--border));
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: ${this.settings.enableWordWrap ? "hidden" : "auto"};
                outline: none;
                background: hsl(var(--card));
                color: hsl(var(--card-foreground));
            }
            
            .shiki code {
                font-size: 13px !important;
                font-family: inherit !important;
                ${this.settings.enableWordWrap
                ? "white-space: pre-wrap !important; word-wrap: break-word !important;"
                : "white-space: pre !important; word-wrap: normal !important;"
            }
            }
            
            /* Header styles - Match CodeEditor header design */
            .shiki-with-header {
                position: relative;
            }
            
            .shiki-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                height: 38px;
                border-bottom: 1px solid hsl(var(--border));
                padding: 0 1rem;
                color: hsl(var(--muted-foreground));
                font-size: 13px;
            }
            
            .shiki-header-left {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
                min-width: 0;
            }
            
            .shiki-file-icon {
                display: flex;
                align-items: center;
                flex-shrink: 0;
            }
            
            .shiki-file-icon .shiki-icon {
                width: 14px;
                height: 14px;
                color: currentColor;
            }
            
            .shiki-filename-display {
                flex: 1;
                truncate: true;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 400;
            }
            
            .shiki-copy-container {
                margin-right: -0.5rem;
            }
            
            .shiki-copy-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                font-weight: 500;
                transition: colors 100ms;
                background: transparent;
                border: none;
                color: hsl(var(--muted-foreground));
                padding: 0.25rem;
                cursor: pointer;
                width: 28px;
                height: 28px;
            }
            
            .shiki-copy-button:hover {
                color: hsl(var(--accent-foreground));
            }
            
            .shiki-copy-button:focus-visible {
                outline: none;
            }
            
            .shiki-copy-button svg {
                width: 16px;
                height: 16px;
            }
            
            .shiki-copy-success {
                color: hsl(var(--primary)) !important;
            }
            
            .shiki-copy-error {
                color: hsl(var(--destructive)) !important;
            }
            
            /* Code content area - Match CodeEditor layout */
            .shiki pre {
                margin: 0 !important;
                padding: 14px 0 !important;
                background: transparent !important;
                overflow: auto;
                max-height: 600px;
                font-size: 13px;
                min-width: 100%;
                width: max-content;
            }
            
            .shiki pre code {
                display: flex;
                flex-direction: column;
            }
            
            /* Line styles - Match CodeEditor flex layout */
            .shiki-line-numbers .line {
                display: flex;
            }
            
            .shiki-line-wrapper {
                display: flex;
                min-width: ${this.settings.enableWordWrap ? "100%" : "max-content"};
            }
            
            .shiki-line-number {
                color: hsla(var(--muted-foreground), 0.6);
                user-select: none;
                text-align: right;
                width: 2rem;
                padding-right: 0.75rem;
                flex-shrink: 0;
                font-variant-numeric: tabular-nums;
                font-size: inherit;
            }
            
            .shiki-line-content {
                flex: 1;
                line-height: inherit;
                ${this.settings.enableWordWrap
                ? ""
                : "white-space: pre; min-width: max-content;"
            }
            }
            
            /* Lines without line numbers */
            .shiki:not(.shiki-line-numbers) .line {
                padding-left: 1rem;
                padding-right: 1rem;
            }
            
            /* CSS Custom Properties for Shiki themes */
            .shiki {
                --shiki-light: #4c4f69;
                --shiki-dark: #cdd6f4;
                --shiki-light-bg: #eff1f5;
                --shiki-dark-bg: #1e1e2e;
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
                background: hsl(var(--primary));
            }
            
            /* Title styles */
            .shiki-title {
                background: hsl(var(--muted));
                padding: 0.5rem 1rem;
                font-weight: 600;
                border-bottom: 1px solid hsl(var(--border));
                margin: 0;
                color: hsl(var(--foreground));
                font-size: 13px;
            }
            
            /* Folding styles */
            .shiki-foldable .shiki-title::after {
                content: '▼';
                margin-left: auto;
                transition: transform 0.2s ease;
                float: right;
            }
            
            .shiki-folded .shiki-title::after {
                transform: rotate(-90deg);
            }
            
            .shiki-folded pre {
                display: none;
            }
            
            /* Custom scrollbar */
            .shiki pre {
                scrollbar-width: thin;
                scrollbar-color: hsl(var(--muted)) transparent;
            }
            
            .shiki pre::-webkit-scrollbar {
                height: 8px;
                width: 8px;
            }
            
            .shiki pre::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .shiki pre::-webkit-scrollbar-thumb {
                background: hsl(var(--muted));
                border-radius: 4px;
            }
            
            .shiki pre::-webkit-scrollbar-thumb:hover {
                background: hsl(var(--muted-foreground));
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .shiki-header {
                    padding: 0 0.75rem;
                }
                
                .shiki-filename-display {
                    font-size: 12px;
                }
                
                .shiki-line-number {
                    width: 1.75rem;
                    padding-right: 0.5rem;
                }
                
                .shiki pre {
                    padding: 12px 0 !important;
                }
                
                .shiki:not(.shiki-line-numbers) .line {
                    padding-left: 0.75rem;
                    padding-right: 0.75rem;
                }
            }
            
            ${this.settings.customCSS}
        `

        styleEl.textContent = customCSS

        if (this.settings.debugMode) {
            console.log("[Shiki Debug] Applied UI settings:", this.settings)
        }
    }

    removeCustomStyles(): void {
        const styleEl = document.getElementById("shiki-custom-styles")
        if (styleEl) {
            styleEl.remove()
        }
    }
}
