/**
 * Type definitions for Obsidian Text Highlighter Plugin
 */

/**
 * Represents a single highlight color option with background and optional foreground colors
 */
export interface ColorDefinition {
	/** Display name for the color (1-20 characters) */
	name: string;
	/** CSS background color value (required) */
	backgroundColor: string;
	/** CSS text color value (optional) */
	foregroundColor?: string | null;
	/** Whether this color is user-defined (true) or predefined (false) */
	isCustom: boolean;
}

/**
 * Plugin settings stored in Obsidian vault configuration
 */
export interface PluginSettings {
	/** Built-in color options (exactly 3 items) */
	predefinedColors: ColorDefinition[];
	/** User-defined colors (0-10 items) */
	customColors: ColorDefinition[];
	/** Maximum custom colors allowed (fixed at 10) */
	maxCustomColors: number;
	/** Settings schema version for migration */
	version: string;
}

/**
 * Runtime representation of a highlighted text segment (not persisted)
 */
export interface HighlightedSegment {
	/** The highlighted text content */
	text: string;
	/** Applied background color */
	backgroundColor: string;
	/** Applied text color (optional) */
	foregroundColor?: string | null;
	/** Start position in document */
	startOffset: number;
	/** End position in document */
	endOffset: number;
}

/**
 * Context menu item for highlighting actions
 */
export interface HighlightMenuItem {
	/** Display title for menu item */
	title: string;
	/** Action type */
	action: 'highlight' | 'erase';
	/** Color definition for highlight action (null for erase) */
	color?: ColorDefinition | null;
}

/**
 * Result of highlight detection operation
 */
export interface HighlightDetectionResult {
	/** Whether a highlight was found */
	found: boolean;
	/** The detected highlight segment */
	segment?: HighlightedSegment;
	/** Expanded selection range if partial highlight detected */
	expandedRange?: {
		start: number;
		end: number;
	};
}

/**
 * Validation result for color input
 */
export interface ColorValidationResult {
	/** Whether the color is valid */
	valid: boolean;
	/** Error message if invalid */
	error?: string;
}

/**
 * Options for applying highlights
 */
export interface HighlightOptions {
	/** Color definition to apply */
	color: ColorDefinition;
	/** Whether to replace existing highlight */
	replace?: boolean;
}