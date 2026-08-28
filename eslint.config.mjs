/**
 * Shared flat ESLint configuration entrypoint for workspace apps.
 */
const baseConfig = [
  {
    ignores: ['**/.next/**', '**/dist/**', '**/node_modules/**'],
  },
];

export default baseConfig;
