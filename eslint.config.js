import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import skipFormatting from 'eslint-config-prettier/flat';

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/.vite/**',
  ]),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  ...pluginVue.configs['flat/essential'],

  skipFormatting,
]);
