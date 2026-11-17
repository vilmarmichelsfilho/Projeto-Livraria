const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes, scryptSync } = require("node:crypto");
const { createServer } = require("../server.cjs");
test("administracao de usuarios preserva permissoes, pedidos e ultimo administrador", async () => {
  const salt = randomBytes(16).toString("hex");
  const senha_hash = `scrypt:${salt}:${scryptSync("Senha123!", salt, 64).toString("hex")}`;
  const dados = {
    nome: "Admin",
    email: "admin@test.com",
    telefone: "47999990000",
    endereco: "Rua A",
    cidade: "Joinville",
    uf: "SC",
    cep: "89200000",
    perfil: "ADMIN",
    ativo: true,
    senha_hash,
  };
  const app = createServer({
    usuarios: [{ ...dados, id: 1 }],
    pedidos: [],
    avaliacoes: [],
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  let token;
  async function req(path, method = "GET", body) {
    const r = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: r.status, data: await r.json() };
  }
  try {
    token = (
      await req("/auth/login", "POST", {
        email: dados.email,
        senha: "Senha123!",
      })
    ).data.token;
    const criado = await req("/admin/usuarios", "POST", {
      ...dados,
      email: "cliente@test.com",
      perfil: "CLIENTE",
      senha: "Senha123!",
    });
    assert.equal(criado.status, 201);
    assert.equal(criado.data.senha_hash, undefined);
    const id = criado.data.id;
    assert.equal(
      (await req(`/usuarios/${id}`, "PATCH", { nome: "Cliente atualizado" }))
        .data.nome,
      "Cliente atualizado",
    );
    assert.equal((await req("/auth/me")).data.nome, "Admin");
    assert.equal(
      (await req("/usuarios/1", "PATCH", { perfil: "CLIENTE" })).status,
      409,
    );
    assert.equal((await req("/usuarios/1", "DELETE")).status, 409);
    await req("/pedidos", "POST", { id_usuario: id, status: "RASCUNHO" });
    assert.equal((await req(`/usuarios/${id}`, "DELETE")).status, 409);
    assert.equal(
      (await req(`/usuarios/${id}`, "PATCH", { ativo: false })).data.ativo,
      false,
    );
    assert.equal((await req("/pedidos")).data.length, 1);
    const livre = (
      await req("/admin/usuarios", "POST", {
        ...dados,
        email: "livre@test.com",
        perfil: "CLIENTE",
        senha: "Senha123!",
      })
    ).data;
    await req("/avaliacoes", "POST", { id_usuario: livre.id, nota: 5 });
    assert.equal((await req(`/usuarios/${livre.id}`, "DELETE")).status, 200);
    assert.equal((await req("/avaliacoes")).data.length, 0);
    await req(`/usuarios/${id}`, "PATCH", { ativo: true });
    token = (
      await req("/auth/login", "POST", {
        email: "cliente@test.com",
        senha: "Senha123!",
      })
    ).data.token;
    assert.equal(
      (
        await req("/admin/usuarios", "POST", {
          ...dados,
          email: "invasor@test.com",
          senha: "Senha123!",
        })
      ).status,
      403,
    );
    assert.equal(
      (await req("/usuarios/1", "PATCH", { nome: "Outro" })).status,
      403,
    );
  } finally {
    await new Promise((r) => server.close(r));
  }
});
