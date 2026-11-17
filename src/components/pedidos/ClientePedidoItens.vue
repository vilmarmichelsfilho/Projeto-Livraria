<script setup>
import { moedaPedido } from '@/services/clientePedidosService';
const props = defineProps({
  itens: { type: Array, required: true },
  livros: { type: Array, default: () => [] },
});
const livro = (item) =>
  props.livros.find((livro) => String(livro.id) === String(item.id_livro));
const capa = (item) => {
  const valor = item.capa || livro(item)?.capa_url || livro(item)?.capa;
  return !valor
    ? ''
    : /^(https?:|data:|\/)/.test(valor)
      ? valor
      : import.meta.env.BASE_URL + valor;
};
</script>
<template>
  <div class="cliente-itens">
    <div class="cliente-tabela-wrap cliente-desktop">
      <table
        class="cliente-tabela"
        aria-label="Itens do pedido"
      >
        <thead>
          <tr>
            <th scope="col">Livro</th>
            <th scope="col">Quantidade</th>
            <th scope="col">Preço unitário</th>
            <th scope="col">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in itens"
            :key="item.id_livro"
          >
            <td>{{ item.titulo_livro }}</td>
            <td>{{ item.quantidade }}</td>
            <td>{{ moedaPedido(item.preco_unitario) }}</td>
            <td>
              {{ moedaPedido(Number(item.preco_unitario) * item.quantidade) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="cliente-livro-cards cliente-mobile">
      <article
        v-for="item in itens"
        :key="item.id_livro"
        class="cliente-livro-card"
      >
        <img
          v-if="capa(item)"
          :src="capa(item)"
          :alt="`Capa de ${item.titulo_livro}`"
          loading="lazy"
        />
        <div
          v-else
          class="cliente-capa-vazia"
        >
          <v-icon icon="mdi-book-open-outline" />
        </div>
        <div>
          <h3>{{ item.titulo_livro }}</h3>
          <p v-if="item.autor || livro(item)?.autor">
            {{ item.autor || livro(item)?.autor }}
          </p>
          <strong>{{ moedaPedido(item.preco_unitario) }}</strong
          ><span class="cliente-badge">Qtd. {{ item.quantidade }}</span>
        </div>
      </article>
    </div>
  </div>
</template>
