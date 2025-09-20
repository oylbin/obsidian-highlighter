/**
 * Main plugin class for Obsidian Text Highlighter
 */

import { Plugin, Editor, MarkdownView, Menu, Notice } from 'obsidian';
import { PluginSettings, ColorDefinition, HighlightMenuItem } from './types';
import { DEFAULT_SETTINGS, MENU_LABELS, ERROR_MESSAGES } from './constants';
import { HighlighterSettingTab, SettingsManager } from './settings';
import {
	toggleHighlight,
	processSelectionForHighlight,
	findMatchingColor,
	detectHighlight
} from './highlighter';

export default class HighlighterPlugin extends Plugin {
	settings: PluginSettings;
	settingsManager: SettingsManager;

	async onload(): Promise<void> {
		console.log('Loading Text Highlighter plugin');

		// Initialize settings manager
		this.settingsManager = new SettingsManager(this);

		// Load settings
		this.settings = await this.settingsManager.loadSettings();

		// Add settings tab
		this.addSettingTab(new HighlighterSettingTab(this.app, this));

		// Register context menu event
		this.registerContextMenuEvent();

		// Register commands for command palette (optional)
		this.registerCommands();

		console.log('Text Highlighter plugin loaded successfully');
	}

	onunload(): void {
		console.log('Unloading Text Highlighter plugin');
	}

	/**
	 * Save settings using the settings manager
	 */
	async saveSettings(): Promise<void> {
		await this.settingsManager.saveSettings(this.settings);
	}

	/**
	 * Register the context menu event for editor
	 */
	private registerContextMenuEvent(): void {
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor, view: MarkdownView) => {
				this.addContextMenuItems(menu, editor, view);
			})
		);
	}

	/**
	 * Add context menu items based on current selection
	 */
	private addContextMenuItems(menu: Menu, editor: Editor, view: MarkdownView): void {
		const selection = editor.getSelection();

		if (!selection) {
			return; // No selection, don't add menu items
		}

		const fullText = editor.getValue();
		const cursor = editor.getCursor();
		const selectionStart = editor.posToOffset(editor.getCursor('from'));
		const selectionEnd = editor.posToOffset(editor.getCursor('to'));

		// Process the selection to understand its state
		const processed = processSelectionForHighlight(fullText, selectionStart, selectionEnd);

		// Add highlight options for each available color
		const allColors = this.settingsManager.getAllColors();

		allColors.forEach(color => {
			menu.addItem(item => {
				const title = `${MENU_LABELS.highlightWith} ${color.name}`;
				item.setTitle(title)
					.setIcon('highlighter')
					.onClick(() => {
						this.applyHighlight(editor, selectionStart, selectionEnd, color);
					});
			});
		});
		
		if (processed.containsHighlight) {
			// Add "Erase highlight" option
			menu.addItem(item => {
				item.setTitle(MENU_LABELS.eraseHighlight)
					.setIcon('eraser')
					.onClick(() => {
						this.removeHighlight(editor, selectionStart, selectionEnd);
					});
			});
		} else {

		}
	}

	/**
	 * Apply highlight to the current selection
	 */
	private applyHighlight(
		editor: Editor,
		selectionStart: number,
		selectionEnd: number,
		color: ColorDefinition
	): void {
		try {
			const fullText = editor.getValue();
			const result = toggleHighlight(fullText, selectionStart, selectionEnd, color);

			if (result.action === 'applied') {
				// Update the editor content
				editor.setValue(result.newText);

				// Restore cursor position
				const newCursorPos = editor.offsetToPos(result.affectedRange.end);
				editor.setCursor(newCursorPos);

				// Show success notice
				new Notice(`Applied ${color.name} highlight`);
			}
		} catch (error) {
			console.error('Failed to apply highlight:', error);
			new Notice(ERROR_MESSAGES.highlightFailed);
		}
	}

	/**
	 * Remove highlight from the current selection
	 */
	private removeHighlight(
		editor: Editor,
		selectionStart: number,
		selectionEnd: number
	): void {
		try {
			const fullText = editor.getValue();
			const result = toggleHighlight(fullText, selectionStart, selectionEnd);

			if (result.action === 'removed') {
				// Update the editor content
				editor.setValue(result.newText);

				// Restore cursor position
				const newCursorPos = editor.offsetToPos(result.affectedRange.end);
				editor.setCursor(newCursorPos);

				// Show success notice
				new Notice('Highlight removed');
			}
		} catch (error) {
			console.error('Failed to remove highlight:', error);
			new Notice('Failed to remove highlight');
		}
	}

	/**
	 * Register commands for the command palette
	 */
	private registerCommands(): void {
		// Command to open settings
		this.addCommand({
			id: 'open-highlighter-settings',
			name: 'Open highlighter settings',
			callback: () => {
				// @ts-ignore - accessing private method
				this.app.setting.open();
				// @ts-ignore - accessing private method
				this.app.setting.openTabById('obsidian-highlighter');
			}
		});

		// Commands for each predefined color
		this.settings.predefinedColors.forEach((color, index) => {
			this.addCommand({
				id: `highlight-${color.name.toLowerCase().replace(/\s+/g, '-')}`,
				name: `Highlight with ${color.name}`,
				editorCallback: (editor: Editor, view: MarkdownView) => {
					const selection = editor.getSelection();
					if (!selection) {
						new Notice(ERROR_MESSAGES.selectionRequired);
						return;
					}

					const selectionStart = editor.posToOffset(editor.getCursor('from'));
					const selectionEnd = editor.posToOffset(editor.getCursor('to'));

					this.applyHighlight(editor, selectionStart, selectionEnd, color);
				}
			});
		});

		// Command to remove highlight
		this.addCommand({
			id: 'remove-highlight',
			name: 'Remove highlight',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (!selection) {
					new Notice(ERROR_MESSAGES.selectionRequired);
					return;
				}

				const selectionStart = editor.posToOffset(editor.getCursor('from'));
				const selectionEnd = editor.posToOffset(editor.getCursor('to'));

				this.removeHighlight(editor, selectionStart, selectionEnd);
			}
		});
	}

	/**
	 * Get the currently active editor
	 */
	private getActiveEditor(): Editor | null {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		return activeView?.editor || null;
	}

	/**
	 * Show error notification to user
	 */
	private showError(message: string): void {
		new Notice(message, 5000);
		console.error('Highlighter Plugin Error:', message);
	}

	/**
	 * Show success notification to user
	 */
	private showSuccess(message: string): void {
		new Notice(message, 3000);
	}

	/**
	 * Check if the plugin is ready to perform operations
	 */
	private isReady(): boolean {
		return !!this.settings && !!this.settingsManager;
	}

	/**
	 * Validate that the editor and selection are available
	 */
	private validateEditorSelection(editor: Editor): boolean {
		if (!editor) {
			this.showError('No active editor found');
			return false;
		}

		const selection = editor.getSelection();
		if (!selection) {
			this.showError(ERROR_MESSAGES.selectionRequired);
			return false;
		}

		return true;
	}
}