/**
 * Main plugin class for Obsidian Text Highlighter
 */

import { Plugin, Editor, MarkdownView, MarkdownFileInfo, Menu, Notice } from 'obsidian';
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
	settings!: PluginSettings;
	settingsManager!: SettingsManager;

	override async onload(): Promise<void> {
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

	override onunload(): void {
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
			this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				this.addContextMenuItems(menu, editor, view);
			})
		);
	}

	/**
	 * Add context menu items based on current selection
	 */
	private addContextMenuItems(menu: Menu, editor: Editor, view: MarkdownView | MarkdownFileInfo): void {
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

				// Select the affected text
				const startPos = editor.offsetToPos(result.affectedRange.start);
				const endPos = editor.offsetToPos(result.affectedRange.end);
				editor.setSelection(startPos, endPos);

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

				// Select the affected text
				const startPos = editor.offsetToPos(result.affectedRange.start);
				const endPos = editor.offsetToPos(result.affectedRange.end);
				editor.setSelection(startPos, endPos);

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

		// Unified entry: register a command for every color (predefined + custom)
		this.settingsManager.getAllColors().forEach(color => {
			this.registerHighlightCommand(color);
		});

		// Command to remove highlight
		this.addCommand({
			id: 'remove-highlight',
			name: 'Remove highlight',
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
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
	 * Build the (un-prefixed) command id for a given color.
	 * The format must stay stable across plugin reloads so that hotkey
	 * bindings stored in Obsidian's hotkeys.json keep working when a
	 * custom color is removed and re-added with the same name.
	 */
	private getColorCommandId(color: ColorDefinition): string {
		return `highlight-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
	}

	/**
	 * Register a single highlight command for the given color.
	 * Called from onload (for all existing colors) and from the settings
	 * tab whenever a new custom color is added at runtime.
	 */
	registerHighlightCommand(color: ColorDefinition): void {
		this.addCommand({
			id: this.getColorCommandId(color),
			name: `Highlight with ${color.name}`,
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
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
	}

	/**
	 * Unregister the highlight command for the given color.
	 * Uses Obsidian's internal app.commands.removeCommand API which is
	 * not part of the public typings but is widely used by community
	 * plugins. The defensive checks ensure that an API change here can
	 * only leave a "zombie" command (cleared on next reload), never crash.
	 */
	unregisterHighlightCommand(color: ColorDefinition): void {
		const fullId = `${this.manifest.id}:${this.getColorCommandId(color)}`;
		const commands = (this.app as any).commands;
		if (commands && typeof commands.removeCommand === 'function') {
			try {
				commands.removeCommand(fullId);
			} catch (error) {
				console.warn(`Failed to unregister command ${fullId}:`, error);
			}
		}
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