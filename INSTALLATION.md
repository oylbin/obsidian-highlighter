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

This project uses a **containerized DevOps workflow**: a `Makefile` provides stable command names, `dev.sh` carries the logic, and everything runs inside a Docker dev container. You do **not** need Node.js or npm on your host.

### Prerequisites
- **Docker** (Docker Desktop on Windows/macOS, or docker engine + compose v2 on Linux)
- **bash** and **make** (preinstalled on macOS/Linux; on Windows use Git Bash / MINGW64)
- **Git**
- **Obsidian** (for manual testing in a vault)

### Building from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anthropics/obsidian-highlighter.git
   cd obsidian-highlighter
   ```

2. **Configure your test vault**:
   ```bash
   cp .env.example .env
   # Edit .env and set VAULT_PLUGIN_PATH to your Obsidian test vault's plugin folder.
   # Example (Windows MINGW64):
   #   VAULT_PLUGIN_PATH=/c/Users/me/ObsidianVault/.obsidian/plugins/obsidian-highlighter
   ```

3. **Verify your environment**:
   ```bash
   make doctor
   ```

4. **Start the dev container and install dependencies**:
   ```bash
   make up
   make deps
   ```

5. **Build the plugin**:
   ```bash
   make build
   ```

6. **Deploy to your test vault**:
   ```bash
   make install
   ```
   Then reload Obsidian (`Ctrl+R` / `Cmd+R`) to load the new build.

### Development Loop

The fastest iteration loop is:

```bash
make watch          # Terminal A: esbuild rebuilds on every change
make install        # Terminal B: deploy after a change; reload Obsidian
```

Other useful commands:

```bash
make fmt            # prettier
make lint           # eslint
make test           # tsc --noEmit (type check)
make artifacts      # verify the three plugin files exist
make shell          # open a shell inside the dev container
make logs           # tail dev container logs
make down           # stop the dev container
```

### Optional: Host-side `npm install` for IDE type completion

The dev container's `node_modules` lives in a Docker named volume so it's invisible to your IDE. If you want type completion / "go to definition" in VS Code etc., you may optionally run `npm install` on the host as well:

```bash
npm install         # only for IDE; build still happens in the container
```

This is **purely optional** — builds, lint, format and tests all run in the container.

### File Structure

After building, your project directory will contain:

```
obsidian-highlighter/
├── Makefile             # Standardized DevOps targets
├── dev.sh               # Logic behind the Makefile
├── docker-compose.yml   # Dev container definition
├── .env.example         # Sample env file (VAULT_PLUGIN_PATH)
├── main.js              # Bundled plugin code (build output)
├── styles.css           # Plugin styles
├── manifest.json        # Plugin metadata
├── src/                 # TypeScript source
├── package.json         # Node.js dependencies
└── tsconfig.json        # TypeScript configuration
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
- Verify Docker is running: `docker info`
- Verify the dev container is healthy: `make status`
- Re-create the dev container from scratch: `make clean --all && make up && make deps`
- Check for TypeScript errors: `make test`

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