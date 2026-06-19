<script setup>
const props = defineProps(['titulo', 'endereco', 'autor', 'preco', 'capa', 'id', 'favorito'])
defineEmits(['adicionarcarrinho', 'favoritar'])
import { formataPreco} from '@/utils/produtosUtils';
import { RouterLink } from 'vue-router';
import StarIcon from '@iconify-vue/mdi/star';
import CartIcon from '@iconify-vue/mdi/cart';
import StarOutlineIcon from '@iconify-vue/mdi/star-outline';

</script>
<template>
  <li>
    <div class="conteudocard">
       <RouterLink :to="'livro/'+props.endereco"><img :src="props.capa" :alt="'Capa do livro ' + props.titulo"></RouterLink>
    <h3>{{props.titulo }}</h3>
    <p class="autor">{{props.autor }}</p>
    <div class="conteiner">
      <p class="preco">{{ formataPreco(props.preco)}}</p>
    <button @click.prevent="$emit('favoritar', props.id)" class="favoritar"><StarIcon height="1.5rem" color="#476978" v-if="props.favorito == true"></StarIcon> <StarOutlineIcon color="#476978" height="1.5rem" v-else></StarOutlineIcon> </button>
    </div>
    </div>
   <div class="button"><button @click.prevent="$emit('adicionarcarrinho', props.id, 1)"><CartIcon height="1.2em"></CartIcon>Adicionar ao carrinho</button></div>
  </li>
</template>

<style scoped>
li {
  background: #A0CDE0;
  border-radius: 1vw;
  padding: 1vw 1vw 1vw 1vw;
  display: flex;
  flex-direction: column;
  max-width: 320px;
  margin-bottom: 3vh;
}

div.conteiner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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
  margin: 0 auto 5px auto;
  height: 415px;
  border-radius: 0.5vw;
  background: black;
  transition: 0.3s;
  cursor: pointer;
}
div.button{
  margin-top: 1vw;
  display: flex;
  justify-content: center;
}
div.button button {
  display: flex;
  justify-content: center;
  background-color: #476978;
  font-size: 1rem;
  padding: 16px 32px;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

div.button button:hover {
  transform: scale(1.05);
  color: black;
}

img:hover {
  opacity: 0.8;
}

h3 {
  font-size: 1.2rem;
  font-weight: bold;
}

p {
  font-weight: bolder;
}

p.autor {
  font-size: 0.9rem;
  color: #4D4C4C;
}
</style>
