<script setup>
import { RouterLink } from 'vue-router'
import ShoppingCartIcon from '@iconify-vue/material-symbols/shopping-cart';
import HeartIcon from '@iconify-vue/mdi/heart';
import PeopleIcon from '@iconify-vue/icon-park-solid/people';
import SearchIcon from '@iconify-vue/material-symbols/search';
</script>

<template>
  <div class="container">


  <div class = "logo-container">
   <a href="/">IFbooks</a>
    <span>Apreço a <br> Leitura</span>
  </div>

  <div class = "pesquisar">
    <input type="search"
    v-model="pesquisar"
    placeholder="pesquisar"
    > <a href="#"><SearchIcon height="1em" /></a>
  </div>
  <div class="navegacao">
   <nav>
    <ul>
      <li><RouterLink to="#">Termos</RouterLink></li>
      <li><RouterLink to="#">Equipe</RouterLink></li>
      <li><RouterLink to="#">Envio </RouterLink></li>
      <li><RouterLink to="#">Devoluções</RouterLink></li>
      <div class ="icones">
      <li><RouterLink to="#"><ShoppingCartIcon height="1.5em"/></RouterLink></li>
      <span> <li><RouterLink to="#"> <HeartIcon height="1.5em" /></RouterLink></li> </span>
      <li><RouterLink to="#"> <PeopleIcon height="1.5em" /></RouterLink></li>
      </div>
    </ul>
   </nav>

  </div>
  </div>
</template>

<style scoped>
 .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
 }
.navegacao nav ul  {
  display: flex;
  justify-content: space-between;
  align-items: center;
  list-style-type: none;
  gap: 1vw;
}
.icones {
  display: flex;
  justify-content: space-between;
  align-items: center;
  list-style-type: none;
  gap: 1vw;

}
.icones span {
  border-right: 1px green solid;
  border-left: 1px green solid;
  padding: 0vw 0.4vw 0vw 0.4vw;
}
.icones {
  margin: 0vw 10vw 0vw 0vw;
}
.navegacao ul li{
  font-size: 1vw;
}
.logo-container a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: black;
  font-size: 1.3rem;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 10vw;
}
.logo-container span {
  color: green;
  border-left: 1px green solid;
  padding: 0 0.5vw;
}
.container {
  margin: 0vw 0vw 40vw;
}
</style>
