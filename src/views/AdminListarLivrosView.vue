<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { API_URL, lerResposta, mensagemErro } from '@/utils/api';
import { formataPreco } from '@/utils/produtosUtils';
import { generos, normalizarTexto } from '@/utils/livrosUtils';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
import ConfirmacaoExclusao from '@/components/ConfirmacaoExclusao.vue';

const route = useRoute();
const router = useRouter();
const livros = ref([]);
const total = ref(0);
const carregando = ref(true);
const erro = ref('');
const sucesso = ref('');
const livroSelecionado = ref(null);
const busca = ref(String(route.query.q || ''));
const genero = ref(String(route.query.genero || ''));
const ativo = ref(String(route.query.ativo || ''));
const disponibilidade = ref(String(route.query.disponibilidade || ''));
const limite = 8;
let consultaAtual = 0;

if (route.query.resultado === 'excluido') {
  sucesso.value = 'Livro e suas avaliações excluídos com sucesso.';
}

function pagina() {
  return Math.max(1, Number(route.query.pagina) || 1);
}

async function carregar() {
  // Se houver duas pesquisas, somente a resposta mais recente altera a lista.
  const consulta = ++consultaAtual;
  carregando.value = true;
  erro.value = '';

  try {
    const resposta = await fetch(`${API_URL}/livros`);
    let dados = await lerResposta(resposta);
    const filtros = route.query;
    if (filtros.q) {
      const busca = normalizarTexto(filtros.q);
      dados = dados.filter((livro) =>
        [livro.titulo, livro.autor, livro.genero, livro.id].some((valor) =>
          normalizarTexto(valor).includes(busca),
        ),
      );
    }
    if (filtros.genero)
      dados = dados.filter((livro) => livro.genero === filtros.genero);
    if (filtros.ativo)
      dados = dados.filter((livro) => String(livro.ativo) === filtros.ativo);
    if (filtros.disponibilidade === 'disponivel')
      dados = dados.filter((livro) => livro.estoque > 0);
    if (filtros.disponibilidade === 'esgotado')
      dados = dados.filter((livro) => livro.estoque === 0);
    if (filtros.disponibilidade === 'baixo')
      dados = dados.filter((livro) => livro.estoque <= livro.estoque_minimo);
    if (consulta !== consultaAtual) return;

    total.value = dados.length;
    const inicio = (pagina() - 1) * limite;
    livros.value = dados.slice(inicio, inicio + limite);

    if (livros.value.length === 0 && pagina() > 1 && total.value > 0) {
      await mudarPagina(Math.ceil(total.value / limite));
    }
  } catch (e) {
    if (consulta === consultaAtual) erro.value = mensagemErro(e);
  } finally {
    if (consulta === consultaAtual) carregando.value = false;
  }
}

function aplicarFiltros() {
  const query = {};
  if (busca.value.trim()) query.q = busca.value.trim();
  if (genero.value) query.genero = genero.value;
  if (ativo.value) query.ativo = ativo.value;
  if (disponibilidade.value) query.disponibilidade = disponibilidade.value;
  router.replace({ query });
}

function mudarPagina(numero) {
  return router.replace({ query: { ...route.query, pagina: numero } });
}

async function atualizarLista(inativado) {
  livroSelecionado.value = null;
  sucesso.value = inativado
    ? 'Livro inativado com sucesso. O histórico foi preservado.'
    : 'Livro e suas avaliações excluídos com sucesso.';
  await carregar();
}

watch(
  () => route.query,
  () => {
    busca.value = String(route.query.q || '');
    genero.value = String(route.query.genero || '');
    ativo.value = String(route.query.ativo || '');
    disponibilidade.value = String(route.query.disponibilidade || '');
    carregar();
  },
);

