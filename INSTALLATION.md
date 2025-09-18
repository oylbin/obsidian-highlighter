# Installation Instructions - Obsidian Text Highlighter

## For Users

### Method 1: Manual Installation (Recommended for testing)

1. **Download the plugin files**:
   - Download `main.js`, `styles.css`, and `manifest.json` from the repository
   - Or build from source (see Development section below)

2. **Install in Obsidian**:
   - Open your Obsidian vault folder
   - Navigate to `.obsidian/plugins/` directory
   - Create a new folder called `obsidian-highlighter`
   - Copy the three files (`main.js`, `styles.css`, `manifest.json`) into this folder

3. **Enable the plugin**:
   - Open Obsidian
   - Go to Settings → Community plugins
   - Find "Text Highlighter" in the list
   - Toggle it on

4. **Verify installation**:
   - Select some text in a note
   - Right-click to see the highlighting options in the context menu

### Method 2: Community Plugin Store (Future)
This plugin is not yet available in the official Obsidian Community Plugins store. Once approved, you'll be able to install it directly from within Obsidian.

## For Developers

### Prerequisites
- Node.js (v16 or higher)
- npm
- Git

### Building from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anthropics/obsidian-highlighter.git
   cd obsidian-highlighter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   ```

4. **Development mode** (auto-rebuild on changes):
   ```bash
   npm run dev
   ```

### Development Setup

1. **Create a test vault**:
   - Create a new Obsidian vault for testing
   - This prevents affecting your main vault during development

2. **Link the plugin**:
   ```bash
   # From the project directory
   mkdir -p /path/to/test-vault/.obsidian/plugins/obsidian-highlighter
   cp main.js styles.css manifest.json /path/to/test-vault/.obsidian/plugins/obsidian-highlighter/
   ```

3. **Enable developer mode**:
   - In Obsidian Settings → Community plugins
   - Enable "Developer mode"
   - Enable the "Text Highlighter" plugin

4. **Debug with DevTools**:
   - Press `Ctrl+Shift+I` (or `Cmd+Opt+I` on Mac) to open Developer Console
   - Check for any errors or log messages

### File Structure

After building, your plugin directory should contain:

```
obsidian-highlighter/
├── main.js          # Bundled plugin code
├── styles.css       # Plugin styles
├── manifest.json    # Plugin metadata
├── src/             # Source code (TypeScript)
├── package.json     # Node.js dependencies
└── tsconfig.json    # TypeScript configuration
```

## Troubleshooting

### Plugin not appearing in settings
- Ensure all three files are in the correct directory
- Check that the folder name is exactly `obsidian-highlighter`
- Restart Obsidian and check again

### Right-click menu not showing highlight options
- Ensure the plugin is enabled in Settings → Community plugins
- Try selecting text and right-clicking again
- Check the Developer Console for any error messages

### Build errors
- Ensure Node.js version is 16 or higher: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

### Settings not saving
- Check file permissions on the `.obsidian/plugins/` directory
- Ensure Obsidian has write access to the vault directory
- Check Developer Console for error messages

## Requirements

- **Obsidian**: Version 0.15.0 or higher
- **Platforms**: Desktop (Windows, macOS, Linux) and Mobile (iOS, Android)
- **Dependencies**: None (all dependencies are bundled)

## Features

- **Right-click highlighting**: Select text and right-click to apply colors
- **Predefined colors**: Red, Yellow, Light Green with smart text color
- **Custom colors**: Add up to 10 custom background/foreground color combinations
- **Smart selection**: Automatically handles partial highlight selections
- **Nested highlight prevention**: Prevents overlapping highlights
- **Mobile support**: Works on Obsidian mobile with long-press context menu

## Support

For issues, feature requests, or contributions:
- GitHub Issues: https://github.com/anthropics/obsidian-highlighter/issues
- Documentation: See `quickstart.md` for usage examples

## License

MIT License - see LICENSE file for details.