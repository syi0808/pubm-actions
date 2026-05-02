export function isPushToBaseBranch(input: {
	eventName: string;
	ref: string;
	baseBranch: string;
}): boolean {
	return (
		input.eventName === "push" &&
		input.ref === `refs/heads/${input.baseBranch}`
	);
}

export function hasLabel(
	labels: readonly { name?: string | null }[],
	labelName: string,
): boolean {
	return labels.some((label) => label.name === labelName);
}

export function isMergedReleasePullRequest(
	pr: {
		merged?: boolean | null;
		base?: { ref?: string | null } | null;
		head?: { ref?: string | null } | null;
		labels?: readonly { name?: string | null }[] | null;
	},
	input: {
		baseBranch: string;
		label: string;
		branchPrefix: string;
	},
): boolean {
	return Boolean(
		pr.merged &&
			pr.base?.ref === input.baseBranch &&
			pr.head?.ref?.startsWith(input.branchPrefix) &&
			hasLabel(pr.labels ?? [], input.label),
	);
}

export function isUsablePushRange(beforeSha?: string, afterSha?: string): boolean {
	return Boolean(
		beforeSha &&
			afterSha &&
			!/^[0]+$/.test(beforeSha) &&
			!/^[0]+$/.test(afterSha),
	);
}
