/**
 * @type {import('prettier').Config}
 */
const prettierConfig = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-tailwindcss'],
}

export default prettierConfig