onMounted(carregar);
</script>
<template>
  <section>
    <h1>Livros</h1>
    <p class="subtitulo">Gerencie o catálogo e a disponibilidade dos títulos</p>
    <EstadoRequisicao
      v-if="sucesso"
      tipo="sucesso"
      :mensagem="sucesso"
    />
    <form
      class="filtros-livros"
      @submit.prevent="aplicarFiltros"
    >
      <div class="campo pesquisa-admin">
        <label for="pesquisa-livro">Pesquisa</label>
        <div class="pesquisa-com-botao">
          <input
            id="pesquisa-livro"
            v-model="busca"
            type="search"
            placeholder="Título, autor, gênero ou ID"
          /><button
            class="btn secundario"
            type="submit"
            aria-label="Pesquisar livros"
          >
            <v-icon
              icon="mdi-magnify"
              size="18"
            />
          </button>
        </div>
      </div>
      <RouterLink
        :to="{ name: 'admin-livro-novo', query: { voltar: route.fullPath } }"
        class="btn cadastrar"
        ><v-icon
          icon="mdi-plus"
          size="18"
        />Cadastrar livro</RouterLink
      >
      <div class="filtros-secundarios">
        <div class="campo">
          <label for="filtro-genero">Gênero</label
          ><select
            id="filtro-genero"
            v-model="genero"
            @change="aplicarFiltros"
          >
            <option value="">Todos</option>
            <option
              v-for="item in generos"
              :key="item"
            >
              {{ item }}
            </option>
          </select>
        </div>
        <div class="campo">
          <label for="filtro-ativo">Situação</label
          ><select
            id="filtro-ativo"
            v-model="ativo"
            @change="aplicarFiltros"
          >
            <option value="">Todas</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
        <div class="campo">
          <label for="filtro-estoque">Estoque</label
          ><select
            id="filtro-estoque"
            v-model="disponibilidade"
            @change="aplicarFiltros"
          >
            <option value="">Todos</option>
            <option value="disponivel">Disponível</option>
            <option value="baixo">Estoque baixo</option>
            <option value="esgotado">Esgotado</option>
          </select>
        </div>
      </div>
    </form>
    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Carregando livros…"
    />
    <EstadoRequisicao
      v-else-if="erro"
      tipo="erro"
      :mensagem="erro"
      tentar-novamente
      @tentar="carregar"
    />
    <EstadoRequisicao
      v-else-if="!livros.length"
      mensagem="Nenhum livro encontrado. Ajuste os filtros ou cadastre um novo título."
    />
    <template v-else>
      <div
        class="tabela-livros"
        role="region"
        aria-label="Lista de livros; em telas pequenas, role para os lados"
        tabindex="0"
      >
        <table>
          <thead>
            <tr>
              <th scope="col">Livro</th>
              <th scope="col">Gênero</th>
              <th scope="col">Preço</th>
              <th scope="col">Estoque</th>
              <th scope="col">Status</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="livro in livros"
              :key="livro.id"
            >
              <td>
                <strong>{{ livro.titulo }}</strong
                ><small>{{ livro.autor }} · #{{ livro.id }}</small>
              </td>
              <td>{{ livro.genero }}</td>
              <td>{{ formataPreco(livro.preco) }}</td>
              <td>
                <span
                  :class="{
                    'estoque-baixo': livro.estoque <= livro.estoque_minimo,
                  }"
                  >{{ livro.estoque }}</span
                >
              </td>
              <td>
                <span
                  class="status-livro"
                  :class="{ inativo: !livro.ativo }"
                  >{{ livro.ativo ? 'Ativo' : 'Inativo' }}</span
                >
              </td>
              <td>
                <div class="acoes-tabela">
                  <RouterLink
                    :to="{
                      name: 'admin-livro',
                      params: { id: livro.id },
                      query: { voltar: route.fullPath },
                    }"
                    :aria-label="`Consultar ${livro.titulo}`"
                    title="Consultar"
                    ><v-icon
                      icon="mdi-eye"
                      size="18"
                  /></RouterLink>
                  <RouterLink
                    :to="{
                      name: 'admin-livro-editar',
                      params: { id: livro.id },
                      query: { voltar: route.fullPath },
                    }"
                    :aria-label="`Editar ${livro.titulo}`"
                    title="Editar"
                    ><v-icon
                      icon="mdi-pencil"
                      size="18"
                  /></RouterLink>
                  <button
                    type="button"
                    :aria-label="`Excluir ${livro.titulo}`"
                    title="Excluir"
                    @click="livroSelecionado = livro"
                  >
                    <v-icon
                      icon="mdi-delete"
                      size="18"
                      class="texto-perigo"
                    />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav
        class="paginacao"
        aria-label="Paginação de livros"
      >
        <p>
          Exibindo {{ (pagina() - 1) * limite + 1 }}–{{
            Math.min(pagina() * limite, total)
          }}
          de {{ total }} livros
        </p>
        <div>
          <button
            class="btn secundario"
            :disabled="pagina() <= 1"
            @click="mudarPagina(pagina() - 1)"
          >
            Anterior</button
          ><span>Página {{ pagina() }} de {{ Math.ceil(total / limite) }}</span
          ><button
            class="btn secundario"
            :disabled="pagina() * limite >= total"
            @click="mudarPagina(pagina() + 1)"
          >
            Próxima
          </button>
        </div>
      </nav>
    </template>
    <ConfirmacaoExclusao
      v-if="livroSelecionado"
      :livro="livroSelecionado"
      @cancelar="livroSelecionado = null"
      @excluido="atualizarLista(false)"
      @inativado="atualizarLista(true)"
    />
  </section>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.filtros-livros {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 22px;
  margin: 28px 0 34px;
}
.pesquisa-admin {
  flex: 0 1 500px;
}
.pesquisa-com-botao {
  display: flex;
}
.pesquisa-com-botao input {
  border-radius: 6px 0 0 6px;
}
.pesquisa-com-botao button {
  border-color: var(--livraria-borda);
  border-left: 0;
  border-radius: 0 6px 6px 0;
}
.filtros-secundarios {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 18px;
  width: 100%;
}
.tabela-livros {
  overflow-x: auto;
}
.tabela-livros table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  text-align: left;
  font-size: 14px;
}
.tabela-livros th {
  background: var(--livraria-azul);
  padding: 16px;
  font-weight: 700;
}
.tabela-livros th:first-child {
  border-radius: 7px 0 0 7px;
}
.tabela-livros th:last-child {
  border-radius: 0 7px 7px 0;
}
.tabela-livros td {
  padding: 16px;
  border-bottom: 1px solid var(--livraria-borda);
}
.tabela-livros tbody tr:nth-child(even) {
  background: var(--livraria-suave);
}
.tabela-livros td:first-child {
  width: 30%;
}
.tabela-livros strong {
  font-weight: 600;
}
.tabela-livros small {
  display: block;
  font-size: 12px;
  color: #53636a;
}
.status-livro {
  display: inline-block;
  background: var(--livraria-suave);
  color: var(--livraria-acao);
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 700;
}
.status-livro.inativo {
  background: #e4e9ec;
  color: #53636a;
}
.estoque-baixo {
  color: #974d08;
  font-weight: 700;
}
.acoes-tabela {
  display: flex;
  gap: 3px;
}
.acoes-tabela a,
.acoes-tabela button {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;
  background: transparent;
  width: 36px;
  height: 40px;
  cursor: pointer;
  border-radius: 5px;
}
.acoes-tabela .v-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.acoes-tabela a:hover,
.acoes-tabela button:hover {
  background: #d4e7ef;
}
.paginacao,
.paginacao > div {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}
.paginacao {
  margin-top: 30px;
  font-size: 14px;
  color: #53636a;
}
.paginacao .btn {
  font-size: 14px;
}
@media (max-width: 700px) {
  .filtros-livros {
    margin: 24px 0;
    gap: 16px;
  }
  .pesquisa-admin {
    flex-basis: 100%;
  }
  .filtros-secundarios {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .tabela-livros table {
    min-width: 800px;
  }
  .paginacao > div {
    width: 100%;
  }
  .paginacao span {
    font-size: 12px;
  }
}
</style>
