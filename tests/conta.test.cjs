const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createServer } = require("../server.cjs");
let server, base, dir, file, token, id;
const password = "MinhaSenha123!";
async function request(route, method = "GET", body, auth = token) {
  const response = await fetch(base + route, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: "Bearer " + auth } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return {
    status: response.status,
    data: text && response.status !== 204 ? JSON.parse(text) : null,
  };
}
before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "iflibrary-test-"));
  file = path.join(dir, "db.json");
  fs.writeFileSync(
    file,
    JSON.stringify({ usuarios: [], pedidos: [], avaliacoes: [], livros: [] }),
  );
  server = createServer(file).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dir, { recursive: true, force: true });
});
test("cadastro normaliza e gera chave, defaults, datas e hash sem expor senha", async () => {
  const r = await request("/usuarios", "POST", {
    nome: " Marina Costa ",
    telefone: "(47) 99999-0000",
    endereco: "Rua das Flores, 120",
    cidade: "Joinville",
    uf: "SC",
    cep: "01234567",
    email: " MARINA@EXAMPLE.COM ",
    senha: password,

    perfil: "ADMIN",
    ativo: false,
  });
  assert.equal(r.status, 201);
  id = r.data.id;
  assert.equal(r.data.id_usuario, id);
  assert.equal(r.data.nome, "Marina Costa");
  assert.equal(r.data.email, "marina@example.com");
  assert.equal(r.data.cep, "01234567");
  assert.equal(r.data.perfil, "CLIENTE");
  assert.equal(r.data.ativo, true);
  assert.ok(r.data.criado_em);
  assert.equal(r.data.senha_hash, undefined);
  const stored = JSON.parse(fs.readFileSync(file)).usuarios[0];
  assert.match(stored.senha_hash, /^scrypt:/);
  assert.equal(stored.senha, undefined);
  assert.ok(!stored.senha_hash.includes(password));
});
test("validação impede duplicidade, nome vazio, senha curta, CEP e UF inválidos", async () => {
  const valid = {
    nome: "Outra",
    email: "outra@example.com",
    senha: password,
    telefone: "47999990000",
    endereco: "Rua das Flores, 120",
    cidade: "Joinville",
    uf: "SC",
    cep: "01234567",
  };
  for (const patch of [
    { email: " Marina@example.com " },
    { nome: " " },
    { telefone: " " },
    { endereco: " " },
    { cidade: " " },
    { uf: " " },
    { cep: " " },
    { senha: "1234567" },
    { cep: "123" },
    { uf: "XX" },
  ])
    assert.equal(
      (await request("/usuarios", "POST", { ...valid, ...patch })).status,
      422,
    );
});
test("login rejeita senha errada e aceita e-mail normalizado", async () => {
  assert.equal(
    (
      await request("/auth/login", "POST", {
        email: "marina@example.com",
        senha: "errada",
      })
    ).status,
    401,
  );
  const r = await request("/auth/login", "POST", {
    email: " MARINA@EXAMPLE.COM ",
    senha: password,
  });
  assert.equal(r.status, 200);
  token = r.data.token;
  assert.ok(token);
});
test("dados exigem sessão e bloqueiam outro usuário e exposição do banco", async () => {
  assert.equal((await request("/auth/me", "GET", undefined, null)).status, 401);
  assert.equal((await request("/usuarios/999")).status, 403);
  assert.equal(
    (await request("/usuarios/999", "PATCH", { nome: "Intruso" })).status,
    403,
  );
  assert.equal((await request("/db")).status, 403);
  assert.equal((await request("/pedidos?_expand=usuario")).status, 403);
  assert.equal((await request("/auth/me")).data.email, "marina@example.com");
});
test("avaliações públicas exibem o nome do leitor sem abrir a lista de usuários", async () => {
  const vinculos = [
    [1, String(id)],
    [1, 999],
    [2, id],
  ];
  for (const [livro, usuario] of vinculos) {
    const avaliacao = await request(
      "/avaliacoes",
      "POST",
      { id_livro: livro, id_usuario: usuario, nota: 5 },
      null,
    );
    assert.equal(avaliacao.status, 201);
  }

  const r = await request("/avaliacoes?id_livro=1", "GET", undefined, null);
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.map((avaliacao) => avaliacao.nome), [
    "Marina Costa",
    "Leitor",
  ]);
  for (const avaliacao of r.data) {
    assert.equal(avaliacao.email, undefined);
    assert.equal(avaliacao.senha_hash, undefined);
    assert.equal(avaliacao.endereco, undefined);
  }
  assert.equal(
    (await request("/usuarios", "GET", undefined, null)).status,
    401,
  );
});
test("PATCH persiste dados, preserva CEP e impede promoção de perfil", async () => {
  const r = await request("/usuarios/" + id, "PATCH", {
    nome: "Marina Atualizada",
    cidade: "Joinville",
    uf: "sc",
    cep: "00123000",
    perfil: "ADMIN",
    ativo: false,
    senha_hash: "fake",
    criado_em: "fake",
  });
  assert.equal(r.status, 200);
  assert.equal(r.data.perfil, "CLIENTE");
  assert.equal(r.data.ativo, true);
  assert.equal(r.data.uf, "SC");
  assert.equal(r.data.cep, "00123000");
  assert.notEqual(r.data.criado_em, "fake");
  assert.equal((await request("/auth/me")).data.nome, "Marina Atualizada");
  assert.equal(
    JSON.parse(fs.readFileSync(file)).usuarios[0].nome,
    "Marina Atualizada",
  );
});
test("troca de senha confere senha atual e invalida senha anterior", async () => {
  assert.equal(
    (
      await request("/usuarios/" + id + "/senha", "PATCH", {
        senha_atual: "errada",
        senha: "NovaSenha123",
      })
    ).status,
    422,
  );
  assert.equal(
    (
      await request("/usuarios/" + id + "/senha", "PATCH", {
        senha_atual: password,
        senha: "curta",
      })
    ).status,
    422,
  );
  assert.equal(
    (
      await request("/usuarios/" + id + "/senha", "PATCH", {
        senha_atual: password,
        senha: "NovaSenha123",
      })
    ).status,
    204,
  );
  assert.equal(
    (
      await request("/auth/login", "POST", {
        email: "marina@example.com",
        senha: password,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/auth/login", "POST", {
        email: "marina@example.com",
        senha: "NovaSenha123",
      })
    ).status,
    200,
  );
});
test("logout invalida token", async () => {
  assert.equal((await request("/auth/logout", "POST")).status, 204);
  assert.equal((await request("/auth/me")).status, 401);
  token = (
    await request("/auth/login", "POST", {
      email: "marina@example.com",
      senha: "NovaSenha123",
    })
  ).data.token;
});
test("conta sem pedidos é excluída e sessão revogada", async () => {
  assert.equal((await request("/usuarios/" + id, "DELETE")).status, 200);
  assert.equal(JSON.parse(fs.readFileSync(file)).usuarios.length, 0);
  assert.equal((await request("/auth/me")).status, 401);
});
test("conta com pedidos é inativada, histórico preservado e login bloqueado", async () => {
  const r = await request("/usuarios", "POST", {
    nome: "Cliente",
    telefone: "(47) 99999-0000",
    endereco: "Rua das Flores, 120",
    cidade: "Joinville",
    uf: "SC",
    cep: "01234567",
    email: "cliente@example.com",
    senha: password,
  });
  id = r.data.id;
  token = (
    await request("/auth/login", "POST", {
      email: "cliente@example.com",
      senha: password,
    })
  ).data.token;
  // Usar a API de pedidos da demonstração para criar o vínculo sem tocar no banco real.
  assert.equal(
    (await request("/pedidos", "POST", { id_usuario: id, status: "RECEBIDO" }))
      .status,
    201,
  );
  assert.equal((await request("/usuarios/" + id, "DELETE")).status, 200);
  const db = JSON.parse(fs.readFileSync(file));
  assert.equal(db.usuarios[0].ativo, false);
  assert.equal(db.pedidos.length, 1);
  assert.equal(
    (
      await request("/auth/login", "POST", {
        email: "cliente@example.com",
        senha: password,
      })
    ).status,
    403,
  );
  assert.equal((await request("/auth/me")).status, 401);
});
