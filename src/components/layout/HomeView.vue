<script setup>
import { produtos } from '@/data/produtos';
import produtoCard from '../Produtos/produtoCard.vue';
import { favoritar} from '@/utils/produtosUtils.js';
import { adicionaraoarrinho } from '@/utils/cartUtils.js';
function escutarFavorito(idDoProduto) {
  favoritar(produtos, idDoProduto);
}
function adicionarcarrinho(idDoProduto, quantidade){
   adicionaraoarrinho(idDoProduto, quantidade)
}
</script>
<template>
  <main>
    <section class="lancamentos">
  <h2>Lançamentos
  </h2>
  <div>
    <ul>
      <produtoCard v-for="produto in produtos" :key="produto.id" :titulo="produto.titulo" :autor="produto.autor" :preco="produto.preco" :capa="produto.capa" :favorito="produto.favorito" :id="produto.id" @favoritar="escutarFavorito" @adicionarcarrinho="adicionarcarrinho">
      </produtoCard>
    </ul>
  </div>
  </section>
  </main>
</template>
<style scoped>
section.lancamentos{
  margin: 6vw 6vw;
}
section.lancamentos h2{
  font-size: 2rem;
  font-weight: bold;
  color: black;
  margin: 0 0 3vw 2.7vw;
  text-align: center;
}
section.lancamentos ul{
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 2vw;
  align-items: stretch;
}
</style>
