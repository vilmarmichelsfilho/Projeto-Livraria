<script setup>
import { produtos } from '@/data/produtos';
import produtoCard from '../Produtos/produtoCard.vue';
import { favoritar} from '@/utils/produtosUtils.js';
import { adicionaraoarrinho } from '@/utils/cartUtils.js';
import { ref, computed } from 'vue';
import {RouterLink} from 'vue-router';
const listaprodutos = ref(produtos)
const livroFavoritos = computed(() => {
  return listaprodutos.value.filter(item => item.favorito === true);
});
function escutarFavorito(idDoProduto) {
  favoritar(produtos, idDoProduto);
}
function adicionarcarrinho(idDoProduto, quantidade){
   adicionaraoarrinho(idDoProduto, quantidade)
}
</script>
<template>
  <main>
   <section class="livros-favoritos">
    <h2>Seus livros favoritos</h2>
    <h3 class="aviso" v-if="livroFavoritos.length === 0">Você ainda não tem livros favoritos, adicione alguns para vê-los aqui!</h3>
    <RouterLink to="/" v-if="livroFavoritos.length === 0">Clique aqui para voltar para a página inicial</RouterLink>
    <ul v-else>
 <produtoCard v-for="produto in livroFavoritos" :key="produto.id" :titulo="produto.titulo" :autor="produto.autor" :preco="produto.preco" :capa="produto.capa" :favorito="produto.favorito" :id="produto.id" :endereco="produto.endereco" @favoritar="escutarFavorito" @adicionarcarrinho="adicionarcarrinho">
      </produtoCard>
      </ul>
   </section>
  </main>
</template>
<style scoped>
section.livros-favoritos{
  margin: 6vw 6vw;
}
section.livros-favoritos h2{
  font-size: 2rem;
  font-weight: bold;
  color: black;
  margin: 0 0 3vw 2.7vw;
  text-align: center;
}
section.livros-favoritos h3.aviso{
  font-size: 2rem;
  font-weight: bold;
  color: black;
  margin: 0 0 3vw 2.7vw;
  text-align: center;
}
section.livros-favoritos ul{
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 4rem;
  align-items: stretch;
  justify-content: center; 
}
</style>
