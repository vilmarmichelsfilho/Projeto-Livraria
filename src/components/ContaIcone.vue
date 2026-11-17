<script setup>
defineProps({ nome: { type: String, required: true } });
const icones = {
  inicio: 'mdi-home-outline',
  livros: 'mdi-book-open-page-variant',
  favoritos: 'mdi-heart-outline',
  conta: 'mdi-account-outline',
  carrinho: 'mdi-cart-outline',
  voltar: 'mdi-chevron-left',
};
</script>

<template>
  <v-icon
    :icon="icones[nome]"
    aria-hidden="true"
  />
</template>
