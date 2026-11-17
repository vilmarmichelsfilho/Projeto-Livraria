const jsonServer = require("json-server");
const { randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");
const path = require("node:path");
const { createSessionStore } = require("./session-store.cjs");
function createServer(database = path.join(__dirname, "db.json")) {
  const app = jsonServer.create(),
    router = jsonServer.router(database),
    db = router.db,
    sessions = createSessionStore(
      typeof database === "string" ? database + ".sessions.json" : null,
    );
  app.use(jsonServer.defaults({ logger: false }));
  app.use(jsonServer.bodyParser);
  // Não expor o banco inteiro nem relações que possam incluir credenciais.
  app.use((req, res, next) => {
    if (req.path === "/db" || req.query._expand || req.query._embed)
      return res.status(403).json({ message: "Consulta não permitida." });
    next();
  });
  const safe = ({ senha_hash, senha, ...u }) => ({
    ...u,
    id_usuario: u.id_usuario ?? u.id,
  });
  const hash = (password) => {
    const salt = randomBytes(16).toString("hex");
    return (
      "scrypt:" + salt + ":" + scryptSync(password, salt, 64).toString("hex")
    );
  };
  const verify = (password, value = "") => {
    const [alg, salt, key] = value.split(":");
    return (
      alg === "scrypt" &&
      !!salt &&
      /^[a-f0-9]{128}$/.test(key || "") &&
      timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(key, "hex"))
    );
  };
  const fail = (res, status, message) => res.status(status).json({ message });
  const fields = (b) => ({
    nome: String(b.nome ?? "").trim(),
    email: String(b.email ?? "")
      .trim()
      .toLowerCase(),
    telefone: String(b.telefone ?? "").trim(),
    endereco: String(b.endereco ?? "").trim(),
    cidade: String(b.cidade ?? "").trim(),
    uf: String(b.uf ?? "")
      .trim()
      .toUpperCase(),
    cep: String(b.cep ?? "").replace(/\D/g, ""),
  });
  const validate = (d, id) => {
    if (!d.nome) return "Informe seu nome completo.";
    if (!d.telefone) return "Informe seu telefone.";
    if (!d.endereco) return "Informe seu endereço.";
    if (!d.cidade) return "Informe sua cidade.";
    if (!d.uf) return "Informe a UF.";
    if (!d.cep) return "Informe o CEP.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      return "Informe um e-mail válido.";
    if (
      db
        .get("usuarios")
        .value()
        .some((u) => u.id !== id && u.email.trim().toLowerCase() === d.email)
    )
      return "Este e-mail já está cadastrado.";
    if (
      d.uf &&
      !"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
        .split(" ")
        .includes(d.uf)
    )
      return "Selecione uma UF válida.";
    if (d.cep && d.cep.length !== 8) return "O CEP deve conter 8 dígitos.";
  };
  app.post("/auth/login", (req, res) => {
    // Recarregar contas de teste alteradas no arquivo enquanto a API está aberta.
    if (typeof database === "string") db.read();
    const email = String(req.body.email ?? "")
        .trim()
        .toLowerCase(),
      u = db
        .get("usuarios")
        .find((u) => u.email.trim().toLowerCase() === email)
        .value();
    if (!u || !verify(String(req.body.senha ?? ""), u.senha_hash))
      return fail(res, 401, "E-mail ou senha incorretos.");
    if (!u.ativo) return fail(res, 403, "Esta conta está inativa.");
    const token = randomBytes(32).toString("hex");
    sessions.set(token, { id: u.id, expires: Date.now() + 86400000 });
    res.json({ token, usuario: safe(u) });
  });
  const cadastrarUsuario = (req, res) => {
    const data = fields(req.body),
      error = validate(data);
    if (error) return fail(res, 422, error);
    if (typeof req.body.senha !== "string" || req.body.senha.length < 8)
      return fail(res, 422, "A senha deve ter pelo menos 8 caracteres.");
    const id =
        Math.max(
          0,
          ...db
            .get("usuarios")
            .value()
            .map((u) => Number(u.id) || 0),
        ) + 1,
      now = new Date().toISOString();
    const u = {
      ...data,
      id,
      id_usuario: id,
      senha_hash: hash(req.body.senha),
      perfil:
        req.user?.perfil === "ADMIN" && req.body.perfil === "ADMIN"
          ? "ADMIN"
          : "CLIENTE",
      ativo: req.user?.perfil === "ADMIN" ? req.body.ativo !== false : true,
      criado_em: now,
      atualizado_em: now,
    };
    db.get("usuarios").push(u).write();
    res.status(201).json(safe(u));
  };
  app.post("/usuarios", cadastrarUsuario);
  app.use((req, res, next) => {
    if (!/^\/(usuarios|auth|admin)(\/|$)/.test(req.path)) return next();
    const token = (req.headers.authorization || "").replace(/^Bearer /, ""),
      session = sessions.get(token),
      u = session && db.get("usuarios").find({ id: session.id }).value();
    if (!u?.ativo || session.expires < Date.now()) {
      sessions.delete(token);
      return fail(res, 401, "Sua sessão expirou. Entre novamente.");
    }
    req.user = u;
    req.token = token;
    next();
  });
  app.post("/admin/usuarios", (req, res) => {
    if (req.user.perfil !== "ADMIN")
      return fail(res, 403, "Acesso restrito a administradores.");
    if (
      !["ADMIN", "CLIENTE"].includes(req.body.perfil) ||
      typeof req.body.ativo !== "boolean"
    )
      return fail(res, 422, "Informe perfil e situação válidos.");
    cadastrarUsuario(req, res);
  });
  app.get("/auth/me", (req, res) => res.json(safe(req.user)));
  app.post("/auth/logout", (req, res) => {
    sessions.delete(req.token);
    res.sendStatus(204);
  });
  app.get("/usuarios", (req, res) => {
    if (req.user.perfil !== "ADMIN")
      return fail(
        res,
        403,
        "Somente administradores podem consultar clientes.",
      );
    res.json(db.get("usuarios").value().map(safe));
  });
  app.use("/usuarios/:id", (req, res, next) => {
    if (
      String(req.user.id) !== req.params.id &&
      !(req.user.perfil === "ADMIN" && !req.path.endsWith("/senha"))
    )
      return fail(res, 403, "Você só pode acessar a própria conta.");
    next();
  });
  app.get("/usuarios/:id", (req, res) => {
    const usuario = db
      .get("usuarios")
      .find((u) => String(u.id) === req.params.id)
      .value();
    if (!usuario) return fail(res, 404, "Cliente não encontrado.");
    res.json(safe(usuario));
  });
  app.patch("/usuarios/:id", (req, res) => {
    const alvo = db
      .get("usuarios")
      .find((u) => String(u.id) === req.params.id)
      .value();
    if (!alvo) return fail(res, 404, "Cadastro inexistente.");
    const admin = req.user.perfil === "ADMIN";
    const perfil = admin ? (req.body.perfil ?? alvo.perfil) : alvo.perfil;
    const ativo = admin ? (req.body.ativo ?? alvo.ativo) : alvo.ativo;
    if (!["ADMIN", "CLIENTE"].includes(perfil) || typeof ativo !== "boolean")
      return fail(res, 422, "Informe perfil e status validos.");
    if (admin && !ativo && alvo.id === req.user.id)
      return fail(res, 409, "A conta em uso deve ser preservada.");
    if (
      alvo.perfil === "ADMIN" &&
      alvo.ativo &&
      (perfil !== "ADMIN" || !ativo) &&
      db
        .get("usuarios")
        .filter({ perfil: "ADMIN", ativo: true })
        .size()
        .value() <= 1
    )
      return fail(res, 409, "Preserve o ultimo administrador ativo.");
    const data = fields({ ...alvo, ...req.body }),
      error = validate(data, alvo.id);
    if (error) return fail(res, 422, error);
    res.json(
      safe(
        db
          .get("usuarios")
          .find({ id: alvo.id })
          .assign({
            ...data,
            perfil,
            ativo,
            atualizado_em: new Date().toISOString(),
          })
          .write(),
      ),
    );
  });
  app.patch("/usuarios/:id/senha", (req, res) => {
    if (!verify(String(req.body.senha_atual ?? ""), req.user.senha_hash))
      return fail(res, 422, "A senha atual está incorreta.");
    if (typeof req.body.senha !== "string" || req.body.senha.length < 8)
      return fail(res, 422, "A nova senha deve ter pelo menos 8 caracteres.");
    db.get("usuarios")
      .find({ id: req.user.id })
      .assign({
        senha_hash: hash(req.body.senha),
        atualizado_em: new Date().toISOString(),
      })
      .write();
    sessions.revokeUser(req.user.id, req.token);
    res.sendStatus(204);
  });
  app.delete("/usuarios/:id", (req, res) => {
    const alvo = db
      .get("usuarios")
      .find((u) => String(u.id) === req.params.id)
      .value();
    if (!alvo) return fail(res, 404, "Usuário não encontrado.");
    const admin = req.user.perfil === "ADMIN";
    if (
      alvo.perfil === "ADMIN" &&
      alvo.ativo &&
      db
        .get("usuarios")
        .filter({ perfil: "ADMIN", ativo: true })
        .size()
        .value() <= 1
    )
      return fail(
        res,
        409,
        "O último administrador ativo não pode ser excluído.",
      );
    if (admin && alvo.id === req.user.id)
      return fail(res, 409, "A conta em uso não pode ser excluída.");
    const orders = db
      .get("pedidos")
      .value()
      .some((p) => String(p.id_usuario) === String(alvo.id));
    if (orders && admin)
      return fail(
        res,
        409,
        "Este usuário tem pedidos. Inative o cadastro para preservar o histórico.",
      );
    if (orders)
      db.get("usuarios")
        .find({ id: alvo.id })
        .assign({ ativo: false, atualizado_em: new Date().toISOString() })
        .write();
    else {
      if (db.has("avaliacoes").value())
        db.get("avaliacoes")
          .remove((a) => String(a.id_usuario) === String(alvo.id))
          .write();
      db.get("usuarios").remove({ id: alvo.id }).write();
    }
    sessions.revokeUser(alvo.id);
    res.json({
      message: orders
        ? "Conta inativada. O histórico de pedidos foi preservado."
        : "Conta excluída com sucesso.",
    });
  });
  app.use("/usuarios", (req, res) => fail(res, 403, "Operação não permitida."));
  app.use("/auth", (req, res) => fail(res, 404, "Rota não encontrada."));
  app.use(router);
  return app;
}
if (require.main === module)
  createServer().listen(3000, "localhost", () =>
    console.log("API em http://localhost:3000"),
  );
module.exports = { createServer };
