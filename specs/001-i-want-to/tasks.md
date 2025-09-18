# Tasks: Text Highlighter for Obsidian

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: TypeScript, Obsidian API, esbuild
   → Structure: Obsidian plugin with src/ directory
2. Load optional design documents:
   → data-model.md: ColorDefinition, PluginSettings, HighlightedSegment
   → contracts/plugin-api.yaml: Context menu, highlight ops, settings
   → research.md: Technical decisions for Obsidian API usage
3. Generate tasks by category:
   → Setup: Plugin structure, TypeScript config, build system
   → Tests: Manual test scenarios from quickstart.md
   → Core: Types, settings, highlighter logic, plugin main
   → Integration: Context menu, settings UI, editor integration
   → Polish: CSS styles, validation, edge cases
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Core types before implementation
   → Services before UI integration
5. Number tasks sequentially (T001, T002...)
6. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Plugin structure**: `src/` for TypeScript source
- **Build output**: `main.js`, `styles.css`, `manifest.json` at root
- **Tests**: Manual testing via Obsidian Developer Console

## Phase 3.1: Setup
- [x] T001 Initialize Obsidian plugin structure with package.json and dependencies
- [x] T002 [P] Create TypeScript configuration in tsconfig.json with strict mode
- [x] T003 [P] Configure esbuild in esbuild.config.mjs for plugin bundling
- [x] T004 [P] Create plugin manifest in manifest.json with metadata

## Phase 3.2: Core Types & Interfaces
**CRITICAL: Define types first for TypeScript strict mode**
- [x] T005 Create type definitions in src/types.ts for ColorDefinition, PluginSettings, HighlightedSegment
- [x] T006 [P] Create default plugin settings constants in src/constants.ts

## Phase 3.3: Core Implementation
- [x] T007 Implement settings management in src/settings.ts with PluginSettingTab class
- [x] T008 Implement highlight logic in src/highlighter.ts with apply/remove/detect functions
- [x] T009 Create color validation utilities in src/utils/validation.ts
- [x] T010 Implement main plugin class in src/main.ts with onload/onunload

## Phase 3.4: UI Integration
- [x] T011 Add context menu integration in src/main.ts for editor-menu event
- [x] T012 Implement settings UI components in src/settings.ts with color inputs
- [x] T013 Add custom color management in src/settings.ts with add/remove/edit
- [x] T014 [P] Create plugin styles in styles.css for settings UI

## Phase 3.5: Edge Cases & Polish
- [x] T015 Handle partial highlight selection in src/highlighter.ts
- [x] T016 Prevent nested highlights in src/highlighter.ts validation
- [x] T017 Add color limit enforcement (max 10) in src/settings.ts
- [x] T018 Implement settings migration in src/settings.ts for future updates
- [x] T019 Add error handling and user notifications in src/main.ts

## Phase 3.6: Build & Validation
- [x] T020 Build plugin with npm run build and verify output files
- [ ] T021 Test Scenario 1: Basic highlighting with predefined colors
- [ ] T022 Test Scenario 2: Custom color with foreground and background
- [ ] T023 Test Scenario 3: Partial selection and highlight removal
- [ ] T024 Test Scenario 4: Settings persistence across restarts
- [ ] T025 Test mobile compatibility with long-press context menu

## Dependencies
- Types (T005-T006) before all implementation
- T005 blocks T007, T008, T010
- T007 blocks T012, T013
- T008 blocks T011, T015, T016
- T010 blocks T011, T019
- All implementation before build (T020)
- T020 blocks all testing (T021-T025)

## Parallel Example
```bash
# Launch T002-T004 together (independent config files):
Task: "Create TypeScript configuration in tsconfig.json"
Task: "Configure esbuild in esbuild.config.mjs"
Task: "Create plugin manifest in manifest.json"

# Launch T005-T006 together (independent type files):
Task: "Create type definitions in src/types.ts"
Task: "Create default settings in src/constants.ts"
```

## Specific Implementation Details

### T005: Type Definitions (src/types.ts)
```typescript
export interface ColorDefinition {
  name: string;
  backgroundColor: string;
  foregroundColor?: string | null;
  isCustom: boolean;
}

export interface PluginSettings {
  predefinedColors: ColorDefinition[];
  customColors: ColorDefinition[];
  maxCustomColors: number;
  version: string;
}
```

### T008: Highlighter Functions (src/highlighter.ts)
- `applyHighlight(text: string, color: ColorDefinition): string`
- `removeHighlight(html: string): string`
- `detectHighlight(text: string): HighlightedSegment | null`
- `expandSelection(text: string, start: number, end: number): [number, number]`

### T011: Context Menu Items
- "Highlight with Red" (if not highlighted)
- "Highlight with Yellow" (if not highlighted)
- "Highlight with Light Green" (if not highlighted)
- Dynamic custom color items from settings
- "Erase highlight" (if selection contains highlight)

### T012: Settings UI Elements
- Color list display with name and color preview
- "Add Color" button with modal/inline form
- Background color input (required)
- Foreground color input (optional)
- Delete button for each custom color
- Validation messages for invalid colors

## Notes
- No automated tests (Obsidian plugins tested manually)
- Build output must include main.js, styles.css, manifest.json
- Use Obsidian Developer Console (Ctrl+Shift+I) for debugging
- Test in both edit and reading modes
- Verify mobile compatibility with touch interactions

## Validation Checklist
*GATE: Verify before marking complete*

- [x] All entities from data-model have implementation tasks
- [x] All API operations from contracts have corresponding functions
- [x] All test scenarios from quickstart.md have test tasks
- [x] Parallel tasks modify different files
- [x] Each task specifies exact file path
- [x] Type definitions come before implementation