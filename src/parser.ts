import type { CodeBlockConfig } from "./types";

export class CodeBlockParser {
    parseCodeBlockConfig(langString: string): CodeBlockConfig {
        if (!langString || typeof langString !== 'string') {
            return this.getDefaultConfig('text');
        }

        const parts = this.splitLanguageString(langString);
        const language = this.normalizeLanguage(parts[0] || 'text');

        const config: CodeBlockConfig = {
            language,
            highlightLines: [],
            showLineNumbers: false,
            startLineNumber: 1,
            fold: false,
            unfold: false,
            exclude: false,
        };

        // Parse parameters with better error handling
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];

            try {
                if (part.startsWith("hl:")) {
                    config.highlightLines = this.parseHighlightRanges(part.substring(3));
                } else if (part.startsWith("ln:")) {
                    const value = part.substring(3);
                    if (value === "true") {
                        config.showLineNumbers = true;
                    } else if (value === "false") {
                        config.showLineNumbers = false;
                    } else if (!Number.isNaN(Number(value))) {
                        config.showLineNumbers = true;
                        config.startLineNumber = Number(value);
                    }
                } else if (part === "ln") {
                    config.showLineNumbers = true;
                } else if (part.startsWith("title:") || part.startsWith("file:")) {
                    const prefix = part.startsWith("title:") ? "title:" : "file:";
                    config.title = this.parseTitle(part, prefix);
                } else if (part.startsWith("filename:")) {
                    config.filename = this.parseTitle(part, "filename:");
                } else if (part.startsWith("theme:")) {
                    config.customTheme = part.substring(6);
                } else if (part === "fold") {
                    config.fold = true;
                } else if (part === "unfold") {
                    config.unfold = true;
                } else if (part === "exclude") {
                    config.exclude = true;
                }
            } catch (error) {
                console.warn(`Failed to parse code block parameter "${part}":`, error);
            }
        }

        return config;
    }

    private parseHighlightRanges(rangeString: string): number[] {
        if (!rangeString || !rangeString.trim()) {
            return [];
        }

        const ranges: number[] = [];
        const parts = rangeString.split(",");

        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;

            try {
                if (trimmed.includes("-")) {
                    // Range format: "1-5"
                    const [startStr, endStr] = trimmed.split("-");
                    const start = parseInt(startStr?.trim() || '');
                    const end = parseInt(endStr?.trim() || '');

                    if (!Number.isNaN(start) && !Number.isNaN(end) && start > 0 && end >= start) {
                        for (let i = start; i <= end; i++) {
                            ranges.push(i);
                        }
                    }
                } else {
                    // Single line: "3"
                    const line = parseInt(trimmed);
                    if (!Number.isNaN(line) && line > 0) {
                        ranges.push(line);
                    }
                }
            } catch (error) {
                console.warn(`Failed to parse highlight range "${trimmed}":`, error);
            }
        }

        return [...new Set(ranges)].sort((a, b) => a - b); // Remove duplicates and sort
    }

    private parseTitle(part: string, prefix: string): string {
        let title = part.substring(prefix.length);

        // Handle quoted titles (both single and double quotes)
        if ((title.startsWith('"') && title.endsWith('"')) ||
            (title.startsWith("'") && title.endsWith("'"))) {
            title = title.slice(1, -1);
        }

        // Handle escaped quotes and other escape sequences
        title = title
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');

        return title;
    }

    parseInlineCode(text: string): { lang: string; code: string } | null {
        if (!text || typeof text !== 'string') {
            return null;
        }

        // Support multiple inline code formats:
        // {lang} code
        // lang: code
        // [lang] code

        // Format 1: {lang} code
        let match = text.match(/^{(\w+)}\s*(.+)$/);
        if (match) {
            return {
                lang: this.normalizeLanguage(match[1]),
                code: match[2].trim(),
            };
        }

        // Format 2: lang: code
        match = text.match(/^(\w+):\s*(.+)$/);
        if (match) {
            return {
                lang: this.normalizeLanguage(match[1]),
                code: match[2].trim(),
            };
        }

        // Format 3: [lang] code
        match = text.match(/^\[(\w+)\]\s*(.+)$/);
        if (match) {
            return {
                lang: this.normalizeLanguage(match[1]),
                code: match[2].trim(),
            };
        }

        return null;
    }

    private getDefaultConfig(language: string): CodeBlockConfig {
        return {
            language,
            highlightLines: [],
            showLineNumbers: false,
            startLineNumber: 1,
            fold: false,
            unfold: false,
            exclude: false,
        };
    }

    private splitLanguageString(langString: string): string[] {
        // Handle quoted parameters properly
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < langString.length; i++) {
            const char = langString[i];

            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (inQuotes && char === quoteChar && langString[i - 1] !== '\\') {
                inQuotes = false;
                current += char;
            } else if (!inQuotes && /\s/.test(char)) {
                if (current.trim()) {
                    parts.push(current.trim());
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            parts.push(current.trim());
        }

        return parts;
    }

    private normalizeLanguage(language: string): string {
        // Handle common language aliases
        const languageMap: Record<string, string> = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'sh': 'shell',
            'bash': 'shell',
            'zsh': 'shell',
            'fish': 'shell',
            'ps1': 'powershell',
            'pwsh': 'powershell',
            'yml': 'yaml',
            'md': 'markdown',
            'mjs': 'javascript',
            'cjs': 'javascript',
            'jsx': 'javascript',
            'tsx': 'typescript',
            'vue': 'vue',
            'svelte': 'svelte'
        };

        const normalized = language.toLowerCase();
        return languageMap[normalized] || normalized;
    }

    /**
     * Validates if a code block configuration is valid
     */
    validateConfig(config: CodeBlockConfig): boolean {
        try {
            // Basic validation
            if (!config.language || typeof config.language !== 'string') {
                return false;
            }

            // Validate line numbers
            if (config.startLineNumber < 1) {
                return false;
            }

            // Validate highlight lines
            if (config.highlightLines && Array.isArray(config.highlightLines)) {
                for (const line of config.highlightLines) {
                    if (!Number.isInteger(line) || line < 1) {
                        return false;
                    }
                }
            }

            // Mutual exclusivity checks
            if (config.fold && config.unfold) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Sanitizes a code block configuration
     */
    sanitizeConfig(config: CodeBlockConfig): CodeBlockConfig {
        return {
            language: this.normalizeLanguage(config.language || 'text'),
            highlightLines: Array.isArray(config.highlightLines)
                ? config.highlightLines.filter(line => Number.isInteger(line) && line > 0)
                : [],
            showLineNumbers: Boolean(config.showLineNumbers),
            startLineNumber: Math.max(1, config.startLineNumber || 1),
            title: config.title ? String(config.title).substring(0, 200) : undefined, // Limit title length
            fold: Boolean(config.fold) && !config.unfold,
            unfold: Boolean(config.unfold) && !config.fold,
            exclude: Boolean(config.exclude),
            customTheme: config.customTheme ? String(config.customTheme) : undefined,
        };
    }

    /**
     * Gets supported language aliases
     */
    getSupportedLanguages(): string[] {
        return [
            'javascript', 'js', 'typescript', 'ts', 'python', 'py',
            'java', 'cpp', 'c', 'csharp', 'cs', 'php', 'ruby', 'rb',
            'go', 'rust', 'swift', 'kotlin', 'scala', 'shell', 'bash',
            'powershell', 'html', 'css', 'scss', 'sass', 'less',
            'xml', 'json', 'yaml', 'yml', 'toml', 'markdown', 'md',
            'sql', 'graphql', 'dockerfile', 'nginx', 'apache',
            'vue', 'svelte', 'react', 'angular', 'jsx', 'tsx'
        ];
    }
}
