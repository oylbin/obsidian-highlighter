/**
 * Core highlighting logic for Obsidian Text Highlighter Plugin
 */

import { ColorDefinition, HighlightedSegment, HighlightDetectionResult, HighlightOptions } from './types';
import { HIGHLIGHT_PATTERN } from './constants';

/**
 * Applies highlight markup to text using HTML span tags
 */
export function applyHighlight(text: string, options: HighlightOptions): string {
	const { color } = options;

	// Build style attribute
	let style = `background-color: ${color.backgroundColor};`;
	if (color.foregroundColor) {
		style += ` color: ${color.foregroundColor};`;
	}

	return `<span style="${style}">${text}</span>`;
}

/**
 * Removes highlight markup from HTML, returning plain text
 */
export function removeHighlight(html: string): string {
	// Replace span tags with their inner text content
	return html.replace(HIGHLIGHT_PATTERN, '$3');
}

/**
 * Detects if text contains highlight markup and extracts information
 */
export function detectHighlight(text: string): HighlightDetectionResult {
	const match = HIGHLIGHT_PATTERN.exec(text);

	if (!match) {
		return { found: false };
	}

	const [fullMatch, backgroundColor, foregroundColor, innerText] = match;
	const startOffset = match.index || 0;
	const endOffset = startOffset + fullMatch.length;

	const segment: HighlightedSegment = {
		text: innerText,
		backgroundColor,
		foregroundColor: foregroundColor || null,
		startOffset,
		endOffset
	};

	return {
		found: true,
		segment,
		expandedRange: {
			start: startOffset,
			end: endOffset
		}
	};
}

/**
 * Expands selection to encompass complete highlight if partial selection detected
 */
export function expandSelection(text: string, start: number, end: number): [number, number] {
	// Find all highlights in the text
	const highlights: Array<{ start: number; end: number }> = [];
	let match;

	// Reset regex lastIndex to ensure we find all matches
	HIGHLIGHT_PATTERN.lastIndex = 0;

	while ((match = HIGHLIGHT_PATTERN.exec(text)) !== null) {
		highlights.push({
			start: match.index || 0,
			end: (match.index || 0) + match[0].length
		});
	}

	// Check if selection overlaps with any highlight
	for (const highlight of highlights) {
		const selectionOverlaps = (
			(start >= highlight.start && start < highlight.end) ||
			(end > highlight.start && end <= highlight.end) ||
			(start <= highlight.start && end >= highlight.end)
		);

		if (selectionOverlaps) {
			// Expand selection to encompass the entire highlight
			return [
				Math.min(start, highlight.start),
				Math.max(end, highlight.end)
			];
		}
	}

	// No overlap found, return original selection
	return [start, end];
}

/**
 * Checks if selection is partially within a highlight
 */
export function isPartialHighlightSelection(text: string, start: number, end: number): boolean {
	const [expandedStart, expandedEnd] = expandSelection(text, start, end);
	return expandedStart !== start || expandedEnd !== end;
}

/**
 * Extracts the text content from a selection, handling highlights appropriately
 */
export function extractTextFromSelection(text: string, start: number, end: number): string {
	const selectedText = text.substring(start, end);

	// If the selection contains highlight markup, extract just the inner text
	if (selectedText.includes('<span style="background-color:')) {
		return removeHighlight(selectedText);
	}

	return selectedText;
}

/**
 * Validates that highlights don't nest by checking for existing spans in selection
 */
export function validateNoNestedHighlights(text: string): boolean {
	// Check if text already contains highlight markup
	return !text.includes('<span style="background-color:');
}

/**
 * Finds the color definition that matches a highlight
 */
export function findMatchingColor(
	segment: HighlightedSegment,
	predefinedColors: ColorDefinition[],
	customColors: ColorDefinition[]
): ColorDefinition | null {
	const allColors = [...predefinedColors, ...customColors];

	return allColors.find(color => {
		const backgroundMatches = color.backgroundColor === segment.backgroundColor;
		const foregroundMatches = color.foregroundColor === segment.foregroundColor;
		return backgroundMatches && foregroundMatches;
	}) || null;
}

/**
 * Processes text selection for highlighting operation
 */
export function processSelectionForHighlight(
	fullText: string,
	selectionStart: number,
	selectionEnd: number
): {
	expandedStart: number;
	expandedEnd: number;
	selectedText: string;
	isPartial: boolean;
	containsHighlight: boolean;
} {
	// Expand selection if it's partial
	const [expandedStart, expandedEnd] = expandSelection(fullText, selectionStart, selectionEnd);
	const isPartial = expandedStart !== selectionStart || expandedEnd !== selectionEnd;

	// Get the actual selected text
	const selectedText = fullText.substring(expandedStart, expandedEnd);

	// Check if selection contains existing highlight
	const containsHighlight = selectedText.includes('<span style="background-color:');

	return {
		expandedStart,
		expandedEnd,
		selectedText,
		isPartial,
		containsHighlight
	};
}

/**
 * Applies or removes highlight based on current selection state
 */
export function toggleHighlight(
	fullText: string,
	selectionStart: number,
	selectionEnd: number,
	color?: ColorDefinition
): {
	newText: string;
	action: 'applied' | 'removed';
	affectedRange: { start: number; end: number };
} {
	const processed = processSelectionForHighlight(fullText, selectionStart, selectionEnd);

	if (processed.containsHighlight) {
		// Remove existing highlight
		const beforeSelection = fullText.substring(0, processed.expandedStart);
		const afterSelection = fullText.substring(processed.expandedEnd);
		const plainText = removeHighlight(processed.selectedText);

		const newText = beforeSelection + plainText + afterSelection;

		return {
			newText,
			action: 'removed',
			affectedRange: {
				start: processed.expandedStart,
				end: processed.expandedStart + plainText.length
			}
		};
	} else if (color) {
		// Apply new highlight
		const beforeSelection = fullText.substring(0, processed.expandedStart);
		const afterSelection = fullText.substring(processed.expandedEnd);

		// Make sure we're highlighting plain text
		const plainText = validateNoNestedHighlights(processed.selectedText)
			? processed.selectedText
			: removeHighlight(processed.selectedText);

		const highlightedText = applyHighlight(plainText, { color });
		const newText = beforeSelection + highlightedText + afterSelection;

		return {
			newText,
			action: 'applied',
			affectedRange: {
				start: processed.expandedStart,
				end: processed.expandedStart + highlightedText.length
			}
		};
	} else {
		// No color provided and no existing highlight
		throw new Error('No color provided for highlighting');
	}
}