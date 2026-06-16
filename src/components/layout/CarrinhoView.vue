<script setup>
import { computed } from 'vue'
import { carrinho, adicionaraoarrinho } from '@/utils/cartUtils'
import { formataPreco } from '@/utils/produtosUtils'
import { RouterLink } from 'vue-router'

const total = computed(() =>
  carrinho.reduce((soma, item) => soma + item.precoTotal, 0)
)

function removerItem(id) {
  const index = carrinho.findIndex(item => item.id === id)
  if (index !== -1) carrinho.splice(index, 1)
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find(item => item.id === id)
  if (!item) return
  const novaQtd = item.quantidade + delta
  if (novaQtd <= 0) {
    removerItem(id)
  } else {
    adicionaraoarrinho(id, delta)
  }
}
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

            <div class="info">
              <h3>{{ item.titulo }}</h3>
              <p class="autor">{{ item.autor }}</p>
              <p class="preco-unit">{{ formataPreco(item.preco) }} cada</p>
            </div>

            <div class="controles">
              <div class="quantidade">
                <button @click="alterarQuantidade(item.id, -1)">−</button>
                <span>{{ item.quantidade }}</span>
                <button @click="alterarQuantidade(item.id, 1)">+</button>
              </div>
              <p class="preco-total">{{ formataPreco(item.precoTotal) }}</p>
              <button class="remover" @click="removerItem(item.id)">Remover</button>
            </div>
          </li>
        </ul>

        <div class="rodape-carrinho">
          <h3>Total: {{ formataPreco(total) }}</h3>
          <button class="finalizar">Finalizar compra</button>
        </div>
      </template>
    </section>
  </main>
</template>
<style scoped>

</style>

