import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Конфиг тестов. Отделён от Next.js-сборки; alias @/* зеркалит tsconfig.
export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "."),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: ["**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", ".next", "e2e", "PROD2", "1C"],
	},
});
