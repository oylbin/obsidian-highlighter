/**
 * Resolves a usable Editor + selection for command-palette / hotkey invocations.
 *
 * Background
 * ----------
 * The `editor-menu` (right-click) path receives the exact Editor instance the
 * user interacted with, so it is always correct. Command invocations go through
 * `editorCallback`, where Obsidian derives the Editor from its global
 * `app.workspace.activeEditor` tracker. That tracker can go stale — pointing at
 * a different leaf, or at an editor that has been rebuilt — in which case
 * `getSelection()` returns an empty string even though the user clearly has
 * text selected. Reloading the app rebuilds the workspace and resets it, which
 * is why a reload "fixes" the problem.
 *
 * Strategy
 * --------
 * Probe several independent sources and take the first one that actually has a
 * non-empty selection. The `active-markdown-view` source is the important
 * fallback: it asks the workspace which Markdown view is active right now,
 * bypassing the tracker that can drift.
 *
 * Safety: a fallback is only ever used when it has a non-empty selection, so we
 * never write into an editor the user did not select text in.
 */

import { App, Editor, MarkdownView } from 'obsidian';
import { logInfo, logWarn } from './logger';

/** Where a candidate Editor instance came from, in probe order. */
export type EditorSource =
	| 'callback'
	| 'workspace-active-editor'
	| 'active-markdown-view';

/** A successfully resolved editor with a non-empty selection. */
export interface EditorSelectionContext {
	editor: Editor;
	selection: string;
	/** Selection bounds as absolute document offsets. */
	selectionStart: number;
	selectionEnd: number;
	source: EditorSource;
}

interface EditorCandidate {
	source: EditorSource;
	editor: Editor | null;
}

/** Per-candidate diagnostic snapshot, only materialised when resolution fails. */
interface CandidateSnapshot {
	source: EditorSource;
	present: boolean;
	/**
	 * Identity index shared by candidates that are the *same* Editor object.
	 * If every source reports the same index, the workspace tracker is not the
	 * culprit and the selection was genuinely lost.
	 */
	instance: number | null;
	selectionLength: number | null;
	cursor: string | null;
	error?: string;
}

/**
 * Collect candidate editors in priority order. Each lookup is guarded because a
 * detached or half-torn-down view can throw rather than return null.
 */
function collectCandidates(app: App, callbackEditor: Editor | null): EditorCandidate[] {
	const candidates: EditorCandidate[] = [
		{ source: 'callback', editor: callbackEditor }
	];

	try {
		const activeEditor = app.workspace.activeEditor?.editor ?? null;
		candidates.push({ source: 'workspace-active-editor', editor: activeEditor });
	} catch {
		candidates.push({ source: 'workspace-active-editor', editor: null });
	}

	try {
		const view = app.workspace.getActiveViewOfType(MarkdownView);
		candidates.push({ source: 'active-markdown-view', editor: view?.editor ?? null });
	} catch {
		candidates.push({ source: 'active-markdown-view', editor: null });
	}

	return candidates;
}

/**
 * Read the selection from a candidate. Returns null when the editor is absent,
 * has no selection, or throws (a stale instance may reject these calls).
 */
function readSelection(candidate: EditorCandidate): EditorSelectionContext | null {
	const { editor, source } = candidate;
	if (!editor) {
		return null;
	}

	try {
		const selection = editor.getSelection();
		if (!selection) {
			return null;
		}

		return {
			editor,
			selection,
			selectionStart: editor.posToOffset(editor.getCursor('from')),
			selectionEnd: editor.posToOffset(editor.getCursor('to')),
			source
		};
	} catch {
		return null;
	}
}

/**
 * Build a diagnostic snapshot of a candidate. `seen` accumulates distinct
 * Editor objects so identical instances share an identity index.
 */
function snapshotCandidate(candidate: EditorCandidate, seen: Editor[]): CandidateSnapshot {
	const { editor, source } = candidate;
	if (!editor) {
		return { source, present: false, instance: null, selectionLength: null, cursor: null };
	}

	let instance = seen.indexOf(editor);
	if (instance === -1) {
		instance = seen.push(editor) - 1;
	}

	try {
		const from = editor.getCursor('from');
		const to = editor.getCursor('to');
		return {
			source,
			present: true,
			instance,
			selectionLength: editor.getSelection().length,
			cursor: `${from.line}:${from.ch}-${to.line}:${to.ch}`
		};
	} catch (error) {
		return {
			source,
			present: true,
			instance,
			selectionLength: null,
			cursor: null,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}

/**
 * Resolve an editor with a non-empty selection for the given command.
 *
 * Returns null only when *every* source came up empty — at which point a full
 * diagnostic snapshot is logged so the failure can be analysed after the fact.
 * Callers should show the "select text" notice in that case.
 */
export function resolveEditorSelection(
	app: App,
	callbackEditor: Editor | null,
	commandId: string
): EditorSelectionContext | null {
	const candidates = collectCandidates(app, callbackEditor);

	for (const candidate of candidates) {
		const resolved = readSelection(candidate);
		if (resolved) {
			// Normal path: exactly one line per command invocation.
			logInfo(
				`cmd=${commandId} src=${resolved.source} sel=${resolved.selection.length}ch ` +
				`range=${resolved.selectionStart}-${resolved.selectionEnd}`
			);
			return resolved;
		}
	}

	const seen: Editor[] = [];
	logWarn(
		`cmd=${commandId} FAILED to resolve a selection from any source. ` +
		'Please copy this entry (expand the object below) when reporting the issue.',
		{
			activeFile: app.workspace.getActiveFile()?.path ?? null,
			activeViewType: app.workspace.getActiveViewOfType(MarkdownView)
				? 'markdown'
				: (app.workspace.activeLeaf?.view?.getViewType() ?? null),
			candidates: candidates.map(candidate => snapshotCandidate(candidate, seen))
		}
	);

	return null;
}
