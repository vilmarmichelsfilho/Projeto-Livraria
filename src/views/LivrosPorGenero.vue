<script setup>
import { useRoute } from 'vue-router';
import { produtos } from '@/data/produtos';
import { computed } from 'vue';
import produtoCard from '@/components/Produtos/produtoCard.vue';
import { favoritar } from '@/utils/produtosUtils';
import { adicionaraoarrinho } from '@/utils/cartUtils'; 
const rota = useRoute();
import { adicionaraoarrinho } from '@/utils/cartUtils';
function escutarFavorito(idDoProduto) {
  favoritar(produtos, idDoProduto);
}
let livrosPorGenero = computed(() => {
    return produtos.filter(p => p.genero === rota.params.genero)
})

</script>

<template>
    <main>
    <section class="lancamentos">
  <h2>Livros
  </h2>
  <div class="genero-butoes">
    <ul>
      <li><RouterLink to="/">Todos</RouterLink></li>
      <li><RouterLink to="/Romance">Romance</RouterLink></li>
      <li><RouterLink to="/Terror">Terror</RouterLink></li>
      <li><RouterLink to="/Suspense">Suspense</RouterLink></li>
      <li><RouterLink to="/Fantasia">Fantasia</RouterLink></li>
      <li><RouterLink to="/Distopia">Distopia</RouterLink></li>
      <li><RouterLink to="/Poesia">Poesia</RouterLink></li>
    </ul>
  </div>
  <div>
    <ul>
      <produtoCard   v-for="produto in livrosPorGenero"
  :key="produto.id"
  :titulo="produto.titulo"
  :autor="produto.autor"
  :preco="produto.preco"
  :capa="produto.capa"
  :favorito="produto.favorito"
  :id="produto.id"
  :endereco="produto.endereco"
  @favoritar="escutarFavorito"
  @adicionarcarrinho="adicionaraoarrinho(produto.id,1)">
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
.genero-butoes ul li a {
  color: black;
  font-weight: bold;
}
.genero-butoes ul li:hover {
  transform: scale(1.15);
  background: #476978;
}
.genero-butoes ul {
  margin: 0 0 1rem 0;
  flex-wrap: nowrap;
  align-items: left;
  justify-content: left;
}
.genero-butoes ul li {
  background: #A0CDE0;
  padding: 0.5rem 1.5rem;
  border-radius: 0.7rem;
  transition: 0.3s;
}
</style>
