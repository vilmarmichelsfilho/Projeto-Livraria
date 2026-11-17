<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import ConfirmacaoExclusaoPedido from "@/components/admin/ConfirmacaoExclusaoPedido.vue";
import pedidosService, {
  situacoesPedido,
  moeda,
  erroPedido,
} from "@/services/pedidosService";
const router = useRouter();
const pedidos = ref([]),
  clientes = ref([]),
  pesquisa = ref(""),
  carregando = ref(true),
  erro = ref(""),
  sucesso = ref("");
const selecionado = ref(null),
  busy = ref(false),
  erroExclusao = ref("");
const filtroSituacao = ref(""),
  pagina = ref(1);
const porPagina = 6;
const nomeCliente = (pedido) =>
  clientes.value.find(
    (cliente) => String(cliente.id) === String(pedido.id_usuario),
  )?.nome || "Cliente não encontrado";
const normalizar = (valor) =>
  String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const filtrados = computed(() =>
  pedidos.value.filter(
    (pedido) =>
      (!filtroSituacao.value || pedido.status === filtroSituacao.value) &&
      normalizar(`${pedido.id} ${nomeCliente(pedido)}`).includes(
        normalizar(pesquisa.value.trim().replace(/^#/, "")),
      ),
  ),
);
const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(filtrados.value.length / porPagina)),
);
const paginaAtual = computed(() => Math.min(pagina.value, totalPaginas.value));
const pedidosPagina = computed(() =>
  filtrados.value.slice(
    (paginaAtual.value - 1) * porPagina,
    paginaAtual.value * porPagina,
  ),
);
watch([pesquisa, filtroSituacao], () => {
  pagina.value = 1;
});
const dataPedido = (pedido) =>
  new Date(pedido.criado_em).toLocaleDateString("pt-BR");
