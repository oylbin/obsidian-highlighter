# Obsidian Highlighter Plugin Constitution

## Core Principles

### I. Obsidian API Compliance
All features must use official Obsidian API; No private API usage or internal Obsidian object manipulation; Follow Obsidian plugin guidelines and best practices

### II. User Data Safety
Never modify user vault files without explicit action; Preserve original content integrity; All highlighting/annotations must be non-destructive and reversible

### III. TypeScript-First Development
All code in TypeScript with strict mode enabled; Proper type definitions for Obsidian API usage; No any types without justification

### IV. Performance & Efficiency
Plugin must not block the UI thread; Lazy load features when possible; Minimize vault scanning and file operations

### V. Semantic Versioning
Follow MAJOR.MINOR.PATCH format; Document all breaking changes; Maintain compatibility with recent Obsidian versions

## Technical Requirements

- **Build System**: Use esbuild for compilation and bundling
- **Dependencies**: Minimize external dependencies; Bundle all required code
- **File Structure**: main.ts as entry point; styles.css for all styling; manifest.json with accurate metadata
- **Compatibility**: Support Obsidian desktop and mobile platforms

## Development Workflow

- Test in development vault before release
- Use Obsidian Developer Console for debugging
- Follow hot-reload workflow during development
- Validate manifest.json before each release

## Governance

Constitution defines all plugin development standards; Changes require testing in development vault; All code must pass TypeScript compilation without errors

**Version**: 1.0.0 | **Ratified**: 2025-01-18 | **Last Amended**: 2025-01-18