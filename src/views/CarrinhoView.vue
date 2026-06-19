<script setup>
import { carrinho, total, removerItem, alterarQuantidade} from '@/utils/cartUtils'
import { formataPreco } from '@/utils/produtosUtils'
import { RouterLink } from 'vue-router'
import ShoppingIcon from '@iconify-vue/mdi/shopping';
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
          <li v-for="item in carrinho" :key="item.id" class="item-carrinho">
            <RouterLink :to="'livro/' + item.endereco">
              <img :src="item.capa" :alt="'Capa do livro ' + item.titulo" />
            </RouterLink>

            <div class="contain">
              <div class="info">
              <h3>{{ item.titulo }}</h3>
              <p class="autor">{{ item.autor }}</p>
              <p class="preco-unit">{{ formataPreco(item.preco) }} unid.</p>
            </div>

            <div class="controles">
              <div class="quantidade">
                <button @click="alterarQuantidade(item.id, -1)">−</button>
                <span style="margin: 0 5px 0 5px;">{{ item.quantidade }}</span>
                <button @click="alterarQuantidade(item.id, 1)">+</button>
              </div>
              <p class="preco-total">{{ formataPreco(item.precoTotal) }}</p>
              <button class="remover" @click="removerItem(item.id)">Remover</button>
            </div>
          </div>
          </li>
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
.controles {
  display: flex;
  flex-direction: column;
}
.quantidade button {
  background: #476978;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  border: none;
  transition: 0.3s;
}
.remover {
  background: #476978;
  font-weight: bolder;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: 0.3s;
  cursor: pointer;
  max-width: 100px;
}
.remover:hover {
  transform: scale(1.1);
  color: black;
}
.quantidade button:hover {
  width: 25px;
  height: 25px;
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
.carrinho ul li {
  display: flex;
  gap: 30px;
  margin: 1rem 0;
}
.carrinho ul li h3 {
  font-weight: bolder;
  font-size: 1.5rem;
}
.preco-unit {
  font-weight: 400;
  font-size: 1.2rem;
}
.contain {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.autor {
  font-weight: bolder;
  opacity: 0.7;
}
.carrinho li img {
  width: 140px;
}
.carrinho li {
  background: #A0CDE0;
  padding: 1rem;
  border-radius: 1rem;
}
</style>

