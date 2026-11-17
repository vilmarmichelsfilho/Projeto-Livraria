<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import pedidosService, {
  erroClientePedido,
  moedaPedido,
  dataPedido,
  statusPedido,
} from '@/services/clientePedidosService';
import usuarios from '@/services/usuariosService';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
import ClientePedidoDialog from '@/components/pedidos/ClientePedidoDialog.vue';
const pedidos = ref([]),
  usuario = ref(null),
  carregando = ref(true),
  erro = ref(''),
  pesquisa = ref(''),
  filtro = ref(''),
  pagina = ref(1),
  selecionado = ref(null),
  busy = ref(false),
  erroExclusao = ref('');
const porPagina = 6;
const filtrados = computed(() =>
  pedidos.value
    .filter(
      (pedido) =>
        (!filtro.value || pedido.status === filtro.value) &&
        String(pedido.id).includes(pesquisa.value.trim().replace(/^#/, '')),
    )
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)),
);
const paginas = computed(() =>
  Math.max(1, Math.ceil(filtrados.value.length / porPagina)),
);
const paginaAtual = computed(() => Math.min(pagina.value, paginas.value));
const visiveis = computed(() =>
  filtrados.value.slice(
    (paginaAtual.value - 1) * porPagina,
    paginaAtual.value * porPagina,
  ),
);
const destino = (pedido) =>
  pedido.status === 'RASCUNHO'
    ? `/checkout/revisao?id=${pedido.id}`
    : `/meus-pedidos/${pedido.id}`;
