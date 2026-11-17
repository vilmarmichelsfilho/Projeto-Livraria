<script setup>
import { moedaPedido } from '@/services/clientePedidosService';
defineProps({
  itens: { type: Array, required: true },
  total: { type: Number, required: true },
});
</script>
<template>
  <section class="cliente-resumo">
    <h2>Resumo do pedido</h2>
    <ul>
      <li
        v-for="item in itens"
        :key="item.id_livro"
      >
        {{ item.quantidade }} × {{ item.titulo_livro }}
      </li>
    </ul>
    <p class="cliente-resumo-total">Total: {{ moedaPedido(total) }}</p>
    <slot />
  </section>
</template>
