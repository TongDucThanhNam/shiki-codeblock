# Shiki Code Block Plugin for Obsidian

A powerful syntax highlighting plugin for Obsidian that uses Shiki to provide beautiful code blocks with enhanced features including codeblock headers with filenames and copy functionality.

## Features

### ✨ Enhanced CodeBlock Header

-   **Language Icon**: Visual language identification with emoji icons
-   **Filename Display**: Show the filename in a clean header layout
-   **Copy Button**: One-click copy functionality with visual feedback
-   **Modern Design**: Clean header design that integrates seamlessly with Obsidian themes
-   **Layout**: Language icon and filename on the left, copy button on the right

### 🎨 Syntax Highlighting

-   High-quality syntax highlighting powered by Shiki
-   Support for 100+ programming languages
-   Multiple theme options (light and dark)
-   Automatic theme switching based on Obsidian's theme

### 🛠 Advanced Features

-   Line numbers with customizable start positions
-   Line highlighting for emphasis
-   Code folding capabilities
-   Inline code highlighting
-   Custom themes support
-   Performance optimizations with caching

## Usage

### Basic Code Block

````markdown
```javascript
console.log("Hello, World!");
```
````

### Code Block with Filename

````markdown
```javascript filename:"app.js"
function greet(name) {
	return `Hello, ${name}!`;
}
```
````

### Advanced Configuration

````markdown
```typescript filename:"types.ts" ln:5 hl:2-4
interface User {
	id: number;
	name: string;
	email: string;
}
```
````

## Configuration Options

-   `filename:"name.ext"` - Display filename in header
-   `ln` or `ln:true` - Enable line numbers
-   `ln:5` - Start line numbers from 5
-   `hl:2-4,7` - Highlight lines 2-4 and 7
-   `title:"Custom Title"` - Add a title
-   `theme:dracula` - Use custom theme
-   `fold` - Start folded
-   `exclude` - Skip highlighting

## Installation

1. Download the latest release
2. Extract to `.obsidian/plugins/shiki-codeblock/`
3. Enable the plugin in Obsidian settings
4. Configure your preferences in the plugin settings

## Development

```bash
# Install dependencies
bun install

# Development mode with hot reload
bun run dev

# Build for production
bun run build
```

## License

MIT License - see LICENSE file for details

-   `npm i` or `yarn` to install dependencies.
-   `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

-   Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)

-   [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.
-   To use eslint with this project, make sure to install eslint from terminal:
    -   `npm install -g eslint`
-   To use eslint to analyze this project use this command:
    -   `eslint main.ts`
    -   eslint will then create a report with suggestions for code improvement by file and line number.
-   If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
    -   `eslint .\src\`

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
	"fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
	"fundingUrl": {
		"Buy Me a Coffee": "https://buymeacoffee.com",
		"GitHub Sponsor": "https://github.com/sponsors",
		"Patreon": "https://www.patreon.com/"
	}
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
