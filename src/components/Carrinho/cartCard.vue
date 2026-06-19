<script setup>
import { formataPreco } from '@/utils/produtosUtils'
import { RouterLink } from 'vue-router'
const props = defineProps(['id', 'titulo', 'endereco', 'autor', 'preco', 'capa', 'quantidade', 'precoTotal'])
const emit = defineEmits(['remover', 'alterarQuantidade'])
</script>
<template>
  <li class="item-carrinho">
    <RouterLink :to="'livro/' + props.endereco">
      <img :src="props.capa" :alt="'Capa do livro ' + props.titulo" />
    </RouterLink>

    <div class="contain">
      <div class="info">
        <h3>{{ props.titulo }}</h3>
        <p class="autor">{{ props.autor }}</p>
        <p class="preco-unit">{{ formataPreco(props.preco) }} unid.</p>
      </div>
      <div class="controles">
        <div class="quantidade">
          <button @click="emit('alterarQuantidade', props.id, -1)">−</button>
          <span style="margin: 0 5px 0 5px;">{{ props.quantidade }}</span>
          <button @click="emit('alterarQuantidade', props.id, 1)">+</button>
        </div>
        <p class="preco-total">{{ formataPreco(props.precoTotal) }}</p>
        <button class="remover" @click="emit('remover', props.id)">Remover</button>
      </div>
    </div>
  </li>
</template>
<style scoped>
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
.item-carrinho img {
  width: 140px;
}
.item-carrinho {
  display: flex;
  gap: 30px;
  margin: 1rem 0;
  background: #A0CDE0;
  padding: 1rem;
  border-radius: 1rem;
  list-style: none;
}
.item-carrinho h3 {
  font-weight: bolder;
  font-size: 1.5rem;
}
.preco-total {
  font-weight: bold;
  margin: 0.5rem 0;
}
</style>
