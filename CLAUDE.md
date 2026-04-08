# Claude Code Context for Obsidian Text Highlighter

## Project Overview
Obsidian plugin that enables text highlighting with colored backgrounds and optional foreground colors using HTML span tags. Users can right-click selected text to apply predefined or custom colors with both background and text color options.

## Tech Stack
- **Language**: TypeScript (strict mode)
- **Runtime**: Obsidian Plugin API
- **Build**: esbuild
- **Styling**: CSS with inline styles for highlights
- **Storage**: JSON in `.obsidian/plugins/` directory

## Project Structure
```
obsidian-highlighter/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── settings.ts          # Settings tab and management
│   ├── highlighter.ts       # Core highlight logic
│   └── types.ts            # TypeScript interfaces
├── styles.css              # Plugin styles
├── manifest.json           # Plugin metadata
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

## Key Features
1. **Context Menu Integration**: Right-click to highlight/erase
2. **Predefined Colors**: Red (white text), Yellow (black text), Light Green (default text)
3. **Custom Colors**: Up to 10 user-defined colors with optional foreground
4. **Smart Selection**: Expands partial highlights automatically
5. **Reversible Operations**: All highlights can be cleanly removed
6. **Dual Color Support**: Background and optional foreground colors

## Implementation Guidelines

### Obsidian API Usage
- Use `registerEvent()` for context menu: `'editor-menu'` event
- Use `Editor.replaceSelection()` for text manipulation
- Use `PluginSettingTab` for settings UI
- Never use private Obsidian APIs

### HTML Format
```html
<!-- With both background and foreground -->
<span style="background-color: [bg-color]; color: [fg-color];">[text]</span>

<!-- With background only -->
<span style="background-color: [bg-color];">[text]</span>
```

### Color Validation
```typescript
function isValidColor(color: string): boolean {
  const style = new Option().style;
  style.color = color;
  return style.color !== '';
}

// ColorDefinition interface
interface ColorDefinition {
  name: string;
  backgroundColor: string;
  foregroundColor?: string | null;
  isCustom: boolean;
}
```

### Highlight Detection Pattern
```typescript
// Handles both background-only and background+foreground patterns
const pattern = /<span style="background-color:\s*([^;"]+)(?:;\s*color:\s*([^;"]+))?[^>]*>([^<]*)<\/span>/gi;
```

## Testing Approach
- Manual testing via Obsidian Developer Console
- Test scenarios in quickstart.md
- Validate in both desktop and mobile environments

## Constitutional Requirements
1. **Obsidian API Compliance**: Official API only
2. **User Data Safety**: Non-destructive, reversible operations
3. **TypeScript-First**: Strict mode enabled
4. **Performance**: Non-blocking operations
5. **Cross-Platform**: Desktop and mobile support

## Current Status
- [x] Specification complete
- [x] Technical research done
- [x] Data model defined
- [x] API contracts created
- [ ] Implementation pending
- [ ] Testing pending

## DevOps Workflow

This project uses a **standardized containerized DevOps workflow**. All build / lint / fmt / test commands run inside a Docker dev container — never on the host. The `Makefile` is a thin protocol layer; all real logic lives in `dev.sh`.

**Always use `make` targets — do not invoke `npm` or `node` directly on the host.**

## Common Commands
```bash
# One-time setup
cp .env.example .env       # set VAULT_PLUGIN_PATH
make doctor                # check docker / compose / .env
make up                    # start dev container
make deps                  # npm install (in container)

# Daily workflow
make watch                 # esbuild watch mode
make install               # deploy to $VAULT_PLUGIN_PATH
make build                 # production build
make fmt                   # prettier
make lint                  # eslint
make test                  # tsc --noEmit (type check)
make artifacts             # verify main.js / styles.css / manifest.json

# Container lifecycle
make shell                 # enter the dev container
make logs                  # tail container logs
make down                  # stop container
make clean                 # remove main.js (use --all to also drop node_modules volume)

# Release
make release VERSION=1.1.0 # bump + commit + tag (does NOT push)
```

Run `make help` to see all available targets.

## Edge Cases to Handle
1. **Partial Highlight Selection**: Expand to full highlight
2. **Nested Highlights**: Prevent (not allowed)
3. **Multi-paragraph**: Treat as single block
4. **Invalid Colors**: Validate before saving
5. **Max Custom Colors**: Enforce limit of 10

## Next Steps
1. Initialize project structure
2. Implement core highlighting logic
3. Create settings UI
4. Add context menu integration
5. Handle edge cases
6. Test all scenarios

---
*Generated for feature 001-i-want-to*