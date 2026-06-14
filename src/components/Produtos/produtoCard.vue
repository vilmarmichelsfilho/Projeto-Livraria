<script setup>
const props = defineProps(['titulo', 'endereco', 'autor', 'preco', 'capa', 'id', 'favorito'])
defineEmits(['adicionarcarrinho', 'favoritar'])
import { formataPreco} from '@/utils/produtosUtils';
import { RouterLink } from 'vue-router';
import HeartIcon from '@iconify-vue/mdi/heart'
import CartIcon from '@iconify-vue/mdi/cart';
import HeartOutlineIcon from '@iconify-vue/mdi/heart-outline';
</script>
<template>
  <li>
    <div class="conteudocard">
      <RouterLink :to="'/livro/'+props.endereco"><img :src="props.capa" :alt="'Capa do livro ' + props.titulo"></RouterLink>
    <h3>{{props.titulo }}</h3>
    <p class="autor">{{props.autor }}</p>
    <div class="conteiner">
      <p class="preco">{{ formataPreco(props.preco)}}</p>
    <button @click.prevent="$emit('favoritar', props.id)"><HeartIcon height="1.2em" color="#27AE60" v-if="props.favorito == true"></HeartIcon> <HeartOutlineIcon color="#27AE60" height="1.2em" v-else></HeartOutlineIcon> </button>
    </div>
    </div>
   <div class="button"><button @click.prevent="$emit('adicionarcarrinho', props.id, 1)"><CartIcon height="1.2em"></CartIcon>COMPRAR</button></div>
  </li>
</template>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  max-width: 275px;
  max-height: 625px;
  margin-bottom: 3vh;
}

div.conteiner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}
div.conteudocard button{
  background-color: transparent;
  border: none;
  padding: none;
  cursor: pointer;
}
img {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto 10px auto;
  height: 415px;
}
div.button{
  margin-top: auto;
}
div.button button {
  background-color: #27AE60;
  padding: 8px 16px;
  border: none;
  color: white;
  border-radius: 5px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;
}

h3 {
  font-size: 1.2rem;
  margin: 5px 0;
}

p.autor {
  font-size: 0.9rem;
  color: #4D4C4C;
  margin-bottom: 10px;
}
</style>