watch([pesquisa, filtro], () => {
  pagina.value = 1;
});
async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    [pedidos.value, usuario.value] = await Promise.all([
      pedidosService.listar(),
      usuarios.atual(),
    ]);
  } catch (error) {
    erro.value = erroClientePedido(error);
  } finally {
    carregando.value = false;
  }
}
async function excluir() {
  if (busy.value) return;
  busy.value = true;
  erroExclusao.value = '';
  try {
    await pedidosService.excluir(selecionado.value.id);
    pedidos.value = pedidos.value.filter(
      (pedido) => pedido.id !== selecionado.value.id,
    );
    if (
      sessionStorage.getItem('iflibrary_checkout_id') ===
      String(selecionado.value.id)
    )
      sessionStorage.removeItem('iflibrary_checkout_id');
    selecionado.value = null;
  } catch (error) {
    erroExclusao.value = erroClientePedido(error);
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
</script>
<template>
  <main class="cliente-pedidos">
    <header class="cliente-pagina-header">
      <h1>Meus pedidos</h1>
      <p class="cliente-desktop">
        Consulte seu histórico e continue os pedidos em rascunho
      </p>
      <p class="cliente-mobile">Acompanhe suas compras.</p>
    </header>
    <div class="cliente-filtros">
      <label class="cliente-campo cliente-desktop"
        ><span>Pesquisa</span>
        <div class="cliente-pesquisa">
          <input
            v-model="pesquisa"
            type="search"
            placeholder="Número do pedido"
          /><v-icon icon="mdi-magnify" /></div></label
      ><label class="cliente-campo cliente-mobile"
        ><span>Filtrar por situação</span
        ><select v-model="filtro">
          <option value="">Todos</option>
          <option
            v-for="(nome, status) in statusPedido"
            :key="status"
            :value="status"
          >
            {{ nome }}
          </option>
        </select></label
      >
    </div>
    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Carregando seus pedidos…"
    /><EstadoRequisicao
      v-else-if="erro"
      tipo="erro"
      :mensagem="erro"
      tentar-novamente
      @tentar="carregar"
    />
    <template v-else
      ><div
        v-if="visiveis.length"
        class="cliente-tabela-wrap cliente-desktop"
      >
        <table
          class="cliente-tabela cliente-pedidos-tabela"
          aria-label="Meus pedidos"
        >
          <thead>
            <tr>
              <th scope="col">Pedido</th>
              <th scope="col">Data</th>
              <th scope="col">Status</th>
              <th scope="col">Total</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pedido in visiveis"
              :key="pedido.id"
            >
              <td>#{{ pedido.id }}</td>
              <td>{{ dataPedido(pedido.criado_em) }}</td>
              <td>
                <span
                  class="cliente-badge"
                  :class="pedido.status.toLowerCase()"
                  >{{ statusPedido[pedido.status] }}</span
                >
              </td>
              <td>{{ moedaPedido(pedido.total) }}</td>
              <td>
                <div class="cliente-tabela-acoes">
                  <RouterLink
                    :to="destino(pedido)"
                    :aria-label="`Consultar pedido ${pedido.id}`"
                    ><v-icon icon="mdi-eye-outline" /></RouterLink
                  ><RouterLink
                    v-if="pedido.status === 'RASCUNHO'"
                    :to="destino(pedido)"
                    :aria-label="`Editar pedido ${pedido.id}`"
                    ><v-icon icon="mdi-pencil" /></RouterLink
                  ><button
                    v-if="pedido.status === 'RASCUNHO'"
                    type="button"
                    :aria-label="`Excluir pedido ${pedido.id}`"
                    @click="
                      selecionado = pedido;
                      erroExclusao = '';
                    "
                  >
                    <v-icon icon="mdi-delete" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="cliente-pedido-cards cliente-mobile">
        <article
          v-for="pedido in visiveis"
          :key="pedido.id"
          class="cliente-pedido-card"
        >
          <div class="cliente-pedido-card-titulo">
            <h2>Pedido #{{ pedido.id }}</h2>
            <span
              class="cliente-badge"
              :class="pedido.status.toLowerCase()"
              >{{ statusPedido[pedido.status] }}</span
            >
          </div>
          <p class="cliente-pedido-card-meta">
            {{ usuario?.nome }} • {{ dataPedido(pedido.criado_em) }}
          </p>
          <strong>Total: {{ moedaPedido(pedido.total) }}</strong
          ><RouterLink
            :to="destino(pedido)"
            class="cliente-botao secundario"
            >Consultar pedido</RouterLink
          ><button
            v-if="pedido.status === 'RASCUNHO'"
            type="button"
            class="cliente-excluir-link"
            @click="
              selecionado = pedido;
              erroExclusao = '';
            "
          >
            Excluir rascunho
          </button>
        </article>
      </div>
      <section
        v-if="!visiveis.length"
        class="cliente-vazio"
      >
        <h2>
          {{
            filtro || pesquisa
              ? 'Nenhum pedido encontrado'
              : 'Você ainda não tem pedidos'
          }}
        </h2>
        <p>
          {{
            filtro || pesquisa
              ? 'Tente outra situação ou outro número de pedido.'
              : 'Encontre sua próxima leitura na nossa loja.'
          }}
        </p>
        <RouterLink
          v-if="!filtro && !pesquisa"
          to="/"
          class="cliente-botao"
          >Explorar livros</RouterLink
        >
      </section>
      <nav
        v-if="visiveis.length"
        class="cliente-paginacao"
        aria-label="Paginação dos pedidos"
      >
        <p class="cliente-desktop">
          Exibindo {{ visiveis.length }} de {{ filtrados.length }} pedidos
        </p>
        <div>
          <button
            v-if="paginaAtual > 1"
            type="button"
            class="cliente-botao secundario"
            @click="pagina = paginaAtual - 1"
          >
            Anterior</button
          ><span
            class="cliente-mobile"
            aria-live="polite"
            >Página {{ paginaAtual }} de {{ paginas }}</span
          ><button
            v-if="paginas > 1"
            type="button"
            class="cliente-botao secundario"
            :disabled="paginaAtual >= paginas"
            @click="pagina = paginaAtual + 1"
          >
            Próxima
          </button>
        </div>
      </nav></template
    >
    <ClientePedidoDialog
      v-if="selecionado"
      titulo="Excluir rascunho?"
      acao="Excluir rascunho"
      :busy="busy"
      :erro="erroExclusao"
      @close="selecionado = null"
      @confirm="excluir"
      ><p>
        O pedido #{{ selecionado.id }} será removido. Esta ação não pode ser
        desfeita.
      </p></ClientePedidoDialog
    >
  </main>
</template>
