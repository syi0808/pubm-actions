import { execSync } from "node:child_process";
import path from "node:path";

export function detectChangesetFiles(
	baseBranch: string,
	cwd: string,
): string[] {
	try {
		const output = execSync(
			`git diff --name-only --diff-filter=ACMR "origin/${baseBranch}...HEAD" -- ".pubm/changesets/*.md"`,
			{ cwd, encoding: "utf8" },
		);

		return output
			.trim()
			.split("\n")
			.filter((f) => f.length > 0)
			.filter((f) => path.basename(f) !== "README.md");
	} catch {
		return [];
	}
}
