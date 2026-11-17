<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import usuarios from '@/services/usuariosService';
import pedidos, {
  erroClientePedido,
  moedaPedido,
  totalPedidoItens,
} from '@/services/clientePedidosService';
import { carrinho } from '@/utils/cartUtils';
import ClientePedidoItens from '@/components/pedidos/ClientePedidoItens.vue';
import EstadoRequisicao from '@/components/EstadoRequisicao.vue';
const route = useRoute(),
  router = useRouter();
const pedido = ref(null),
  usuario = ref(null),
  livros = ref([]),
  carregando = ref(true),
  busy = ref(false),
  erro = ref('');
const itens = computed(() =>
  (pedido.value?.itens || []).map((item) => {
    const livro = livros.value.find(
      (livro) => String(livro.id) === String(item.id_livro),
    );
    return { ...item, preco_unitario: livro?.preco ?? item.preco_unitario };
  }),
);
const total = computed(() => totalPedidoItens(itens.value));
const unidades = computed(() =>
  itens.value.reduce((total, item) => total + item.quantidade, 0),
);
const editarEndereco = computed(() => ({
  path: '/minha-conta/editar',
  query: {
    retornar: `/checkout/revisao${pedido.value ? `?id=${pedido.value.id}` : ''}`,
  },
}));
async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    [usuario.value, livros.value] = await Promise.all([
      usuarios.atual(),
      pedidos.livros(),
    ]);
    if (route.query.id) pedido.value = await pedidos.obter(route.query.id);
    else if (carrinho.length) {
      const dados = carrinho.map((item) => ({
        id_livro: item.id,
        quantidade: item.quantidade,
      }));
      const anterior = sessionStorage.getItem('iflibrary_checkout_id');
      if (anterior) {
        try {
          const rascunho = await pedidos.obter(anterior);
          if (rascunho.status === 'RASCUNHO')
            pedido.value = await pedidos.atualizar(anterior, dados);
        } catch (error) {
          if (![404, 409].includes(error.response?.status)) throw error;
        }
      }
      if (!pedido.value) pedido.value = await pedidos.criar(dados);
      sessionStorage.setItem('iflibrary_checkout_id', pedido.value.id);
    } else {
      const anterior = sessionStorage.getItem('iflibrary_checkout_id');
      if (anterior) pedido.value = await pedidos.obter(anterior);
    }
    if (pedido.value && pedido.value.status !== 'RASCUNHO')
      await router.replace(`/meus-pedidos/${pedido.value.id}`);
  } catch (error) {
    erro.value = erroClientePedido(error);
  } finally {
    carregando.value = false;
  }
}
async function confirmar() {
  if (busy.value || !pedido.value) return;
  busy.value = true;
  erro.value = '';
  try {
    const confirmado = await pedidos.confirmar(pedido.value.id, total.value);
    if (
      String(confirmado.id) === sessionStorage.getItem('iflibrary_checkout_id')
    ) {
      carrinho.splice(0);
      sessionStorage.removeItem('iflibrary_checkout_id');
    }
    await router.replace(`/checkout/confirmado/${confirmado.id}`);
  } catch (error) {
    erro.value = erroClientePedido(error);
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
</script>
<template>
  <main class="cliente-pedidos cliente-revisao">
    <header class="cliente-pagina-header">
      <h1>
        <RouterLink
          class="cliente-mobile cliente-voltar"
          to="/carrinho"
          aria-label="Voltar ao carrinho"
          ><v-icon icon="mdi-chevron-left" /></RouterLink
        ><span class="cliente-desktop">Revise seu pedido</span
        ><span class="cliente-mobile">Revisar pedido</span>
      </h1>
      <p class="cliente-desktop">
        Confira os dados antes de confirmar a compra simulada
      </p>
      <p class="cliente-mobile">Confira os itens e o endereço de entrega.</p>
    </header>
    <EstadoRequisicao
      v-if="carregando"
      tipo="carregando"
      mensagem="Carregando revisão do pedido…"
    />
    <EstadoRequisicao
      v-if="erro"
      tipo="erro"
      :mensagem="erro"
      tentar-novamente
      @tentar="carregar"
    />
    <div
      v-if="!carregando && pedido?.status === 'RASCUNHO'"
      class="cliente-checkout-grid"
    >
      <section class="cliente-checkout-itens">
        <h2 class="cliente-desktop">Itens do pedido</h2>
        <ClientePedidoItens
          class="cliente-desktop"
          :itens="itens"
          :livros="livros"
        />
        <section class="cliente-checkout-endereco">
          <h2>Destinatário e endereço</h2>
          <address>
            <strong>{{ usuario.nome }}</strong
            ><span>{{ usuario.endereco }}</span
            ><span>{{ usuario.cidade }} • {{ usuario.uf }}</span
            ><span
              >CEP {{ usuario.cep?.replace(/^(\d{5})(\d{3})$/, '$1-$2') }}</span
            ><span class="cliente-mobile">{{ usuario.telefone }}</span>
          </address>
          <RouterLink
            :to="editarEndereco"
            class="cliente-botao secundario"
            ><span class="cliente-desktop">Alterar endereço</span
            ><span class="cliente-mobile">Editar meus dados</span></RouterLink
          >
        </section>
      </section>
      <aside class="cliente-resumo cliente-checkout-resumo">
        <h2>Resumo do pedido</h2>
        <p class="cliente-desktop cliente-resumo-unidades">
          {{ unidades }} unidades • {{ itens.length }} livros
        </p>
        <ul class="cliente-mobile">
          <li
            v-for="item in itens"
            :key="item.id_livro"
          >
            {{ item.quantidade }} × {{ item.titulo_livro }}
          </li>
        </ul>
        <p class="cliente-desktop cliente-total-label">Total</p>
        <p class="cliente-resumo-total">
          <span class="cliente-mobile">Total: </span>{{ moedaPedido(total) }}
        </p>
        <button
          class="cliente-botao cliente-desktop"
          :disabled="busy"
          @click="confirmar"
        >
          {{ busy ? 'Confirmando…' : 'Confirmar compra' }}
        </button>
        <p class="cliente-desktop cliente-aviso-simulado">
          Compra demonstrativa sem cobrança real
        </p>
      </aside>
      <section class="cliente-mobile cliente-pagamento">
        <h2>Pagamento e entrega</h2>
        <p>
          Compra simulada para o projeto acadêmico. Confira todos os valores
          antes de confirmar.
        </p>
      </section>
      <div class="cliente-mobile cliente-checkout-acoes">
        <button
          class="cliente-botao"
          :disabled="busy"
          @click="confirmar"
        >
          {{ busy ? 'Confirmando…' : 'Confirmar pedido' }}</button
        ><RouterLink
          to="/carrinho"
          class="cliente-botao secundario"
          >Voltar ao carrinho</RouterLink
        >
        <p class="cliente-nota">
          Se o preço ou o estoque mudar, revise o pedido novamente.
        </p>
      </div>
    </div>
    <div
      v-else-if="!carregando && !erro && !pedido"
      class="cliente-vazio"
    >
      <h2>Seu carrinho está vazio</h2>
      <p>Adicione um livro para revisar seu pedido.</p>
      <RouterLink
        to="/"
        class="cliente-botao"
        >Explorar livros</RouterLink
      >
    </div>
  </main>
</template>
