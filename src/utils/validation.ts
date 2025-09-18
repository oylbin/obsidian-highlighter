/**
 * Color validation utilities for Obsidian Text Highlighter Plugin
 */

import { ColorDefinition, ColorValidationResult } from '../types';
import { VALIDATION, ERROR_MESSAGES } from '../constants';

/**
 * Validates if a string is a valid CSS color
 * Uses browser's built-in color parsing for accurate validation
 */
export function isValidColor(color: string): boolean {
	if (!color || typeof color !== 'string') {
		return false;
	}

	// Create a temporary element to test color validity
	const style = new Option().style;
	style.color = color.trim();
	return style.color !== '';
}

/**
 * Validates a color name according to plugin constraints
 */
export function validateColorName(name: string): ColorValidationResult {
	if (!name || typeof name !== 'string') {
		return {
			valid: false,
			error: ERROR_MESSAGES.invalidColorName
		};
	}

	const trimmedName = name.trim();

	if (trimmedName.length < VALIDATION.colorNameMinLength ||
		trimmedName.length > VALIDATION.colorNameMaxLength) {
		return {
			valid: false,
			error: ERROR_MESSAGES.invalidColorName
		};
	}

	if (!VALIDATION.colorNamePattern.test(trimmedName)) {
		return {
			valid: false,
			error: ERROR_MESSAGES.invalidColorName
		};
	}

	return { valid: true };
}

/**
 * Validates a CSS color value
 */
export function validateColorValue(color: string): ColorValidationResult {
	if (!color || typeof color !== 'string') {
		return {
			valid: false,
			error: ERROR_MESSAGES.invalidColorValue
		};
	}

	const trimmedColor = color.trim();

	if (!isValidColor(trimmedColor)) {
		return {
			valid: false,
			error: ERROR_MESSAGES.invalidColorValue
		};
	}

	return { valid: true };
}

/**
 * Validates a complete color definition
 */
export function validateColorDefinition(color: Partial<ColorDefinition>): ColorValidationResult {
	// Validate name
	if (!color.name) {
		return {
			valid: false,
			error: "Color name is required"
		};
	}

	const nameValidation = validateColorName(color.name);
	if (!nameValidation.valid) {
		return nameValidation;
	}

	// Validate background color
	if (!color.backgroundColor) {
		return {
			valid: false,
			error: "Background color is required"
		};
	}

	const backgroundValidation = validateColorValue(color.backgroundColor);
	if (!backgroundValidation.valid) {
		return backgroundValidation;
	}

	// Validate foreground color if provided
	if (color.foregroundColor) {
		const foregroundValidation = validateColorValue(color.foregroundColor);
		if (!foregroundValidation.valid) {
			return foregroundValidation;
		}
	}

	return { valid: true };
}

/**
 * Checks if a color name already exists in the provided color arrays
 */
export function isColorNameDuplicate(
	name: string,
	predefinedColors: ColorDefinition[],
	customColors: ColorDefinition[],
	excludeIndex?: number
): boolean {
	const trimmedName = name.trim().toLowerCase();

	// Check predefined colors
	const predefinedMatch = predefinedColors.some(color =>
		color.name.toLowerCase() === trimmedName
	);

	if (predefinedMatch) {
		return true;
	}

	// Check custom colors (excluding the item being edited)
	const customMatch = customColors.some((color, index) =>
		index !== excludeIndex && color.name.toLowerCase() === trimmedName
	);

	return customMatch;
}

/**
 * Validates adding a new custom color
 */
export function validateNewCustomColor(
	color: Partial<ColorDefinition>,
	predefinedColors: ColorDefinition[],
	customColors: ColorDefinition[]
): ColorValidationResult {
	// Basic validation
	const basicValidation = validateColorDefinition(color);
	if (!basicValidation.valid) {
		return basicValidation;
	}

	// Check for duplicates
	if (color.name && isColorNameDuplicate(color.name, predefinedColors, customColors)) {
		return {
			valid: false,
			error: ERROR_MESSAGES.duplicateColorName
		};
	}

	// Check custom color limit
	if (customColors.length >= 10) {
		return {
			valid: false,
			error: ERROR_MESSAGES.maxColorsReached
		};
	}

	return { valid: true };
}

/**
 * Validates editing an existing custom color
 */
export function validateEditCustomColor(
	color: Partial<ColorDefinition>,
	predefinedColors: ColorDefinition[],
	customColors: ColorDefinition[],
	editIndex: number
): ColorValidationResult {
	// Basic validation
	const basicValidation = validateColorDefinition(color);
	if (!basicValidation.valid) {
		return basicValidation;
	}

	// Check for duplicates (excluding the item being edited)
	if (color.name && isColorNameDuplicate(color.name, predefinedColors, customColors, editIndex)) {
		return {
			valid: false,
			error: ERROR_MESSAGES.duplicateColorName
		};
	}

	return { valid: true };
}

/**
 * Sanitizes a color name by trimming whitespace
 */
export function sanitizeColorName(name: string): string {
	return name.trim();
}

/**
 * Sanitizes a color value by trimming whitespace and converting to lowercase for standard colors
 */
export function sanitizeColorValue(color: string): string {
	const trimmed = color.trim();

	// Convert standard color names to lowercase
	if (!trimmed.startsWith('#') && !trimmed.startsWith('rgb')) {
		return trimmed.toLowerCase();
	}

	return trimmed;
}