import type { Changeset } from "../pubm/packages/core/src/changeset/parser.js";
import type { ValidationError } from "./validate.js";

const MARKER = "<!-- pubm:changeset-check -->";
const FOOTER =
	'<sub>Validated by <a href="https://github.com/syi0808/pubm-actions">pubm changeset check</a></sub>';

export function successBody(changesets: Changeset[]): string {
	const rows = changesets.flatMap((cs) =>
		cs.releases.map(
			(r) => `| \`${cs.id}.md\` | \`${r.path}\` | ${r.type} |`,
		),
	);

	return `${MARKER}
### ✅ Changeset detected

| File | Package | Bump |
|------|---------|------|
${rows.join("\n")}

${FOOTER}`;
}

export function missingBody(skipLabel: string): string {
	return `${MARKER}
### ❌ No changeset found

This PR does not include a changeset. If this change affects users, please add one:

\`\`\`sh
pubm changesets add
\`\`\`

This will create a file in \`.pubm/changesets/\` describing the change and its semver bump.

If this PR does not need a changeset (e.g., docs, CI, refactoring), add the **\`${skipLabel}\`** label to skip this check.

${FOOTER}`;
}

export function invalidBody(errors: ValidationError[]): string {
	const rows = errors.map(
		(e) => `| \`${e.file}\` | ${e.message} |`,
	);

	return `${MARKER}
### ❌ Invalid changeset(s)

The following changeset files have validation errors:

| File | Error |
|------|-------|
${rows.join("\n")}

Please fix these errors and push again.

${FOOTER}`;
}

export function skippedBody(label: string): string {
	return `${MARKER}
### ⚠️ Changeset check skipped

The **\`${label}\`** label is present. This PR will not require a changeset.

${FOOTER}`;
}

export { MARKER };
