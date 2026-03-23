import { describe, it, expect, vi } from "vitest";
import { validateChangesets } from "../src/validate.js";
import * as fs from "node:fs";

vi.mock("node:fs");

describe("validateChangesets", () => {
	it("validates a correct changeset", () => {
		vi.mocked(fs.readFileSync).mockReturnValue(
			"---\npackages/core: minor\n---\n\nAdd new feature\n",
		);
		vi.mocked(fs.existsSync).mockReturnValue(true);

		const result = validateChangesets(
			[".pubm/changesets/brave-fox.md"],
			"/project",
		);
		expect(result.valid).toHaveLength(1);
		expect(result.errors).toHaveLength(0);
		expect(result.valid[0].id).toBe("brave-fox");
		expect(result.valid[0].releases[0]).toEqual({
			path: "packages/core",
			type: "minor",
		});
	});

	it("reports error for missing frontmatter", () => {
		vi.mocked(fs.readFileSync).mockReturnValue("No frontmatter here\n");

		const result = validateChangesets(
			[".pubm/changesets/bad-file.md"],
			"/project",
		);
		expect(result.valid).toHaveLength(0);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toContain("missing frontmatter");
	});

	it("reports error for invalid bump type", () => {
		vi.mocked(fs.readFileSync).mockReturnValue(
			"---\npackages/core: big\n---\n\nSome change\n",
		);

		const result = validateChangesets(
			[".pubm/changesets/bad-bump.md"],
			"/project",
		);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toContain('Invalid bump type "big"');
	});

	it("reports error for empty summary", () => {
		vi.mocked(fs.readFileSync).mockReturnValue(
			"---\npackages/core: patch\n---\n",
		);
		vi.mocked(fs.existsSync).mockReturnValue(true);

		const result = validateChangesets(
			[".pubm/changesets/empty-summary.md"],
			"/project",
		);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toContain("summary is empty");
	});

	it("reports error for empty frontmatter (no releases)", () => {
		vi.mocked(fs.readFileSync).mockReturnValue("---\n---\n\nSome change\n");

		const result = validateChangesets(
			[".pubm/changesets/no-releases.md"],
			"/project",
		);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toContain("No package releases");
	});

	it("reports error for non-existent package path", () => {
		vi.mocked(fs.readFileSync).mockReturnValue(
			"---\npackages/nonexistent: patch\n---\n\nSome fix\n",
		);
		vi.mocked(fs.existsSync).mockReturnValue(false);

		const result = validateChangesets(
			[".pubm/changesets/bad-path.md"],
			"/project",
		);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toContain("does not exist");
	});

	it("reports error when file cannot be read", () => {
		vi.mocked(fs.readFileSync).mockImplementation(() => {
			throw new Error("ENOENT");
		});

		const result = validateChangesets(
			[".pubm/changesets/missing.md"],
			"/project",
		);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].message).toBe("File could not be read");
	});

	it("handles multiple files with mixed results", () => {
		vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
			if (String(filePath).includes("good")) {
				return "---\npackages/core: minor\n---\n\nGood change\n";
			}
			return "No frontmatter";
		});
		vi.mocked(fs.existsSync).mockReturnValue(true);

		const result = validateChangesets(
			[
				".pubm/changesets/good-file.md",
				".pubm/changesets/bad-file.md",
			],
			"/project",
		);
		expect(result.valid).toHaveLength(1);
		expect(result.errors).toHaveLength(1);
	});
});
