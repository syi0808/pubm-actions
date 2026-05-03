import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function coreEntryForPubmRoot(pubmRoot) {
  return resolve(pubmRoot, "packages/core/src/index.ts");
}

function hasReleasePrCoreApi(entry) {
  if (!existsSync(entry)) {
    return false;
  }

  const source = readFileSync(entry, "utf8");
  return (
    source.includes("prepareReleasePr") &&
    source.includes("publishReleasePr") &&
    source.includes("parseChangeset")
  );
}

function resolveCoreEntry() {
  const candidates = [
    process.env.PUBM_CORE_ENTRY,
    process.env.PUBM_REPO ? coreEntryForPubmRoot(process.env.PUBM_REPO) : undefined,
    coreEntryForPubmRoot(resolve(repoRoot, "pubm")),
    coreEntryForPubmRoot(resolve(repoRoot, "..", "pubm")),
    coreEntryForPubmRoot(resolve(repoRoot, "..", "pubm-issue-34-release-workflow")),
  ].filter(Boolean);

  const entry = candidates.find(hasReleasePrCoreApi);
  if (!entry) {
    throw new Error(
      [
        "Could not find a @pubm/core source entry with the release PR API.",
        "Set PUBM_CORE_ENTRY to packages/core/src/index.ts or update the pubm submodule.",
      ].join(" "),
    );
  }

  return entry;
}

const shared = {
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  alias: {
    "@pubm/core": resolveCoreEntry(),
    "@napi-rs/keyring": "./src/stubs/keyring.ts",
  },
  banner: {
    js: [
      "import { createRequire as __pubmCreateRequire } from 'node:module';",
      "const require = __pubmCreateRequire(import.meta.url);",
    ].join(""),
  },
};

const actions = [
  ["src/changeset-check/main.ts", "changeset-check/dist/index.js"],
  ["src/release-pr/main.ts", "release-pr/dist/index.js"],
  ["src/publish/main.ts", "publish/dist/index.js"],
];

await Promise.all(
  actions.map(([entryPoint, outfile]) =>
    build({
      ...shared,
      entryPoints: [entryPoint],
      outfile,
    }),
  ),
);
