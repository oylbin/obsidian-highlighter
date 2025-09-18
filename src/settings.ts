/**
 * Settings management for Obsidian Text Highlighter Plugin
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import { ColorDefinition, PluginSettings } from './types';
import { DEFAULT_SETTINGS, CSS_CLASSES, MENU_LABELS, ERROR_MESSAGES } from './constants';
import {
	validateNewCustomColor,
	validateEditCustomColor,
	sanitizeColorName,
	sanitizeColorValue
} from './utils/validation';
import HighlighterPlugin from './main';

/**
 * Settings tab for the highlighter plugin
 */
export class HighlighterSettingTab extends PluginSettingTab {
	plugin: HighlighterPlugin;

	constructor(app: App, plugin: HighlighterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Text Highlighter Settings' });

		// Predefined colors section
		this.createPredefinedColorsSection(containerEl);

		// Custom colors section
		this.createCustomColorsSection(containerEl);

		// Add new color section
		this.createAddColorSection(containerEl);
	}

	private createPredefinedColorsSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Predefined Colors' });
		containerEl.createEl('p', {
			text: 'These colors are built into the plugin and cannot be modified.',
			cls: 'setting-item-description'
		});

		const predefinedContainer = containerEl.createDiv({ cls: CSS_CLASSES.colorList });

		this.plugin.settings.predefinedColors.forEach(color => {
			this.createColorDisplay(predefinedContainer, color, false);
		});
	}

	private createCustomColorsSection(containerEl: HTMLElement): void {
		const customSection = containerEl.createDiv();
		customSection.createEl('h3', { text: 'Custom Colors' });

		const description = customSection.createEl('p', {
			cls: 'setting-item-description'
		});
		description.innerHTML = `You can add up to ${this.plugin.settings.maxCustomColors} custom colors. ` +
			'Each color can have a background color (required) and an optional text color.';

		const customContainer = customSection.createDiv({ cls: CSS_CLASSES.colorList });

		if (this.plugin.settings.customColors.length === 0) {
			customContainer.createEl('p', {
				text: 'No custom colors added yet.',
				cls: 'setting-item-description'
			});
		} else {
			this.plugin.settings.customColors.forEach((color, index) => {
				this.createColorDisplay(customContainer, color, true, index);
			});
		}
	}

	private createColorDisplay(
		container: HTMLElement,
		color: ColorDefinition,
		isDeletable: boolean,
		index?: number
	): void {
		const colorItem = container.createDiv({ cls: CSS_CLASSES.colorItem });

		// Color preview
		const preview = colorItem.createDiv({ cls: CSS_CLASSES.colorPreview });
		preview.style.backgroundColor = color.backgroundColor;
		if (color.foregroundColor) {
			preview.style.color = color.foregroundColor;
		}
		preview.textContent = 'Aa';

		// Color info
		const info = colorItem.createDiv();
		info.createEl('strong', { text: color.name });

		const details = info.createDiv({ cls: 'setting-item-description' });
		details.innerHTML = `Background: <code>${color.backgroundColor}</code>`;
		if (color.foregroundColor) {
			details.innerHTML += ` | Text: <code>${color.foregroundColor}</code>`;
		}

		// Delete button for custom colors
		if (isDeletable && index !== undefined) {
			const deleteButton = colorItem.createEl('button', {
				text: MENU_LABELS.deleteColor,
				cls: CSS_CLASSES.deleteButton
			});

			deleteButton.onclick = () => {
				this.deleteCustomColor(index);
			};
		}
	}

	private createAddColorSection(containerEl: HTMLElement): void {
		containerEl.createEl('h3', { text: 'Add New Color' });

		// Check if we've reached the limit
		if (this.plugin.settings.customColors.length >= this.plugin.settings.maxCustomColors) {
			containerEl.createEl('p', {
				text: ERROR_MESSAGES.maxColorsReached,
				cls: CSS_CLASSES.errorMessage
			});
			return;
		}

		const formContainer = containerEl.createDiv({ cls: CSS_CLASSES.colorForm });

		// Color name input
		let colorName = '';
		new Setting(formContainer)
			.setName(MENU_LABELS.colorNameLabel)
			.setDesc('Enter a name for your custom color (1-20 characters)')
			.addText(text => {
				text.setPlaceholder('e.g., Ocean Blue')
					.onChange(value => {
						colorName = sanitizeColorName(value);
					});
			});

		// Background color input
		let backgroundColor = '';
		new Setting(formContainer)
			.setName(MENU_LABELS.backgroundColorLabel)
			.setDesc('CSS color value (hex, rgb, or color name)')
			.addText(text => {
				text.setPlaceholder('e.g., #006994, rgb(0, 105, 148), steelblue')
					.onChange(value => {
						backgroundColor = sanitizeColorValue(value);
					});
			});

		// Foreground color input
		let foregroundColor = '';
		new Setting(formContainer)
			.setName(MENU_LABELS.foregroundColorLabel)
			.setDesc('Leave empty to use default text color')
			.addText(text => {
				text.setPlaceholder('e.g., #FFFFFF, white')
					.onChange(value => {
						foregroundColor = sanitizeColorValue(value);
					});
			});

		// Add button
		new Setting(formContainer)
			.addButton(button => {
				button.setButtonText(MENU_LABELS.addColor)
					.setCta()
					.onClick(() => {
						this.addCustomColor(colorName, backgroundColor, foregroundColor || null);
					});
			});
	}

	private async addCustomColor(
		name: string,
		backgroundColor: string,
		foregroundColor: string | null
	): Promise<void> {
		const newColor: Partial<ColorDefinition> = {
			name,
			backgroundColor,
			foregroundColor,
			isCustom: true
		};

		const validation = validateNewCustomColor(
			newColor,
			this.plugin.settings.predefinedColors,
			this.plugin.settings.customColors
		);

		if (!validation.valid) {
			// Show error message
			this.showError(validation.error || 'Invalid color');
			return;
		}

		// Add the color
		this.plugin.settings.customColors.push(newColor as ColorDefinition);
		await this.plugin.saveSettings();

		// Refresh the settings display
		this.display();
	}

	private async deleteCustomColor(index: number): Promise<void> {
		if (index >= 0 && index < this.plugin.settings.customColors.length) {
			this.plugin.settings.customColors.splice(index, 1);
			await this.plugin.saveSettings();

			// Refresh the settings display
			this.display();
		}
	}

	private showError(message: string): void {
		// Find or create error message element
		const { containerEl } = this;
		let errorEl = containerEl.querySelector('.' + CSS_CLASSES.errorMessage) as HTMLElement;

		if (!errorEl) {
			errorEl = containerEl.createDiv({ cls: CSS_CLASSES.errorMessage });
		}

		errorEl.textContent = message;
		errorEl.style.color = 'var(--text-error)';
		errorEl.style.marginTop = '10px';

		// Clear error after 5 seconds
		setTimeout(() => {
			errorEl.remove();
		}, 5000);
	}
}

