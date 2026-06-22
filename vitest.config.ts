import { defineConfig } from "vitest/config";

// Standalone Vitest config (no SvelteKit plugin): the suite covers pure TS
// modules and raw markdown read via `import.meta.glob`, so it needs neither
// `.svelte`/`.md` compilation nor `$app` aliases — keeping runs fast.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
