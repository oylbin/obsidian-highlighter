/**
 * Lightweight diagnostic logging for the Text Highlighter plugin.
 *
 * Logging is always on but deliberately low-noise: the normal path emits a
 * single line per command invocation. Every message carries the same prefix
 * so it can be isolated in the DevTools console with a `[Highlighter]` filter.
 */

const LOG_PREFIX = '[Highlighter]';

export function logInfo(message: string, ...details: unknown[]): void {
	console.log(`${LOG_PREFIX} ${message}`, ...details);
}

export function logWarn(message: string, ...details: unknown[]): void {
	console.warn(`${LOG_PREFIX} ${message}`, ...details);
}

export function logError(message: string, ...details: unknown[]): void {
	console.error(`${LOG_PREFIX} ${message}`, ...details);
}
