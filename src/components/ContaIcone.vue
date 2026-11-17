<script setup>
defineProps({ nome: { type: String, required: true } });
const caminhos = {
  inicio: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  livros:
    "M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z",
  favoritos:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  conta: "M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3c0-5 16-5 16 0v3",
  carrinho: "M2 3h3l3 13h11l3-10H6M10 21h.01M18 21h.01",
  voltar: "m15 5-7 7 7 7",
};
</script>
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="caminhos[nome]" />
  </svg>
</template>
