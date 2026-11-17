const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { scryptSync } = require('node:crypto');
const { createServer } = require('../server.cjs');
let server, base, token;
const senha = 'TestePedidos123!';
const hash =
  'scrypt:pedidos:' + scryptSync(senha, 'pedidos', 64).toString('hex');
async function request(route, method = 'GET', body, auth = token) {
  const response = await fetch(base + route, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: 'Bearer ' + auth } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    data: response.status === 204 ? null : await response.json(),
  };
}
before(async () => {
  const usuario = (id) => ({
    id,
    nome: `Cliente ${id}`,
    email: `cliente${id}@example.test`,
    senha_hash: hash,
    perfil: 'CLIENTE',
    ativo: true,
    telefone: '47999990000',
    endereco: 'Rua das Flores, 120',
    cidade: 'Joinville',
    uf: 'SC',
    cep: '89200000',
  });
  server = createServer({
    usuarios: [usuario(1), usuario(2)],
    livros: [
      {
        id: 1,
        titulo: 'Sombra e Ossos',
        preco: 44.9,
        estoque: 10,
        ativo: true,
      },
      { id: 2, titulo: 'Coraline', preco: 52.72, estoque: 5, ativo: true },
    ],
    pedidos: [
      {
        id: 1,
        id_usuario: 2,
        status: 'RECEBIDO',
        total: 44.9,
        itens: [{ id_livro: 1, quantidade: 1, preco_unitario: '44.90' }],
      },
    ],
  }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  token = (
    await request(
      '/auth/login',
      'POST',
      { email: 'cliente1@example.test', senha },
      null,
    )
  ).data.token;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
});
const itens = [
  { id_livro: 1, quantidade: 2 },
  { id_livro: 2, quantidade: 1 },
];
test('sessão e propriedade são exigidas para consultar e alterar pedidos', async () => {
  assert.equal(
    (await request('/cliente/pedidos', 'GET', null, null)).status,
    401,
  );
  assert.deepEqual((await request('/cliente/pedidos?id_usuario=2')).data, []);
  assert.equal((await request('/cliente/pedidos/1')).status, 404);
  assert.equal((await request('/cliente/pedidos/1', 'DELETE')).status, 404);
  assert.equal(
    (await request('/cliente/pedidos/1/confirmar', 'POST', { total: 44.9 }))
      .status,
    404,
  );
});
test('rascunho usa proprietário, preços e total do servidor sem reduzir estoque', async () => {
  const criado = await request('/cliente/pedidos', 'POST', {
    id_usuario: 2,
    status: 'RECEBIDO',
    total: 0.01,
    itens: itens.map((item) => ({ ...item, preco_unitario: '.01' })),
  });
  assert.equal(criado.status, 201);
  assert.equal(criado.data.id_usuario, 1);
  assert.equal(criado.data.status, 'RASCUNHO');
  assert.equal(criado.data.total, 142.52);
  assert.equal(criado.data.itens[0].preco_unitario, '44.90');
  assert.equal((await request('/livros/1')).data.estoque, 10);
  assert.equal((await request('/cliente/pedidos')).data.length, 1);
  assert.equal(
    (await request(`/cliente/pedidos/${criado.data.id}`, 'DELETE')).status,
    204,
  );
});
test('itens vazios, repetidos e quantidades inválidas são rejeitados', async () => {
  for (const invalidos of [
    [],
    [{ id_livro: 1, quantidade: 0 }],
    [{ id_livro: 1, quantidade: 1.5 }],
    [{ id_livro: 1, quantidade: 11 }],
    [{ id_livro: 999, quantidade: 1 }],
    [
      { id_livro: 1, quantidade: 1 },
      { id_livro: 1, quantidade: 2 },
    ],
  ]) {
    assert.equal(
      (await request('/cliente/pedidos', 'POST', { itens: invalidos })).status,
      422,
    );
  }
});
test('confirmação e cancelamento alteram estoque uma única vez e preservam histórico', async () => {
  const pedido = (await request('/cliente/pedidos', 'POST', { itens })).data;
  const confirmado = await request(
    `/cliente/pedidos/${pedido.id}/confirmar`,
    'POST',
    { total: 142.52 },
  );
  assert.equal(confirmado.status, 200);
  assert.equal(confirmado.data.status, 'RECEBIDO');
  assert.ok(confirmado.data.confirmado_em);
  assert.equal((await request('/livros/1')).data.estoque, 8);
  assert.equal((await request('/livros/2')).data.estoque, 4);
  assert.equal(
    (
      await request(`/cliente/pedidos/${pedido.id}/confirmar`, 'POST', {
        total: 142.52,
      })
    ).status,
    409,
  );
  assert.equal(
    (await request(`/cliente/pedidos/${pedido.id}`, 'DELETE')).status,
    409,
  );
  assert.equal(
    (await request(`/cliente/pedidos/${pedido.id}`, 'PATCH', { itens })).status,
    409,
  );
  assert.equal(
    (await request(`/cliente/pedidos/${pedido.id}/cancelar`, 'POST')).data
      .status,
    'CANCELADO',
  );
  assert.equal(
    (await request(`/cliente/pedidos/${pedido.id}/cancelar`, 'POST')).status,
    409,
  );
  assert.equal((await request('/livros/1')).data.estoque, 10);
  assert.equal((await request('/livros/2')).data.estoque, 5);
  const historico = (await request(`/cliente/pedidos/${pedido.id}`)).data;
  assert.equal(historico.total, 142.52);
  assert.equal(historico.itens.length, 2);
});
test('mudança de preço ou estoque impede confirmação sem alterar o pedido', async () => {
  const pedido = (await request('/cliente/pedidos', 'POST', { itens })).data;
  await request('/livros/1', 'PATCH', { preco: 50 });
  assert.equal(
    (
      await request(`/cliente/pedidos/${pedido.id}/confirmar`, 'POST', {
        total: 142.52,
      })
    ).status,
    409,
  );
  assert.equal(
    (await request(`/cliente/pedidos/${pedido.id}`)).data.status,
    'RASCUNHO',
  );
  assert.equal((await request('/livros/1')).data.estoque, 10);
  await request('/livros/1', 'PATCH', { estoque: 1 });
  assert.equal(
    (
      await request(`/cliente/pedidos/${pedido.id}/confirmar`, 'POST', {
        total: 152.72,
      })
    ).status,
    422,
  );
  assert.equal((await request('/livros/2')).data.estoque, 5);
  await request('/livros/1', 'PATCH', { estoque: 10, preco: 44.9 });
});
test('cancelamento é bloqueado após começar a separação', async () => {
  const pedido = (
    await request('/cliente/pedidos', 'POST', {
      itens: [{ id_livro: 1, quantidade: 1 }],
    })
  ).data;
  await request(`/cliente/pedidos/${pedido.id}/confirmar`, 'POST', {
    total: 44.9,
  });
  await request(`/pedidos/${pedido.id}`, 'PATCH', { status: 'EM_SEPARACAO' });
  assert.equal(
    (await request(`/cliente/pedidos/${pedido.id}/cancelar`, 'POST')).status,
    409,
  );
  assert.equal((await request('/livros/1')).data.estoque, 9);
});
