/**
 * Default settings and constants for Obsidian Text Highlighter Plugin
 */

import { ColorDefinition, PluginSettings } from './types';

/**
 * Default predefined colors as specified in requirements
 */
export const DEFAULT_PREDEFINED_COLORS: ColorDefinition[] = [
	{
		name: "Red",
		backgroundColor: "red",
		foregroundColor: "white",
		isCustom: false
	},
	{
		name: "Yellow",
		backgroundColor: "yellow",
		foregroundColor: "black",
		isCustom: false
	},
	{
		name: "Light Green",
		backgroundColor: "lightgreen",
		foregroundColor: null,
		isCustom: false
	}
];

/**
 * Maximum number of custom colors allowed
 */
export const MAX_CUSTOM_COLORS = 10;

/**
 * Current settings schema version
 */
export const SETTINGS_VERSION = "1.0.0";

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: PluginSettings = {
	predefinedColors: DEFAULT_PREDEFINED_COLORS,
	customColors: [],
	maxCustomColors: MAX_CUSTOM_COLORS,
	version: SETTINGS_VERSION
};

/**
 * Regular expression pattern for detecting highlights
 * Matches span tags with background-color and optional color styles
 */
export const HIGHLIGHT_PATTERN = /<span style="background-color:\s*([^;"]+)(?:;\s*color:\s*([^;"]+))?[^>]*>([^<]*)<\/span>/gi;

/**
 * CSS class names for plugin styling
 */
export const CSS_CLASSES = {
	settingsContainer: 'highlighter-settings',
	colorList: 'highlighter-color-list',
	colorItem: 'highlighter-color-item',
	colorPreview: 'highlighter-color-preview',
	addColorButton: 'highlighter-add-color',
	deleteButton: 'highlighter-delete-color',
	colorForm: 'highlighter-color-form',
	errorMessage: 'highlighter-error'
} as const;

/**
 * Validation constraints
 */
export const VALIDATION = {
	colorNameMinLength: 1,
	colorNameMaxLength: 20,
	colorNamePattern: /^[a-zA-Z0-9\s]+$/,
	cssColorPattern: /^(#[0-9a-fA-F]{3,6}|rgb\(.+\)|rgba\(.+\)|[a-z]+)$/
} as const;

/**
 * Menu item titles and labels
 */
export const MENU_LABELS = {
	highlightWith: "Highlight with",
	eraseHighlight: "Erase highlight",
	addColor: "Add Color",
	deleteColor: "Delete",
	backgroundColorLabel: "Background Color",
	foregroundColorLabel: "Foreground Color (optional)",
	colorNameLabel: "Color Name"
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
	invalidColorName: "Color name must be 1-20 characters and contain only letters, numbers, and spaces",
	invalidColorValue: "Please enter a valid CSS color (hex, rgb, or color name)",
	duplicateColorName: "A color with this name already exists",
	maxColorsReached: `Maximum ${MAX_CUSTOM_COLORS} custom colors allowed`,
	colorNotFound: "Color not found",
	selectionRequired: "Please select text to highlight",
	highlightFailed: "Failed to apply highlight"
} as const;