import { defineConfig } from 'vitest/config'

/**
 * https://github.com/vitest-dev/vitest/blob/main/test/global-setup/vitest.config.ts
 */
export default defineConfig({
  test: {
    dir: 'src',
    globals: true,
    allowOnly: true,
  },
})
