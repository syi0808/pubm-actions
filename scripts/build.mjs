import { build } from "esbuild";

const shared = {
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  alias: {
    "@pubm/core": "../pubm-issue-34-release-workflow/packages/core/src/index.ts",
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
