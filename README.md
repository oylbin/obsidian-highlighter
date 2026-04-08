# 🎨 Obsidian Text Highlighter

A powerful and user-friendly Obsidian plugin that allows you to highlight text with customizable background and foreground colors using an intuitive right-click context menu.

![Plugin Demo](https://img.shields.io/badge/version-1.0.0-blue) ![Obsidian](https://img.shields.io/badge/obsidian-0.15.0+-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Core Functionality
- **Right-click highlighting**: Select text and right-click to apply colors instantly
- **Dual color support**: Customize both background and text colors
- **Smart selection**: Automatically handles partial highlight selections
- **Clean removal**: "Erase highlight" option removes markup cleanly

### 🎨 Color Management
- **3 predefined colors**: Red (white text), Yellow (black text), Light Green (default text)
- **Up to 10 custom colors**: Add your own color combinations
- **Flexible color formats**: Supports hex (#FF0000), RGB (rgb(255,0,0)), and CSS color names (red)
- **Optional foreground**: Set text color or leave empty for default

### 🛡️ Smart Behavior
- **Nested highlight prevention**: Automatically prevents overlapping highlights
- **Partial selection handling**: Expands selection to complete highlights when needed
- **Cross-platform compatibility**: Works on desktop and mobile devices
- **Settings persistence**: All custom colors saved across Obsidian sessions

## 🚀 Quick Start

### Installation

1. **Download** the plugin files (`main.js`, `styles.css`, `manifest.json`)
2. **Copy** to your vault's `.obsidian/plugins/obsidian-highlighter/` folder
3. **Enable** the plugin in Settings → Community plugins
4. **Start highlighting** by selecting text and right-clicking!

See [INSTALLATION.md](INSTALLATION.md) for detailed instructions.

### Basic Usage

1. **Select text** in any note
2. **Right-click** to open context menu
3. **Choose** from available highlight colors:
   - Highlight with Red
   - Highlight with Yellow
   - Highlight with Light Green
   - Any custom colors you've added
4. **Remove highlights** by selecting highlighted text and choosing "Erase highlight"

### Adding Custom Colors

1. Go to **Settings** → Community plugins → Text Highlighter
2. Click **"Add Color"**
3. Enter:
   - **Name**: Display name (e.g., "Ocean Blue")
   - **Background Color**: CSS color value (required)
   - **Foreground Color**: Text color (optional)
4. Click **"Save"**

Your custom color will immediately appear in the right-click menu!

## 🎨 Examples

### Predefined Colors
```markdown
This is <span style="background-color: red; color: white;">red highlighted text</span>.
This is <span style="background-color: yellow; color: black;">yellow highlighted text</span>.
This is <span style="background-color: lightgreen;">light green highlighted text</span>.
```

### Custom Colors
```markdown
This is <span style="background-color: #006994; color: #FFFFFF;">ocean blue highlighted text</span>.
This is <span style="background-color: #800080;">purple highlighted text</span>.
```

## 🔧 Technical Details

### Built With
- **TypeScript** with strict mode for type safety
- **Obsidian API** (official plugin API only)
- **esbuild** for fast compilation
- **CSS** for responsive styling

### Architecture
```
src/
├── main.ts          # Plugin entry point & context menu
├── settings.ts      # Settings UI and management
├── highlighter.ts   # Core highlighting logic
├── types.ts         # TypeScript type definitions
├── constants.ts     # Default settings and constants
└── utils/
    └── validation.ts # Color validation utilities
```

### Key Features
- **Non-destructive**: Original text is preserved, only wrapped in HTML
- **Reversible**: All highlights can be cleanly removed
- **Performant**: Lazy loading and efficient regex patterns
- **Accessible**: Keyboard shortcuts and screen reader friendly

## 📱 Mobile Support

The plugin works seamlessly on Obsidian mobile:
- **Long-press** selected text to open context menu
- **Native color picker** integration where available
- **Touch-optimized** settings interface
- **Same functionality** as desktop version

## 🛠️ Development

This project follows the **standardized DevOps Makefile** convention used across our projects: a thin `Makefile` defines stable target names, and all real logic lives in `dev.sh`. **Everything runs inside a Docker dev container** — you do not need Node.js, npm, or any toolchain installed on your host.

### Prerequisites
- Docker (Docker Desktop on Windows/macOS, or docker engine + compose v2 on Linux)
- `bash` and `make` (already available on macOS, Linux, and Windows MINGW64 / Git Bash)
- Obsidian (for manual testing)

### One-time setup
```bash
git clone https://github.com/anthropics/obsidian-highlighter.git
cd obsidian-highlighter

cp .env.example .env       # then edit VAULT_PLUGIN_PATH to point at your test vault
make doctor                # verifies docker / compose / .env
make up                    # starts the dev container
make deps                  # npm install (inside the container)
```

### Daily workflow
```bash
make watch                 # esbuild watch mode (Ctrl+C to stop)
make install               # copy main.js / styles.css / manifest.json to your test vault
                           # then reload Obsidian (Ctrl+R) to pick up changes

make fmt                   # prettier
make lint                  # eslint
make test                  # tsc --noEmit (type check)
make build                 # one-shot production build
make artifacts             # verify the three plugin files are present
```

### All available targets
Run `make help` to see the full list. The most common ones:

| Target | Purpose |
|---|---|
| `make doctor` | Check docker / compose / `.env` |
| `make up` / `make down` | Start / stop the dev container |
| `make shell` | Open a shell inside the dev container |
| `make deps` | `npm install` inside the container |
| `make build` | Production build (esbuild) |
| `make watch` | Watch-mode rebuild |
| `make lint` / `make fmt` | eslint / prettier |
| `make test` | TypeScript type check |
| `make install` | Deploy artifacts to `$VAULT_PLUGIN_PATH` |
| `make clean` | Remove `main.js` (`make clean --all` also drops `node_modules` volume) |
| `make release VERSION=1.1.0` | Bump version, commit, and tag |

See [INSTALLATION.md](INSTALLATION.md) for detailed setup notes and troubleshooting.

## 🎯 Roadmap

### Planned Features
- [ ] Highlight categories/tags
- [ ] Export highlighted text
- [ ] Highlight search and navigation
- [ ] Keyboard shortcuts
- [ ] Highlight statistics

### Community Requests
- [ ] Highlight templates
- [ ] Batch operations
- [ ] Integration with other plugins
- [ ] Advanced color picker

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use official Obsidian APIs only
- Add JSDoc comments for public functions
- Test on both desktop and mobile
- Follow existing code style

## 📖 Documentation

- [Installation Guide](INSTALLATION.md) - Detailed setup instructions
- [User Guide](specs/001-i-want-to/quickstart.md) - Complete usage examples
- [Technical Spec](specs/001-i-want-to/plan.md) - Implementation details
- [API Reference](src/types.ts) - TypeScript interfaces

## 🐛 Troubleshooting

### Common Issues

**Context menu not showing?**
- Ensure plugin is enabled in Settings
- Check Developer Console for errors (Ctrl+Shift+I)

**Settings not saving?**
- Check file permissions on `.obsidian/plugins/` directory
- Verify Obsidian has write access to vault

**Colors not working?**
- Ensure color format is valid CSS
- Use hex (#RRGGBB), rgb(), or standard color names

See [INSTALLATION.md](INSTALLATION.md) for more troubleshooting tips.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Obsidian team** for the excellent plugin API
- **Community** for feature requests and feedback
- **Claude Code** for development assistance

---

**Made with ❤️ for the Obsidian community**

If you find this plugin useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or suggesting features
- 🤝 Contributing to the codebase
- 💝 Supporting the project