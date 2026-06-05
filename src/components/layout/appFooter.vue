
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
        <RouterLink class="logo" to="/">IFbooks</RouterLink>
        <div class="redes-sociais">
          <a href="#">
            <InstagramIcon height="1em" />
          </a>
          <a href="#">
            <FacebookIcon height="1em" />
          </a>
          <a href="#">
            <TwitterIcon height="1em" />
          </a>
        </div>
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
              <span>contato@ifbooks.com</span>
            </li>
          </ul>
        </div>

        <div class="bandeiras-de-cartoes">
          <ul>
            <li><img src="/images/paypal-logo.jpg" alt="PayPal" /></li>
            <li><img src="/images/mastercard-logo.png" alt="Mastercard" /></li>
            <li><img src="/images/visa-logo.png" alt="Visa" /></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="direitos">
      <p>© Alguns direitos reservados. IFbooks 2025.</p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background-color: #27ae60;
  padding: 4vw 0 1.5vw 0;
  font-size: 2rem;
}

div.container {
  display: flex;
  justify-content: space-between;
  margin: 0 8vw;
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
  margin: 0 0.8vw 0 0;
  font-size: 4rem;
}
div.contato ul {
  padding: 0;
  margin: 0;
}
div.contato ul li {
  margin-bottom: 1vw;
}
div.contato ul li {
  margin-bottom: 1vw;
}
div.bandeiras-de-cartoes {
  margin-top: 3vw;
}

div.bandeiras-de-cartoes ul {
  display: flex;
  padding: 0;
  margin: 0;
}

div.bandeiras-de-cartoes ul li img {
  height: 2.3vw;
  width: 3.3vw;
  margin: 0 0.8vw 0 0;
}

div.direitos {
  padding-top: 1vw;
  margin-top: 3vw;
  text-align: center;
  border-top: 1px solid #ffffff;
}

a {
  color: white;
}

li {
  list-style: none;
  display: flex;
  align-items: center;
  padding: 0;
}

li span {
  margin-left: 0.6vw;
  color: #ffffff99;
}

p {
  color: #ffffff99;
}

h3 {
  color: white;
  margin: 0 0 1rem 0;
}
</style>
