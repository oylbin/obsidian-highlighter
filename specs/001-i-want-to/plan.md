# Implementation Plan: Text Highlighter for Obsidian

**Branch**: `001-i-want-to` | **Date**: 2025-09-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-i-want-to/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Obsidian plugin that allows users to highlight text with colored backgrounds using HTML span tags with inline styles. Users can right-click selected text to apply predefined colors (red, yellow, lightgreen) or custom colors from settings, with a maximum of 10 custom colors. The implementation will use HTML `<span>` tags with inline `style` attributes to specify `background-color` around selected text, ensuring all highlighting is reversible and non-destructive to the original content.

## Technical Context
**Language/Version**: TypeScript (strict mode)
**Primary Dependencies**: Obsidian API (official plugin API only)
**Storage**: Plugin settings stored in Obsidian vault configuration
**Testing**: Obsidian Developer Console for debugging
**Target Platform**: Obsidian desktop and mobile platforms
**Project Type**: single (Obsidian plugin)
**Performance Goals**: Instant UI response, no blocking operations
**Constraints**: Must not modify vault files destructively, reversible operations only
**Scale/Scope**: Single plugin with settings UI, context menu integration, and highlight rendering

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Obsidian API Compliance**: Will use only official Obsidian API for all features
- [x] **User Data Safety**: HTML markup is reversible, original content preserved
- [x] **TypeScript-First**: All code in TypeScript with strict mode
- [x] **Performance**: Non-blocking operations, lazy loading where applicable
- [x] **Semantic Versioning**: Will follow MAJOR.MINOR.PATCH format
- [x] **Build System**: Will use esbuild for compilation
- [x] **Dependencies**: Minimal external dependencies
- [x] **File Structure**: main.ts entry, styles.css for styling, manifest.json
- [x] **Compatibility**: Support both desktop and mobile platforms

## Project Structure

### Documentation (this feature)
```
specs/001-i-want-to/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Obsidian Plugin Structure
obsidian-highlighter/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── settings.ts          # Settings management
│   ├── highlighter.ts       # Core highlighting logic
│   └── types.ts            # TypeScript type definitions
├── styles.css              # Plugin styles
├── manifest.json           # Plugin manifest
├── package.json
├── tsconfig.json
└── esbuild.config.mjs      # Build configuration
```

**Structure Decision**: Obsidian Plugin Structure (specific to Obsidian plugin development)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - No NEEDS CLARIFICATION items remain (all resolved in spec)
   - Research Obsidian API best practices
   - Research context menu integration patterns
   - Research settings panel implementation

2. **Generate and dispatch research agents**:
   ```
   Task: "Research Obsidian API context menu integration patterns"
   Task: "Find best practices for Obsidian plugin settings management"
   Task: "Research HTML span tag manipulation in Obsidian editor"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical decisions documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - HighlightColor entity with color value and display name
   - PluginSettings entity with predefined and custom colors
   - HighlightedSegment entity (runtime only, not persisted)

2. **Generate API contracts** from functional requirements:
   - Context menu actions contract
   - Settings management contract
   - Highlight application/removal contract

3. **Generate contract tests** from contracts:
   - Test context menu item registration
   - Test settings persistence
   - Test highlight application/removal

4. **Extract test scenarios** from user stories:
   - Apply highlight to selected text
   - Remove highlight from text
   - Add custom color in settings
   - Handle edge cases (partial highlights, nested attempts)

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude` for Claude Code
   - Add Obsidian plugin development context
   - Update recent changes

**Output**: data-model.md, /contracts/*, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Setup tasks: Initialize plugin structure, configure build system
- Core implementation: Settings manager, highlighter service, context menu
- Integration tasks: Connect components, handle edge cases
- Validation tasks: Test scenarios from quickstart.md

**Ordering Strategy**:
- Setup and configuration first
- Core services before UI components
- Integration after individual components
- Testing and validation last

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations - all constitutional requirements are met.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*