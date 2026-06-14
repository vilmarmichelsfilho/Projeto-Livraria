<script setup>
import { produtos } from '@/data/produtos';
import produtoCard from '../Produtos/produtoCard.vue';
import { favoritar} from '@/utils/produtosUtils.js';
import { adicionaraoarrinho } from '@/utils/cartUtils.js';
import { computed } from 'vue'
import { useRoute } from 'vue-router'
function escutarFavorito(idDoProduto) {
  favoritar(produtos, idDoProduto);
}
function adicionarcarrinho(idDoProduto, quantidade){
   adicionaraoarrinho(idDoProduto, quantidade)
}
const route = useRoute()

const produtosFiltrados = computed(() => {
  const q = (route.query.q ?? '').toLowerCase()
  if (!q) return produtos
  return produtos.filter((p) => p.titulo.toLowerCase().includes(q))
})
</script>
<template>
  <main>
    <section class="lancamentos">
  <h2>Livros
  </h2>
  <div>
    <ul>
      <produtoCard   v-for="produto in produtosFiltrados"
  :key="produto.id"
  :titulo="produto.titulo"
  :autor="produto.autor"
  :preco="produto.preco"
  :capa="produto.capa"
  :favorito="produto.favorito"
  :id="produto.id"
  :endereco="produto.endereco"
  @favoritar="escutarFavorito"
  @adicionarcarrinho="adicionarcarrinho">
      </produtoCard>
    </ul>
  </div>
    <div class="catalogo">
    <ProdutoCard v-for="produto in produtosFiltrados" :key="produto.id" :produto="produto" />
  </div>
  </section>
  </main>
</template>
<style scoped>
section.lancamentos{
  margin: 6vw 6vw;
}
section.lancamentos h2{
  font-size: 2.5rem;
  font-weight: bold;
  color: black;
  margin: 0 0 1vw 2.7vw;
  text-align: center;
}
section.lancamentos ul{
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem 4rem;
  align-items: stretch;
}
</style>
