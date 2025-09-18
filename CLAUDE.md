# Claude Code Context for Obsidian Text Highlighter

## Project Overview
Obsidian plugin that enables text highlighting with colored backgrounds using HTML span tags. Users can right-click selected text to apply predefined or custom colors.

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
2. **Predefined Colors**: Red, Yellow, Light Green
3. **Custom Colors**: Up to 10 user-defined colors
4. **Smart Selection**: Expands partial highlights automatically
5. **Reversible Operations**: All highlights can be cleanly removed

## Implementation Guidelines

### Obsidian API Usage
- Use `registerEvent()` for context menu: `'editor-menu'` event
- Use `Editor.replaceSelection()` for text manipulation
- Use `PluginSettingTab` for settings UI
- Never use private Obsidian APIs

### HTML Format
```html
<span style="background-color: [color];">[text]</span>
```

### Color Validation
```typescript
function isValidColor(color: string): boolean {
  const style = new Option().style;
  style.color = color;
  return style.color !== '';
}
```

### Highlight Detection Pattern
```typescript
const pattern = /<span style="background-color:\s*([^;"]+)[^>]*>([^<]*)<\/span>/gi;
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

## Common Commands
```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Development build with watch
npm run dev

# Install to test vault
cp main.js styles.css manifest.json /path/to/vault/.obsidian/plugins/obsidian-highlighter/
```

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