import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  base: "/estimate-electric-car-range",
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      all: true,
      include: ['src/lib/utils/rangeCalculator.svelte.ts'],
    },
  }
});
