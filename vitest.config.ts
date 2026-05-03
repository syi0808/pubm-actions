import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
	},
	resolve: {
		alias: {
			"@pubm/core": path.resolve(
				import.meta.dirname,
				"../pubm-issue-34-release-workflow/packages/core/src/index.ts",
			),
		},
	},
});
