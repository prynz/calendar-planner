import type { IcsParseResult } from '@nowish/domain';

/**
 * Hand-over from "Import file" (settings) to the preview screen. A parsed file can be large, so it is kept in
 * memory instead of route params; it lives only until the preview is closed or the app restarts.
 */
let pending: Extract<IcsParseResult, { ok: true }> | null = null;

export const setPendingImport = (r: Extract<IcsParseResult, { ok: true }> | null) => {
  pending = r;
};
export const getPendingImport = () => pending;
