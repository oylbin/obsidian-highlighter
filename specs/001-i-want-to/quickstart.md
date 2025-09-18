# Quickstart Guide: Obsidian Text Highlighter

## Installation

1. **Build the plugin**:
   ```bash
   npm install
   npm run build
   ```

2. **Install in Obsidian**:
   - Copy `main.js`, `styles.css`, and `manifest.json` to your vault's `.obsidian/plugins/obsidian-highlighter/` folder
   - Reload Obsidian
   - Enable the plugin in Settings → Community plugins

## Basic Usage

### Applying Highlights

1. **Select text** in your note that you want to highlight
2. **Right-click** to open the context menu
3. **Choose a color** from the "Highlight with..." options:
   - Red
   - Yellow
   - Light Green
   - Any custom colors you've added

The selected text will be wrapped with HTML markup and displayed with a colored background.

### Removing Highlights

1. **Select highlighted text** (or click anywhere within it)
2. **Right-click** to open the context menu
3. **Select "Erase highlight"**

The highlighting will be removed, leaving the original text.

## Adding Custom Colors

1. **Open Settings** → Community plugins → Text Highlighter
2. **Click "Add Color"** button
3. **Enter color details**:
   - Name: Display name for the color (e.g., "Ocean Blue")
   - Value: CSS color value
     - Hex: `#006994`
     - RGB: `rgb(0, 105, 148)`
     - Name: `steelblue`
4. **Click "Save"**

Your custom color will now appear in the context menu.

## Test Scenarios

### Scenario 1: Basic Highlighting
```markdown
This is a test sentence with important information.
```
1. Select "important information"
2. Right-click → "Highlight with Yellow"
3. Result: `This is a test sentence with <span style="background-color: yellow;">important information</span>.`

### Scenario 2: Removing Highlight
1. Click on previously highlighted text
2. Right-click → "Erase highlight"
3. Result: Original text restored

### Scenario 3: Custom Color
1. Add custom color "Purple" (#800080) in settings
2. Select text
3. Right-click → "Highlight with Purple"
4. Verify purple background appears

### Scenario 4: Partial Selection
```markdown
This is <span style="background-color: yellow;">partially highlighted</span> text.
```
1. Select "highlighted" (part of the span)
2. Right-click → "Erase highlight"
3. Entire highlight should be removed

### Scenario 5: Multi-paragraph Selection
```markdown
First paragraph text.

Second paragraph text.
```
1. Select from "First" to "Second"
2. Right-click → "Highlight with Red"
3. Both paragraphs should be highlighted as one block

### Scenario 6: Maximum Custom Colors
1. Add 10 custom colors in settings
2. Try to add an 11th color
3. Should see error message about limit

### Scenario 7: Invalid Color Input
1. Open settings
2. Try to add color with value "notacolor"
3. Should see validation error

### Scenario 8: Duplicate Color Names
1. Add custom color "Blue"
2. Try to add another color named "Blue"
3. Should see error about duplicate name

## Validation Checklist

- [ ] Plugin loads without errors
- [ ] Context menu appears on right-click
- [ ] All predefined colors work
- [ ] Custom colors can be added (up to 10)
- [ ] Highlights persist when switching between edit/preview modes
- [ ] Highlights can be removed cleanly
- [ ] Partial selection detection works
- [ ] Settings are saved and restored on restart
- [ ] No console errors during normal operation
- [ ] Works on both desktop and mobile

## Troubleshooting

### Context menu doesn't appear
- Ensure plugin is enabled in settings
- Check console for errors (Ctrl+Shift+I)
- Try reloading Obsidian

### Highlights not visible
- Check if you're in reading mode (highlights show in both modes)
- Verify styles.css is loaded
- Check for conflicting CSS from themes

### Settings not saving
- Check file permissions on `.obsidian/plugins/` directory
- Look for errors in console
- Try manually creating the plugin directory

### Color validation failing
- Ensure color format is valid CSS
- Use hex (#RRGGBB), rgb(), or standard color names
- Avoid spaces in hex codes

## Performance Tips

- Avoid highlighting very large blocks of text (>1000 characters)
- Custom colors are loaded once at startup for efficiency
- Context menu items are generated dynamically to save memory

## Known Limitations

- Maximum 10 custom colors
- No nested highlights (by design)
- Highlights are stored as HTML in markdown files
- Color names limited to 20 characters