/**
 * Settings management functions
 */
export class SettingsManager {
	private plugin: HighlighterPlugin;

	constructor(plugin: HighlighterPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Load settings from storage with migration support
	 */
	async loadSettings(): Promise<PluginSettings> {
		const loadedSettings = await this.plugin.loadData();

		if (!loadedSettings) {
			// First time setup
			return { ...DEFAULT_SETTINGS };
		}

		// Merge with defaults to handle missing properties
		const settings = Object.assign({}, DEFAULT_SETTINGS, loadedSettings);

		// Perform migration if needed
		return this.migrateSettings(settings);
	}

	/**
	 * Save settings to storage
	 */
	async saveSettings(settings: PluginSettings): Promise<void> {
		await this.plugin.saveData(settings);
	}

	/**
	 * Migrate settings from older versions
	 */
	private migrateSettings(settings: PluginSettings): PluginSettings {
		// Migration logic for future versions
		// For now, just ensure the structure is correct

		// Ensure predefined colors are correct
		if (!settings.predefinedColors || settings.predefinedColors.length !== 3) {
			settings.predefinedColors = [...DEFAULT_SETTINGS.predefinedColors];
		}

		// Ensure custom colors array exists
		if (!Array.isArray(settings.customColors)) {
			settings.customColors = [];
		}

		// Ensure maxCustomColors is set
		if (typeof settings.maxCustomColors !== 'number') {
			settings.maxCustomColors = DEFAULT_SETTINGS.maxCustomColors;
		}

		// Update version
		settings.version = DEFAULT_SETTINGS.version;

		return settings;
	}

	/**
	 * Reset settings to defaults
	 */
	async resetToDefaults(): Promise<PluginSettings> {
		const defaultSettings = { ...DEFAULT_SETTINGS };
		await this.saveSettings(defaultSettings);
		return defaultSettings;
	}

	/**
	 * Get all available colors (predefined + custom)
	 */
	getAllColors(): ColorDefinition[] {
		return [
			...this.plugin.settings.predefinedColors,
			...this.plugin.settings.customColors
		];
	}

	/**
	 * Find a color by name
	 */
	findColorByName(name: string): ColorDefinition | null {
		const allColors = this.getAllColors();
		return allColors.find(color =>
			color.name.toLowerCase() === name.toLowerCase()
		) || null;
	}

	/**
	 * Check if custom color limit is reached
	 */
	isCustomColorLimitReached(): boolean {
		return this.plugin.settings.customColors.length >= this.plugin.settings.maxCustomColors;
	}
}