# Research Document: Text Highlighter for Obsidian

**Feature**: Text Highlighter Plugin
**Date**: 2025-09-18
**Status**: Complete

## Executive Summary
This document consolidates research findings for implementing a text highlighting plugin for Obsidian. All technical decisions have been made based on Obsidian API documentation and best practices for plugin development.

## Research Findings

### 1. Obsidian Context Menu Integration

**Decision**: Use `Editor.registerEvent()` with `'editor-menu'` event
**Rationale**:
- Official Obsidian API method for adding context menu items
- Provides access to selected text and editor instance
- Works consistently across desktop and mobile platforms

**Alternatives Considered**:
- Custom DOM manipulation: Rejected - violates Obsidian API compliance
- Command palette only: Rejected - doesn't meet right-click requirement
- Toolbar buttons: Rejected - less intuitive than context menu

**Implementation Pattern**:
```typescript
this.registerEvent(
  this.app.workspace.on('editor-menu', (menu, editor, view) => {
    // Add menu items based on selected text
  })
);
```

### 2. HTML Span Tag Manipulation

**Decision**: Use Obsidian's `Editor.replaceSelection()` API
**Rationale**:
- Preserves undo/redo functionality
- Maintains editor state consistency
- Works with Obsidian's markdown processor

**Alternatives Considered**:
- Direct DOM manipulation: Rejected - breaks on editor refresh
- Custom CodeMirror extensions: Rejected - too complex, may break with updates
- Post-processing markdown: Rejected - doesn't show in edit mode

**HTML Format Decision**:
```html
<!-- With both background and foreground colors -->
<span style="background-color: yellow; color: black;">highlighted text</span>

<!-- With background color only -->
<span style="background-color: lightblue;">highlighted text</span>
```

**Foreground Color Addition**:
- Users can optionally specify text color along with background
- If foreground color not specified, browser default is used
- Improves readability for certain color combinations

### 3. Settings Management

**Decision**: Use `PluginSettingTab` with Obsidian's settings API
**Rationale**:
- Standard Obsidian pattern for plugin configuration
- Automatic persistence to vault's `.obsidian/plugins/` directory
- Built-in UI components for color selection

**Alternatives Considered**:
- Custom modal: Rejected - inconsistent with other plugins
- File-based config: Rejected - harder for users to manage
- In-document settings: Rejected - clutters user content

**Settings Structure**:
```typescript
interface PluginSettings {
  predefinedColors: ColorDefinition[];
  customColors: ColorDefinition[];
  maxCustomColors: number;
}

interface ColorDefinition {
  name: string;
  backgroundColor: string;
  foregroundColor?: string;
  isCustom: boolean;
}
```

### 4. Color Input Validation

**Decision**: Support hex codes, RGB values, and CSS color names
**Rationale**:
- Covers all common color formats users expect
- CSS spec compliance ensures browser compatibility
- Easy validation using browser's built-in color parsing

**Alternatives Considered**:
- Hex only: Rejected - too restrictive
- Color picker only: Rejected - some users prefer text input
- No validation: Rejected - could break rendering

**Validation Approach**:
```typescript
function isValidColor(color: string): boolean {
  const style = new Option().style;
  style.color = color;
  return style.color !== '';
}
```

### 5. Highlight Detection and Removal

**Decision**: Use regex pattern matching to find existing highlights
**Rationale**:
- Fast and reliable for finding span tags
- Works with partial selections
- Can extract color information for display

**Alternatives Considered**:
- DOM traversal: Rejected - only works in preview mode
- Markdown AST parsing: Rejected - overkill for this use case
- Manual string search: Rejected - error-prone with nested tags

**Detection Pattern**:
```typescript
// Updated pattern to handle optional foreground color
const highlightPattern = /<span style="background-color:\s*([^;"]+)(?:;\s*color:\s*([^;"]+))?[^>]*>([^<]*)<\/span>/gi;
```

### 6. Edge Case Handling

**Decision**: Implement smart selection expansion for partial highlights
**Rationale**:
- Better UX - users don't need precise selection
- Prevents broken HTML from partial tag selection
- Consistent with spec requirements

**Implementation Strategy**:
- Detect if selection contains partial span tags
- Expand selection to encompass complete highlight
- Apply operation to entire highlight block

### 7. Build System Configuration

**Decision**: Use esbuild with Obsidian plugin template
**Rationale**:
- Fastest TypeScript compilation
- Minimal configuration required
- Official Obsidian plugin template uses it

**Alternatives Considered**:
- Webpack: Rejected - slower, more complex config
- Rollup: Rejected - less TypeScript-focused
- tsc only: Rejected - no bundling support

## Technical Constraints Resolved

All NEEDS CLARIFICATION items from the specification have been addressed:

1. **Predefined colors**: red, yellow, lightgreen (confirmed in spec)
2. **Custom color limit**: Maximum 10 custom colors (confirmed in spec)
3. **Color format**: Hex, RGB, or CSS color names (researched above)
4. **Custom color management**: Full CRUD operations in settings (researched above)

## Performance Considerations

1. **Lazy Loading**: Menu items only created when context menu opens
2. **Caching**: Settings cached in memory, only read from disk on startup
3. **Regex Compilation**: Compile patterns once and reuse
4. **DOM Operations**: Minimize by using Obsidian's editor API

## Mobile Compatibility Notes

1. Context menu triggered by long-press on mobile
2. Color input uses native color picker where available
3. Settings UI adapts to smaller screens automatically
4. All features work on both platforms without modification

## Security Considerations

1. **Input Sanitization**: All color values validated before use
2. **No Script Injection**: Only style attributes, no onclick or javascript:
3. **Preserved Content**: Original text never modified, only wrapped
4. **Reversible Operations**: All highlights can be cleanly removed

## Conclusion

All technical decisions have been made based on Obsidian best practices and API constraints. The implementation approach uses only official APIs, ensures data safety, and provides a consistent user experience across platforms. No unresolved technical questions remain.