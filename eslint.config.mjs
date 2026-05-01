import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(...tseslint.configs.recommended, prettier, {
    ignores: ['dist/**', 'node_modules/**'],
});
