<script setup>
import { carrinho, total, removerItem, alterarQuantidade } from '@/utils/cartUtils'
import { formataPreco } from '@/utils/produtosUtils'
import { RouterLink } from 'vue-router'
import ShoppingIcon from '@iconify-vue/mdi/shopping'
import cartCard from '@/components/Carrinho/cartCard.vue'
</script>

<template>
  <main>
    <section class="carrinho">
      <h2>Seu carrinho</h2>

      <template v-if="carrinho.length === 0">
        <h3 class="aviso">Seu carrinho está vazio!</h3>
        <RouterLink to="/">Clique aqui para voltar para a página inicial</RouterLink>
      </template>

      <template v-else>
        <ul>
          <cartCard v-for="item in carrinho"
            :key="item.id"
            :id="item.id"
            :titulo="item.titulo"
            :endereco="item.endereco"
            :autor="item.autor"
            :preco="item.preco"
            :capa="item.capa"
            :quantidade="item.quantidade"
            :precoTotal="item.precoTotal"
            @remover="removerItem"
            @alterarQuantidade="alterarQuantidade">
          </cartCard>
        </ul>
        <div class="rodape-carrinho">
          <h3>Total: {{ formataPreco(total) }}</h3>
          <button class="finalizar"><ShoppingIcon width="15px"/> Finalizar compra</button>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
.rodape-carrinho {
  text-align: center;
}
.rodape-carrinho h3 {
  font-size: 1.5rem;
  font-weight: bolder;
}
.rodape-carrinho button {
  border: none;
  background: #476978;
  font-size: 1rem;
  font-weight: bolder;
  color: white;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  transition: 0.3s;
  cursor: pointer;
}
.rodape-carrinho button:hover {
  transform: scale(1.1);
  color: black;
}
h2 {
  font-size: 2rem;
  font-weight: bolder;
  text-align: center;
}
.carrinho {
  margin: 3rem;
}
.carrinho ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style>
