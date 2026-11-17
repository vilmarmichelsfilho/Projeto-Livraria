<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import pedidos, {
  erroClientePedido,
  moedaPedido,
  statusPedido,
} from '@/services/clientePedidosService';
import ClientePedidoResumo from '@/components/pedidos/ClientePedidoResumo.vue';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
const route = useRoute(),
  pedido = ref(null),
  carregando = ref(true),
  erro = ref('');
const confirmado = computed(
  () =>
    pedido.value && !['RASCUNHO', 'CANCELADO'].includes(pedido.value.status),
);
const unidades = computed(() =>
  (pedido.value?.itens || []).reduce(
    (total, item) => total + item.quantidade,
    0,
  ),
);
async function carregar() {
  carregando.value = true;
  erro.value = '';
  pedido.value = null;
  try {
    pedido.value = await pedidos.obter(route.params.id);
  } catch (error) {
    erro.value = erroClientePedido(error);
  } finally {
    carregando.value = false;
  }
}
onMounted(carregar);
watch(() => route.params.id, carregar);
</script>
<template>
  <main class="cliente-pedidos cliente-confirmacao">
    <header class="cliente-pagina-header cliente-desktop">
      <h1>Pedido confirmado</h1>
      <p>Sua compra simulada foi registrada</p>
    </header>
    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Conferindo confirmação…"
    /><EstadoRequisicao
      v-else-if="erro"
      tipo="erro"
      :mensagem="erro"
      tentar-novamente
      @tentar="carregar"
    />
    <section
      v-else-if="confirmado"
      class="cliente-confirmado-conteudo"
    >
      <div
        class="cliente-sucesso-icone"
        aria-hidden="true"
      >
        <v-icon icon="mdi-check" />
      </div>
      <h2 class="cliente-desktop">
        Pedido #{{ pedido.id }} {{ statusPedido[pedido.status].toLowerCase() }}
      </h2>
      <h1 class="cliente-mobile">Pedido confirmado!</h1>
      <p class="cliente-mobile cliente-confirmado-numero">
        Pedido #{{ pedido.id }} • {{ statusPedido[pedido.status] }}
      </p>
      <p class="cliente-desktop cliente-confirmado-total">
        Total {{ moedaPedido(pedido.total) }} • {{ unidades }} unidades
      </p>
      <ClientePedidoResumo
        class="cliente-mobile"
        :itens="pedido.itens || []"
        :total="Number(pedido.total)"
      />
      <p class="cliente-confirmado-instrucao">
        <span class="cliente-desktop"
          >Acompanhe a preparação e o envio na sua conta.</span
        ><span class="cliente-mobile"
          >Você pode acompanhar o andamento em Meus pedidos.</span
        >
      </p>
      <div class="cliente-confirmado-acoes">
        <RouterLink
          to="/meus-pedidos"
          class="cliente-botao"
          >Ver meus pedidos</RouterLink
        ><RouterLink
          to="/"
          class="cliente-botao secundario"
          ><span class="cliente-desktop">Continuar comprando</span
          ><span class="cliente-mobile">Voltar à loja</span></RouterLink
        >
      </div>
    </section>
    <section
      v-else-if="pedido"
      class="cliente-vazio"
    >
      <h2>
        {{
          pedido.status === 'RASCUNHO'
            ? 'Este pedido ainda é um rascunho'
            : 'Este pedido foi cancelado'
        }}
      </h2>
      <p>Consulte os dados atuais do pedido antes de continuar.</p>
      <RouterLink
        :to="
          pedido.status === 'RASCUNHO'
            ? `/checkout/revisao?id=${pedido.id}`
            : `/meus-pedidos/${pedido.id}`
        "
        class="cliente-botao"
        >Ver pedido</RouterLink
      >
    </section>
  </main>
</template>
