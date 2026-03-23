import * as core from "@actions/core";
import * as github from "@actions/github";
import { upsertComment } from "./comment.js";
import { detectChangesetFiles } from "./detect.js";
import {
	invalidBody,
	missingBody,
	skippedBody,
	successBody,
} from "./templates.js";
import { validateChangesets } from "./validate.js";

async function run(): Promise<void> {
	const skipLabel = core.getInput("skip-label");
	const shouldComment = core.getInput("comment") === "true";
	const token = core.getInput("token");
	const workingDirectory = core.getInput("working-directory");

	const octokit = github.getOctokit(token);
	const { context } = github;

	if (!context.payload.pull_request) {
		core.setFailed("This action can only run on pull_request events");
		return;
	}

	const pr = context.payload.pull_request;
	const commentCtx = {
		owner: context.repo.owner,
		repo: context.repo.repo,
		issueNumber: pr.number,
	};

	// Check skip label
	const labels: Array<{ name: string }> = pr.labels ?? [];
	if (labels.some((l) => l.name === skipLabel)) {
		core.setOutput("status", "skipped");
		core.setOutput("changeset-files", "");
		core.setOutput("errors", "[]");

		if (shouldComment) {
			await upsertComment(octokit, commentCtx, skippedBody(skipLabel));
		}
		return;
	}

	// Detect changeset files
	const baseBranch = pr.base.ref;
	const files = detectChangesetFiles(baseBranch, workingDirectory);
	core.setOutput("changeset-files", files.join("\n"));

	if (files.length === 0) {
		core.setOutput("status", "missing");
		core.setOutput("errors", "[]");

		if (shouldComment) {
			await upsertComment(octokit, commentCtx, missingBody(skipLabel));
		}
		core.setFailed("No changeset found");
		return;
	}

	// Validate changesets
	const result = validateChangesets(files, workingDirectory);
	core.setOutput("errors", JSON.stringify(result.errors));

	if (result.errors.length > 0) {
		core.setOutput("status", "invalid");

		if (shouldComment) {
			await upsertComment(octokit, commentCtx, invalidBody(result.errors));
		}
		core.setFailed(
			`${result.errors.length} changeset validation error(s)`,
		);
		return;
	}

	// All valid
	core.setOutput("status", "success");

	if (shouldComment) {
		await upsertComment(octokit, commentCtx, successBody(result.valid));
	}
}

run().catch((err) => {
	core.setFailed(err instanceof Error ? err.message : String(err));
});
