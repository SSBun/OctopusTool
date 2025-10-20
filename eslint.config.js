import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // 放宽某些规则以适应实际开发需求
      '@typescript-eslint/no-explicit-any': 'warn', // any 类型警告而非错误
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',  // 忽略以 _ 开头的参数
        varsIgnorePattern: '^_',  // 忽略以 _ 开头的变量
        caughtErrors: 'none'       // 不检查 catch 中的错误变量
      }],
      'no-case-declarations': 'warn', // case 声明警告而非错误
      'react-hooks/exhaustive-deps': 'warn', // hooks 依赖警告而非错误
    },
  },
)

