<script setup>
import { RouterLink } from 'vue-router'
import InstagramIcon from '@iconify-vue/mdi/instagram'
import FacebookIcon from '@iconify-vue/mdi/facebook'
import TwitterIcon from '@iconify-vue/mdi/twitter'
import PhoneIcon from '@iconify-vue/mdi/phone'
import ClockIcon from '@iconify-vue/mdi/clock'
import EmailIcon from '@iconify-vue/mdi/email'
</script>

<template>
  <footer>
    <div class="container">
      <div class="container-esquerda">
        <RouterLink class="logo" to="/">IFLibrary</RouterLink>
        <div class="redes-sociais">
          <a href="https://www.instagram.com">
            <InstagramIcon height="1em" />
          </a>
          <a href="https://www.facebook.com">
            <FacebookIcon height="1em" />
          </a>
          <a href="https://x.com">
            <TwitterIcon height="1em" />
          </a>
        </div>
      </div>
      <div class="desenvolvedores">
        <h2>Desenvolvido por:</h2>
        <ul>
          <li>Vilmar Michels Filho</li>
          <li>Igor Gabriel Decker</li>
          <li>Davi Augusto Ramos</li>
        </ul>
      </div>
      <div class="container-direita">
        <div class="contato">
          <h3>Contato</h3>
          <ul>
            <li>
              <PhoneIcon height="1em"/>
              <span>+55 47 40045263</span>
            </li>
            <li>
              <ClockIcon height="1em"/>
              <span>8h às 23h - Seg a Sex</span>
            </li>
            <li>
              <EmailIcon height="1em"/>
              <span>contato@iflibrary.com</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="direitos">
      <p>© Alguns direitos reservados. IFLibrary 2026.</p>
    </div>
  </footer>
</template>

<style scoped>
a {
  color: black;
}
footer {
  background-color: #A0CDE0;
  padding: 1.5vw 0 1.5vw 0;
  font-size: 1.2rem;
}

div.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5vw;
}

div.container-esquerda {
  display: flex;
  flex-direction: column;
}

div.container-direita {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

div.redes-sociais a {
  margin: 0 0.5vw 0 0;
  font-size: 2rem;
  color: black;
}
div.contato ul {
  padding: 0;
  margin: 0;
}
div.contato ul li {
  margin-bottom: 0.5vw;
}

div.direitos {
  padding-top: 1vw;
  margin-top: 1vw;
  text-align: center;
  border-top: 1px solid black;
}

.logo {
  font-weight: bolder;
  font-size: 1.5rem;
}

li {
  list-style: none;
  display: flex;
  align-items: center;
  padding: 0;
}

li span {
  margin-left: 0.6vw;
  color: black;
  opacity: 0.7;
}

p {
  color: black;
  font-weight: bold;
  opacity: 0.7;
}

h3 {
  color: black;
  font-weight: bold;
}
.desenvolvedores ul {
  padding: 0;
}
.desenvolvedores ul li {
  font-weight: bold;
  opacity: 0.8;
}
.desenvolvedores h2 {
  font-weight: bolder;
  font-size: 1.5rem;
}
</style>
