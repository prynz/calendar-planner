// @ts-check
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import prettier from 'eslint-config-prettier/flat';

const RAW_COLOR = String.raw`/^(#[0-9a-fA-F]{3,8}|rgba?\(.*\)|hsla?\(.*\)|white|black)$/`;
const UI_IMPORTS = ['react', 'react-native', 'react-native-*', 'expo', 'expo-*', 'next', 'next/*', '@expo/*'];

export default defineConfig([
  expoConfig,
  prettier,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/android/**',
      '**/ios/**',
      'apps/mobile/expo-env.d.ts',
      'supabase/**',
    ],
  },
  {
    settings: {
      'import/resolver': { typescript: { project: ['apps/mobile/tsconfig.json', 'packages/*/tsconfig.json'] } },
    },
  },
  // No swallowed errors (CLAUDE.md "keine verschluckten Fehler").
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: false }],
    },
  },
  // Design system: screens and features use tokens, never raw colors or font sizes.
  {
    files: ['apps/mobile/app/**/*.{ts,tsx}', 'apps/mobile/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${RAW_COLOR}]`,
          message: 'Keine Roh-Farben in Screens – Tokens aus @nowish/ui verwenden.',
        },
        {
          selector: 'Property[key.name=/^(fontSize|lineHeight|borderRadius|fontFamily)$/] > Literal',
          message: 'Keine Roh-Werte für Typo/Radien in Screens – Tokens aus @nowish/ui verwenden.',
        },
      ],
    },
  },
  // Routes stay thin: only re-exports of screens from features/* (CLAUDE.md).
  {
    files: ['apps/mobile/app/(tabs)/!(_layout).tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > :not(ExportNamedDeclaration[source])',
          message: 'Routen sind nur Re-Exports aus features/*.',
        },
      ],
    },
  },
  // Pure packages: no UI framework imports (CLAUDE.md dependency direction).
  {
    files: [
      'packages/domain/src/**/*.ts',
      'packages/demo/src/**/*.ts',
      'packages/i18n/src/**/*.ts',
      'packages/config/src/**/*.ts',
      'packages/brand/src/**/*.ts',
      'packages/ui/src/tokens.ts',
      'packages/ui/src/contrast.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: UI_IMPORTS }],
    },
  },
]);
