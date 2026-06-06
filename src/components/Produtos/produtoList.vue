<script setup>
import { produtos } from '@/data/produtos';
import produtoCard from './produtoCard.vue';
import { favoritar } from '@/utils/produtosUtils.js';
function escutarFavorito(idDoProduto) {
  favoritar(produtos, idDoProduto);
}
</script>
<template>
  <div>
    <ul>
      <produtoCard v-for="produto in produtos" :key="produto.id" :titulo="produto.titulo" :autor="produto.autor" :preco="produto.preco" :capa="produto.capa" :favorito="produto.favorito" :id="produto.id" @favoritar="escutarFavorito">
      </produtoCard>
    </ul>
  </div>
</template>
<style scoped>
ul{
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 2vw;
  align-items: stretch;
}
</style>
