import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';
import { createServer as criarVite } from 'vite';

test('preserva avaliações distintas de um livro e aplica autoria na edição e exclusão', async (t) => {
  const pasta = await mkdtemp(join(tmpdir(), 'livraria-avaliacoes-'));
  const arquivo = join(pasta, 'db.json');
  const armazenamento = Object.getOwnPropertyDescriptor(
    globalThis,
    'sessionStorage',
  );
  const apiAnterior = process.env.VITE_API_URL;
  let servidor;
  let vite;
  t.after(async () => {
    await vite?.close();
    if (servidor) await new Promise((resolve) => servidor.close(resolve));
    if (armazenamento) {
      Object.defineProperty(globalThis, 'sessionStorage', armazenamento);
    } else {
      delete globalThis.sessionStorage;
    }
    if (apiAnterior === undefined) delete process.env.VITE_API_URL;
    else process.env.VITE_API_URL = apiAnterior;
    await rm(pasta, { recursive: true, force: true });
  });

  const data = '2026-11-13T12:00:00.000Z';
  await writeFile(
    arquivo,
    JSON.stringify({
      livros: [{ id: 1, titulo: 'Livro fictício', ativo: true }],
      usuarios: [
        { id: 1, nome: 'Administrador', perfil: 'ADMIN', ativo: true },
        { id: 2, nome: 'Leitora fictícia', perfil: 'CLIENTE', ativo: true },
        { id: 3, nome: 'Leitor fictício', perfil: 'CLIENTE', ativo: true },
      ],
      avaliacoes: [
        {
          id: 1,
          id_livro: 1,
          id_usuario: 2,
          nota: 5,
          comentario: '',
          criado_em: data,
        },
      ],
    }),
  );
  const app = jsonServer.create();
  app.use(jsonServer.bodyParser, jsonServer.router(arquivo));
  servidor = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => servidor.once('listening', resolve));
  process.env.VITE_API_URL = 'http://127.0.0.1:' + servidor.address().port;
  let idUsuario = null;
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: { getItem: () => idUsuario },
    configurable: true,
  });
  vite = await criarVite({
    configFile: false,
    cacheDir: join(pasta, 'vite'),
    resolve: {
      alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) },
    },
    server: { middlewareMode: true, watch: null, ws: false },
  });
  const { avaliacoes, carregarAvaliacoes, excluirAvaliacao, salvarAvaliacao } =
    await vite.ssrLoadModule('/src/services/avaliacoesService.js');

  assert.equal(await carregarAvaliacoes(), true);
  assert.equal(avaliacoes.value[0].autor, 'Leitora fictícia');
  await assert.rejects(salvarAvaliacao(1, 4, ''), /Entre na sua conta/);

  idUsuario = '3';
  const nova = await salvarAvaliacao(1, 4, 'Comentário fictício');
  assert.notEqual(nova.id, 1);
  assert.equal(nova.id_usuario, 3);
  await assert.rejects(
    excluirAvaliacao(1),
    /só pode excluir a própria avaliação/,
  );

  idUsuario = '2';
  const editada = await salvarAvaliacao(1, 3, 'Comentário editado');
  assert.equal(editada.id, 1);
  assert.equal(editada.criado_em, data);
  assert.equal(avaliacoes.value.length, 2);
  await excluirAvaliacao(1);
  assert.equal(avaliacoes.value[0].id, nova.id);

  idUsuario = '1';
  await assert.rejects(salvarAvaliacao(1, 5, ''), /conta de cliente/);
  await excluirAvaliacao(nova.id);
  assert.equal(avaliacoes.value.length, 0);
});
