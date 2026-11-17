<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <footer>
    <div class="container">
      <div class="container-esquerda">
        <RouterLink
          class="logo"
          to="/"
          >IFLibrary</RouterLink
        >
        <div class="redes-sociais">
          <a
            href="https://www.instagram.com"
            aria-label="Instagram"
          >
            <v-icon
              icon="mdi-instagram"
              size="1em"
            />
          </a>
          <a
            href="https://www.facebook.com"
            aria-label="Facebook"
          >
            <v-icon
              icon="mdi-facebook"
              size="1em"
            />
          </a>
          <a
            href="https://x.com"
            aria-label="Twitter"
          >
            <v-icon
              icon="mdi-twitter"
              size="1em"
            />
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
              <v-icon
                icon="mdi-phone"
                size="1em"
              />
              <span>+55 47 40045263</span>
            </li>
            <li>
              <v-icon
                icon="mdi-clock-outline"
                size="1em"
              />
              <span>8h às 23h - Seg a Sex</span>
            </li>
            <li>
              <v-icon
                icon="mdi-email"
                size="1em"
              />
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
  background-color: #a0cde0;
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

<style>
/* Estilos da tela, mantidos no componente. */

@media (max-width: 700px) {
  footer .container {
    flex-wrap: wrap;
    gap: 28px;
    padding: 20px 0;
  }
  footer .desenvolvedores h2 {
    font-size: 20px;
  }
  footer .desenvolvedores ul li {
    font-size: 15px;
  }
  footer .direitos p {
    font-size: 13px;
  }
}
</style>
