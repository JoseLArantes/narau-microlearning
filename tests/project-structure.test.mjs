import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dockerDirectory = resolve(root, "docker");

assert.ok(existsSync(resolve(dockerDirectory, "Dockerfile")));
assert.ok(existsSync(resolve(dockerDirectory, "docker-compose.yml")));
assert.equal(existsSync(resolve(root, "Dockerfile")), false);
assert.equal(existsSync(resolve(root, "docker-compose.yml")), false);

const compose = readFileSync(resolve(dockerDirectory, "docker-compose.yml"), "utf8");
const dockerfile = readFileSync(resolve(dockerDirectory, "Dockerfile"), "utf8");
assert.match(compose, /context:\s*\.\./);
  assert.match(compose, /dockerfile:\s*docker\/Dockerfile/);
  assert.match(compose, /\.\.\/apps\/web\/public/);
  assert.match(compose, /x-app-image:\s*&app-image/);
  assert.match(compose, /migrate:\n\s+<<:\s+\*app-image/);
  assert.match(compose, /web:\n\s+<<:\s+\*app-image/);
  assert.doesNotMatch(compose, /target:\s*base/);
  assert.doesNotMatch(compose, /\.\.\/packages\/database\/prisma/);
  assert.match(compose, /condition:\s*service_completed_successfully/);
  assert.match(dockerfile, /COPY package\.json bun\.lock/);
assert.match(dockerfile, /bun install --frozen-lockfile/);

const dockerignore = readFileSync(resolve(root, ".dockerignore"), "utf8");
for (const pattern of ["node_modules", ".next", ".turbo", "dist", ".git"]) {
  assert.match(dockerignore, new RegExp(`^${pattern}/?$`, "m"));
}

console.log("Repository structure checks passed.");
