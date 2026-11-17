const fs = require("node:fs");
const { createHash } = require("node:crypto");

function createSessionStore(file) {
  let entries = [];
  if (file) {
    try {
      entries = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const sessions = new Map(entries.filter(([, s]) => s.expires > Date.now()));
  const key = (token) => createHash("sha256").update(token).digest("hex");
  function persist() {
    if (!file) return;
    fs.writeFileSync(file + ".tmp", JSON.stringify([...sessions]), {
      mode: 0o600,
    });
    fs.renameSync(file + ".tmp", file);
  }
  return {
    get(token) {
      return sessions.get(key(token));
    },
    set(token, session) {
      sessions.set(key(token), session);
      persist();
    },
    delete(token) {
      if (sessions.delete(key(token))) persist();
    },
    revokeUser(id, exceptToken) {
      for (const [hash, session] of sessions) {
        if (
          session.id === id &&
          hash !== (exceptToken ? key(exceptToken) : null)
        )
          sessions.delete(hash);
      }
      persist();
    },
  };
}
module.exports = { createSessionStore };
