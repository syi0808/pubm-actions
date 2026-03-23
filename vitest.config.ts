import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
	},
	resolve: {
		alias: {
			"@pubm/core": path.resolve(__dirname, "pubm/packages/core/src"),
		},
	},
});
