const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createSessionStore } = require("../session-store.cjs");
test("sessions survive restarts, expire and remain revoked after logout or password changes", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "livraria-sessions-"));
  const file = path.join(dir, "sessions.json");
  try {
    let store = createSessionStore(file);
    const valid = { id: 1, expires: Date.now() + 60000 };
    store.set("first-token", valid);
    store.set("second-token", valid);
    store.set("expired", { id: 2, expires: Date.now() - 1 });
    assert.ok(!fs.readFileSync(file, "utf8").includes("first-token"));
    store = createSessionStore(file);
    assert.deepEqual(store.get("first-token"), valid);
    assert.equal(store.get("expired"), undefined);
    assert.equal(store.get("forged-token"), undefined);
    store.revokeUser(1, "first-token");
    store = createSessionStore(file);
    assert.deepEqual(store.get("first-token"), valid);
    assert.equal(store.get("second-token"), undefined);
    store.delete("first-token");
    store = createSessionStore(file);
    assert.equal(store.get("first-token"), undefined);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