async function carregar() {
  carregando.value = true;
  erro.value = "";
  try {
    [pedidos.value, clientes.value] = await Promise.all([
      pedidosService.listar(),
      pedidosService.clientes(),
    ]);
  } catch (error) {
    erro.value = erroPedido(error);
  } finally {
    carregando.value = false;
  }
}
async function excluir() {
  if (busy.value) return;
  busy.value = true;
  erroExclusao.value = "";
  try {
    await pedidosService.excluir(selecionado.value.id);
    pedidos.value = pedidos.value.filter(
      (pedido) => pedido.id !== selecionado.value.id,
    );
    selecionado.value = null;
    sucesso.value = "Rascunho excluído com sucesso.";
  } catch (error) {
    erroExclusao.value = erroPedido(error);
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
</script>
<template>
  <section class="admin-page">
    <header class="admin-page-header">
      <h1>Pedidos</h1>
      <p class="admin-subtitle admin-desktop-only">
        Consulte e gerencie os registros.
      </p>
      <p class="admin-subtitle admin-mobile-only">
        Gerencie rascunhos e compras confirmadas.
      </p>
    </header>
    <p v-if="sucesso" class="admin-feedback" role="status">{{ sucesso }}</p>
    <div class="admin-search-row admin-desktop-only">
      <input
        v-model="pesquisa"
        type="search"
        placeholder="Buscar por nome ou identificador..."
        aria-label="Buscar por nome do cliente ou identificador do pedido"
      /><RouterLink class="admin-button" to="/admin/pedidos/novo"
        >Criar pedido</RouterLink
      >
    </div>
    <div class="admin-mobile-filters admin-mobile-only">
      <label class="admin-field"
        ><span>Buscar pedido</span
        ><input
          v-model="pesquisa"
          type="search"
          placeholder="Número ou cliente"
      /></label>
      <label class="admin-field"
        ><span>Situação</span
        ><select v-model="filtroSituacao">
          <option value="">Todos</option>
          <option
            v-for="(nome, valor) in situacoesPedido"
            :key="valor"
            :value="valor"
          >
            {{ nome }}
          </option>
        </select></label
      >
      <RouterLink class="admin-button" to="/admin/pedidos/novo"
        >Criar pedido em rascunho</RouterLink
      >
    </div>
    <p v-if="carregando" role="status">Carregando pedidos…</p>
    <div v-else-if="erro" class="admin-feedback error" role="alert">
      {{ erro }}
      <button class="admin-button-secondary" @click="carregar">
        Tentar novamente
      </button>
    </div>
    <div v-else class="admin-orders-results">
      <div class="admin-table-wrap admin-desktop-only">
        <table class="admin-table" aria-label="Pedidos">
          <thead>
            <tr>
              <th scope="col">Registro</th>
              <th scope="col">Cliente</th>
              <th scope="col">Situação / valor</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in filtrados" :key="pedido.id">
              <td>
                <RouterLink
                  class="admin-list-link"
                  :to="`/admin/pedidos/${pedido.id}`"
                  >#{{ pedido.id }}</RouterLink
                >
              </td>
              <td>{{ nomeCliente(pedido) }}</td>
              <td>
                {{ situacoesPedido[pedido.status] }}<br /><span>{{
                  moeda(pedido.total)
                }}</span>
              </td>
              <td>
                <RouterLink
                  class="admin-list-link"
                  :to="`/admin/pedidos/${pedido.id}`"
                  >Consultar</RouterLink
                ><br /><button
                  class="admin-text-danger"
                  @click="
                    selecionado = pedido;
                    erroExclusao = '';
                  "
                >
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="!filtrados.length">
              <td colspan="4">
                {{
                  pesquisa
                    ? "Nenhum pedido encontrado para esta busca."
                    : "Nenhum pedido cadastrado."
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-order-cards admin-mobile-only">
        <article
          v-for="pedido in pedidosPagina"
          :key="pedido.id"
          class="admin-order-card"
        >
          <div class="admin-order-card-heading">
            <h2>Pedido #{{ pedido.id }}</h2>
            <span class="admin-badge">{{
              situacoesPedido[pedido.status]
            }}</span>
          </div>
          <p class="admin-order-card-meta">
            {{ nomeCliente(pedido) }} • {{ dataPedido(pedido) }}
          </p>
          <p class="admin-order-card-total">Total: {{ moeda(pedido.total) }}</p>
          <RouterLink
            class="admin-button admin-button-secondary"
            :to="`/admin/pedidos/${pedido.id}`"
            >Consultar pedido</RouterLink
          >
          <div class="admin-order-card-actions">
            <RouterLink
              v-if="pedido.status === 'RASCUNHO'"
              class="admin-button admin-button-secondary"
              :to="`/admin/pedidos/${pedido.id}/editar`"
              >Editar rascunho</RouterLink
            ><button
              type="button"
              class="admin-button-danger"
              @click="
                selecionado = pedido;
                erroExclusao = '';
              "
            >
              Excluir
            </button>
          </div>
        </article>
        <p v-if="!filtrados.length" class="admin-items-empty">
          {{
            pesquisa || filtroSituacao
              ? "Nenhum pedido encontrado para estes filtros."
              : "Nenhum pedido cadastrado."
          }}
        </p>
        <nav
          v-if="filtrados.length"
          class="admin-pagination"
          aria-label="Paginação de pedidos"
        >
          <button
            v-if="totalPaginas > 1"
            type="button"
            aria-label="Página anterior"
            :disabled="paginaAtual === 1"
            @click="pagina = paginaAtual - 1"
          >
            ‹</button
          ><span aria-live="polite"
            >Página {{ paginaAtual }} de {{ totalPaginas }}</span
          ><button
            v-if="totalPaginas > 1"
            type="button"
            aria-label="Próxima página"
            :disabled="paginaAtual === totalPaginas"
            @click="pagina = paginaAtual + 1"
          >
            ›
          </button>
        </nav>
      </div>
    </div>
    <ConfirmacaoExclusaoPedido
      v-if="selecionado"
      :pedido="selecionado"
      :busy="busy"
      :erro="erroExclusao"
      @close="selecionado = null"
      @confirm="excluir"
      @view="router.push(`/admin/pedidos/${selecionado.id}`)"
    />
  </section>
</template>
