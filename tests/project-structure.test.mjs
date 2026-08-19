import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dockerDirectory = resolve(root, "docker");

assert.ok(existsSync(resolve(dockerDirectory, "Dockerfile")));
assert.ok(existsSync(resolve(dockerDirectory, "docker-compose.yml")));
assert.ok(existsSync(resolve(dockerDirectory, "migrator/package.json")));
assert.equal(existsSync(resolve(root, "Dockerfile")), false);
assert.equal(existsSync(resolve(root, "docker-compose.yml")), false);

const compose = readFileSync(resolve(dockerDirectory, "docker-compose.yml"), "utf8");
const dockerfile = readFileSync(resolve(dockerDirectory, "Dockerfile"), "utf8");
const turbo = JSON.parse(readFileSync(resolve(root, "turbo.json"), "utf8"));
const workerPackage = JSON.parse(readFileSync(resolve(root, "apps/worker/package.json"), "utf8"));
const workerCli = readFileSync(resolve(root, "apps/worker/src/cli.ts"), "utf8");
assert.match(compose, /context:\s*\.\./);
assert.match(compose, /dockerfile:\s*docker\/Dockerfile/);
assert.match(compose, /\.\.\/apps\/web\/public/);
assert.match(compose, /x-app-build:\s*&app-build/);
assert.match(compose, /migrate:\n\s+image:\s+narau-migrate/);
assert.match(compose, /migrate:[\s\S]*?target:\s*migrator/);
assert.match(compose, /web:\n\s+image:\s+narau-web/);
assert.match(compose, /web:[\s\S]*?target:\s*runner/);
assert.doesNotMatch(compose, /target:\s*base/);
assert.doesNotMatch(compose, /\.\.\/packages\/database\/prisma/);
assert.match(compose, /condition:\s*service_completed_successfully/);
assert.match(compose, /WIKIPEDIA_REQUEST_DELAY_MS:/);
assert.match(dockerfile, /COPY package\.json bun\.lock/);
assert.match(dockerfile, /bun install --frozen-lockfile/);
assert.match(dockerfile, /FROM oven\/bun:1-alpine AS runner/);
assert.match(dockerfile, /FROM oven\/bun:1-alpine AS migrator/);
assert.match(dockerfile, /COPY docker\/migrator\/package\.json/);
assert.match(dockerfile, /COPY --from=runtime-files \/runtime\/node_modules\/@prisma/);
assert.match(dockerfile, /client_store_name/);
assert.match(dockerfile, /COPY --from=runtime-files \/runtime\/node_modules\/\.bun/);
assert.doesNotMatch(dockerfile, /COPY --from=prod-deps/);
assert.match(workerPackage.scripts["job:ingest"], /^bun dist\/cli\.js/);
assert.match(workerPackage.scripts["job:select"], /^bun dist\/cli\.js/);
assert.match(workerPackage.scripts["job:assign"], /^bun dist\/cli\.js/);
assert.match(workerPackage.scripts["job:remind"], /^bun dist\/cli\.js/);
assert.match(workerCli, /await main\(\)/);
assert.match(dockerfile, /COPY --from=builder \/app\/apps\/worker\/dist/);
assert.ok(existsSync(resolve(root, "apps/web/src/middleware.ts")));
assert.ok(existsSync(resolve(root, "apps/web/src/server/tenant.ts")));
assert.doesNotMatch(readFileSync(resolve(root, "apps/web/src/lib/i18n.ts"), "utf8"), /export const TENANTS/);
assert.match(
  readFileSync(resolve(root, "apps/web/src/components/layout/logo.tsx"), "utf8"),
  /^"use client";/,
);

const dockerignore = readFileSync(resolve(root, ".dockerignore"), "utf8");
for (const pattern of ["node_modules", ".next", ".turbo", "dist", ".git"]) {
  assert.match(dockerignore, new RegExp(`^${pattern}/?$`, "m"));
}

assert.deepEqual(
  turbo.tasks.build.outputs,
  [],
  "the default build task should not claim artifacts from typecheck-only packages",
);
assert.deepEqual(
  turbo.tasks["@narau/web#build"].outputs,
  [".next/**", "!.next/cache/**"],
  "the web build should cache its Next.js output",
);
assert.deepEqual(
  turbo.tasks["@narau/worker#build"].outputs,
  ["dist/**"],
  "the worker build should cache its bundled output",
);

console.log("Repository structure checks passed.");
