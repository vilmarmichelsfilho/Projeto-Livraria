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
a:hover {
  transform: scale(1.1);
  text-shadow: 3px 3px 5px black;
}
li:hover {
  transform: scale(1.1);
}
li {
  transition: 0.4s;
}

.container {
  padding: 1rem 2rem;
  background: #A0CDE0;
  display: flex;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  color: black;
  font-family: "Afacad", sans-serif;
  font-weight: bold;
  gap: 5px;
}
.icones {
  display: flex;
  align-items: center;
  color: black;
  font-family: "Afacad", sans-serif;
  font-weight: bold;
  gap: 5px;
}
.nav ul {
  display: flex;
  list-style: none;
  gap: 22px;
}
.nav ul li a {
  color: black;
}
.barra-pesquisa {
  color: black;
  display: flex;
  cursor: pointer;
  background: #7DB6CF;
  border-radius: 50px;
  padding: 0 1rem;
}
.container {
  margin: 0vw 0vw 40vw;
}
</style>
