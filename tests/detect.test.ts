import { describe, it, expect, vi } from "vitest";
import { detectChangesetFiles } from "../src/detect.js";
import * as child_process from "node:child_process";

vi.mock("node:child_process");

describe("detectChangesetFiles", () => {
	it("returns changeset files from git diff", () => {
		vi.mocked(child_process.execSync).mockReturnValue(
			".pubm/changesets/brave-fox.md\n.pubm/changesets/calm-owl.md\n",
		);

		const result = detectChangesetFiles("main", "/project");
		expect(result).toEqual([
			".pubm/changesets/brave-fox.md",
			".pubm/changesets/calm-owl.md",
		]);
	});

	it("filters out README.md", () => {
		vi.mocked(child_process.execSync).mockReturnValue(
			".pubm/changesets/brave-fox.md\n.pubm/changesets/README.md\n",
		);

		const result = detectChangesetFiles("main", "/project");
		expect(result).toEqual([".pubm/changesets/brave-fox.md"]);
	});

	it("returns empty array when no changesets found", () => {
		vi.mocked(child_process.execSync).mockReturnValue("");

		const result = detectChangesetFiles("main", "/project");
		expect(result).toEqual([]);
	});

	it("returns empty array on git command failure", () => {
		vi.mocked(child_process.execSync).mockImplementation(() => {
			throw new Error("git failed");
		});

		const result = detectChangesetFiles("main", "/project");
		expect(result).toEqual([]);
	});
});
