<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pedidosService, {
  erroClientePedido,
  moedaPedido,
  dataPedido,
  statusPedido,
  etapasCliente,
} from '@/services/clientePedidosService';
import ClientePedidoItens from '@/components/pedidos/ClientePedidoItens.vue';
import ClientePedidoDialog from '@/components/pedidos/ClientePedidoDialog.vue';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
const route = useRoute(),
  router = useRouter();
const pedido = ref(null),
  livros = ref([]),
  carregando = ref(true),
  erro = ref(''),
  sucesso = ref(''),
  confirmarCancelamento = ref(false),
  busy = ref(false),
  erroCancelamento = ref('');
async function carregar() {
  carregando.value = true;
  erro.value = '';
  pedido.value = null;
  try {
    [pedido.value, livros.value] = await Promise.all([
      pedidosService.obter(route.params.id),
      pedidosService.livros(),
    ]);
    if (pedido.value.status === 'RASCUNHO')
      await router.replace(`/checkout/revisao?id=${pedido.value.id}`);
  } catch (error) {
    erro.value = erroClientePedido(error);
  } finally {
    carregando.value = false;
  }
}
async function cancelar() {
  if (busy.value) return;
  busy.value = true;
  erroCancelamento.value = '';
  try {
    pedido.value = await pedidosService.cancelar(pedido.value.id);
    confirmarCancelamento.value = false;
    sucesso.value = 'Pedido cancelado. O histórico foi preservado.';
  } catch (error) {
    erroCancelamento.value = erroClientePedido(error);
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
watch(() => route.params.id, carregar);
</script>
<template>
  <main class="cliente-pedidos cliente-detalhes">
    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Carregando pedido…"
    /><EstadoRequisicao
      v-else-if="erro"
      tipo="erro"
      :mensagem="erro"
      tentar-novamente
      @tentar="carregar"
    />
    <template v-else-if="pedido"
      ><header class="cliente-pagina-header">
        <h1>
          <RouterLink
            class="cliente-mobile cliente-voltar"
            to="/meus-pedidos"
            aria-label="Voltar aos pedidos"
            ><v-icon icon="mdi-chevron-left" /></RouterLink
          >Pedido #{{ pedido.id }}
        </h1>
        <p>
          {{ statusPedido[pedido.status] }} em
          {{ dataPedido(pedido.confirmado_em || pedido.criado_em)
          }}<span class="cliente-desktop">
            • Cliente {{ pedido.destinatario }}</span
          >
        </p>
        <span
          class="cliente-badge cliente-mobile"
          :class="pedido.status.toLowerCase()"
          >{{ statusPedido[pedido.status] }}</span
        >
      </header>
      <EstadoRequisicao
        v-if="sucesso"
        tipo="sucesso"
        :mensagem="sucesso"
      />
      <ol
        v-if="pedido.status !== 'CANCELADO'"
        class="cliente-etapas cliente-desktop"
        aria-label="Andamento do pedido"
      >
        <li
          v-for="etapa in etapasCliente"
          :key="etapa"
          :class="{ atual: pedido.status === etapa }"
          :aria-current="pedido.status === etapa ? 'step' : undefined"
        >
          {{ statusPedido[etapa] }}
        </li>
      </ol>
      <section
        v-if="pedido.status !== 'CANCELADO'"
        class="cliente-acompanhamento cliente-mobile"
      >
        <h2>Acompanhe seu pedido</h2>
        <ol aria-label="Andamento do pedido">
          <li
            v-for="etapa in etapasCliente"
            :key="etapa"
            :class="{ atual: pedido.status === etapa }"
            :aria-current="pedido.status === etapa ? 'step' : undefined"
          >
            {{ pedido.status === etapa ? '●' : '○' }} {{ statusPedido[etapa] }}
          </li>
        </ol>
        <p>
          {{
            pedido.status === 'RECEBIDO'
              ? 'Previsão de entrega simulada.'
              : pedido.status === 'EM_SEPARACAO'
                ? 'Seu pedido está sendo preparado.'
                : pedido.status === 'ENVIADO'
                  ? 'Seu pedido está a caminho.'
                  : 'Pedido entregue.'
          }}
        </p>
      </section>
      <ClientePedidoItens
        :itens="pedido.itens || []"
        :livros="livros"
      />
      <section class="cliente-detalhes-endereco">
        <h2>Destinatário e endereço</h2>
        <address>
          <span>{{ pedido.destinatario }}</span
          ><span class="cliente-desktop"> • </span
          ><span>{{
            pedido.endereco_entrega || 'Endereço não informado'
          }}</span>
        </address>
      </section>
      <p class="cliente-detalhes-total">
        Total<span class="cliente-mobile">:</span>
        {{ moedaPedido(pedido.total) }}
      </p>
      <div class="cliente-detalhes-acoes">
        <RouterLink
          to="/meus-pedidos"
          class="cliente-botao secundario"
          >Voltar aos pedidos</RouterLink
        ><button
          v-if="pedido.status === 'RECEBIDO'"
          type="button"
          class="cliente-botao secundario cliente-cancelar"
          @click="
            erroCancelamento = '';
            confirmarCancelamento = true;
          "
        >
          Cancelar pedido
        </button>
      </div>
      <p class="cliente-nota cliente-mobile">
        O cancelamento está disponível enquanto o pedido estiver recebido.
      </p>
      <ClientePedidoDialog
        v-if="confirmarCancelamento"
        titulo="Cancelar pedido?"
        acao="Cancelar pedido"
        :busy="busy"
        :erro="erroCancelamento"
        @close="confirmarCancelamento = false"
        @confirm="cancelar"
        ><p>
          O pedido #{{ pedido.id }} será cancelado. O registro continuará no
          histórico e os livros voltarão ao estoque.
        </p></ClientePedidoDialog
      >
    </template>
    <RouterLink
      v-if="erro"
      to="/meus-pedidos"
      class="cliente-botao secundario"
      >Voltar aos pedidos</RouterLink
    >
  </main>
</template>
