# Data Model: Text Highlighter for Obsidian

**Feature**: Text Highlighter Plugin
**Date**: 2025-09-18
**Version**: 1.0.0

## Overview
This document defines the data structures and relationships for the Obsidian text highlighter plugin. The model is designed to be simple, focusing on color definitions and plugin settings persistence.

## Entity Definitions

### 1. ColorDefinition

**Purpose**: Represents a single highlight color option available to users

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| name | string | Yes | Display name for the color | 1-20 characters, alphanumeric + spaces |
| value | string | Yes | CSS color value | Valid CSS color (hex, rgb, or name) |
| isCustom | boolean | Yes | Whether user-defined or predefined | - |

**Example**:
```typescript
{
  name: "Yellow",
  value: "#FFFF00",
  isCustom: false
}
```

### 2. PluginSettings

**Purpose**: Persisted configuration for the plugin

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| predefinedColors | ColorDefinition[] | Yes | Built-in color options | Exactly 3 items |
| customColors | ColorDefinition[] | Yes | User-defined colors | 0-10 items |
| maxCustomColors | number | Yes | Maximum custom colors allowed | Fixed at 10 |
| version | string | Yes | Settings schema version | Semantic version |

**Example**:
```typescript
{
  predefinedColors: [
    { name: "Red", value: "red", isCustom: false },
    { name: "Yellow", value: "yellow", isCustom: false },
    { name: "Light Green", value: "lightgreen", isCustom: false }
  ],
  customColors: [
    { name: "Ocean Blue", value: "#006994", isCustom: true }
  ],
  maxCustomColors: 10,
  version: "1.0.0"
}
```

### 3. HighlightedSegment (Runtime Only)

**Purpose**: Represents a text segment with highlighting (not persisted, derived from document content)

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| text | string | Yes | The highlighted text content | Non-empty |
| color | string | Yes | Applied background color | Valid CSS color |
| startOffset | number | Yes | Start position in document | >= 0 |
| endOffset | number | Yes | End position in document | > startOffset |

**Note**: This entity is computed at runtime by parsing HTML span tags in the document. It is never stored separately.

## Relationships

```mermaid
erDiagram
    PluginSettings ||--o{ ColorDefinition : contains
    PluginSettings {
        array predefinedColors
        array customColors
        number maxCustomColors
        string version
    }
    ColorDefinition {
        string name
        string value
        boolean isCustom
    }
    Document ||--o{ HighlightedSegment : "derives from"
    HighlightedSegment {
        string text
        string color
        number startOffset
        number endOffset
    }
```

## State Transitions

### ColorDefinition States
1. **Created**: User adds new custom color
2. **Updated**: User modifies existing custom color
3. **Deleted**: User removes custom color
4. **Applied**: Color used to highlight text
5. **Inactive**: Color exists but not currently applied

### HighlightedSegment States
1. **Created**: User applies highlight to text
2. **Detected**: Plugin finds existing highlight in document
3. **Expanded**: Selection expanded to full highlight
4. **Removed**: User erases highlight

## Validation Rules

### ColorDefinition Validation
- `name`: Required, 1-20 characters, no special characters except spaces
- `value`: Must be valid CSS color format
  - Hex: `#RGB` or `#RRGGBB`
  - RGB: `rgb(r, g, b)` or `rgba(r, g, b, a)`
  - Named: Valid CSS color name
- `isCustom`: Must be `false` for predefined, `true` for user-defined

### PluginSettings Validation
- `predefinedColors`: Exactly 3 items, all with `isCustom: false`
- `customColors`: 0-10 items, all with `isCustom: true`
- `maxCustomColors`: Must equal 10
- No duplicate color names across predefined and custom
- `version`: Valid semantic version string

### HighlightedSegment Validation
- `text`: Non-empty string
- `color`: Valid CSS color that exists in settings
- `startOffset`: Non-negative integer
- `endOffset`: Greater than startOffset
- No overlapping segments (enforced by business logic)

## Storage Format

Settings are stored in JSON format at:
```
.obsidian/plugins/obsidian-highlighter/data.json
```

Example file content:
```json
{
  "predefinedColors": [
    {"name": "Red", "value": "red", "isCustom": false},
    {"name": "Yellow", "value": "yellow", "isCustom": false},
    {"name": "Light Green", "value": "lightgreen", "isCustom": false}
  ],
  "customColors": [
    {"name": "Ocean Blue", "value": "#006994", "isCustom": true},
    {"name": "Sunset Orange", "value": "#ff6b35", "isCustom": true}
  ],
  "maxCustomColors": 10,
  "version": "1.0.0"
}
```

## Migration Strategy

For future schema changes:
1. Check `version` field on load
2. If older version, apply migrations in sequence
3. Update version field after successful migration
4. Backup original settings before migration

## Performance Considerations

1. **Settings Caching**: Load once on plugin start, keep in memory
2. **Highlight Detection**: Use compiled regex, cache results per document
3. **Menu Generation**: Build menu items dynamically, don't pre-generate
4. **Color Validation**: Validate on input, not on every use

## Security Considerations

1. **Color Sanitization**: Validate all color inputs to prevent CSS injection
2. **Name Sanitization**: Strip HTML/script tags from color names
3. **File Access**: Only write to designated plugin directory
4. **No Remote Data**: All data stored locally in vault