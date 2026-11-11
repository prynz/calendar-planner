// The app tsconfig deliberately has no Node types (app code must not use Node APIs), so only what this test needs.
interface Fs {
  readdirSync(path: string): string[];
  readFileSync(path: string, encoding: 'utf8'): string;
  statSync(path: string): { isDirectory(): boolean };
}
const { readdirSync, readFileSync, statSync } = jest.requireActual<Fs>('fs');
const join = (...parts: string[]) => parts.join('/');

/**
 * Metro picks `x.web.ts` instead of `x.ts` for the web preview. Both must export the same names, otherwise the
 * preview crashes at runtime (Phase 7 find: `setHapticsEnabled` was missing on the web).
 */
const testPath = expect.getState().testPath ?? '';
const ROOT = testPath.slice(0, testPath.lastIndexOf('/__tests__/'));
const DIRS = ['services', 'storage', 'data', 'features', 'providers'];

function webVariants(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return webVariants(path);
    return /\.web\.tsx?$/.test(name) ? [path] : [];
  });
}

function exportedNames(path: string): string[] {
  const source = readFileSync(path, 'utf8');
  const names = [...source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class|type|interface)\s+(\w+)/g)];
  // Re-exports such as `export type { ConfirmChoice };` count as well.
  const reexports = [...source.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)].flatMap((m) =>
    (m[1] ?? '').split(',').map(
      (n) =>
        n
          .trim()
          .split(/\s+as\s+/)
          .pop() ?? '',
    ),
  );
  return [...names.map((m) => m[1] ?? ''), ...reexports].filter(Boolean).sort();
}

const pairs = DIRS.flatMap((d) => webVariants(join(ROOT, d))).map((web) => [
  web.slice(ROOT.length + 1),
  web,
  web.replace(/\.web\.(tsx?)$/, '.$1'),
]);

describe('platform variants', () => {
  it('finds the web variants', () => {
    expect(pairs.length).toBeGreaterThanOrEqual(8);
  });

  it.each(pairs)('%s exports the same names as the native module', (_name, web, native) => {
    expect(exportedNames(web ?? '')).toEqual(exportedNames(native ?? ''));
  });
});
