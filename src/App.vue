<script setup>
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import ContaMobileChrome from './components/layout/ContaMobileChrome.vue';
import appFooter from './components/layout/appFooter.vue';
import AppHeader from './components/layout/appHeader.vue';
const route = useRoute();
const contaMobile = computed(() =>
  [
    '/entrar',
    '/cadastro',
    '/minha-conta',
    '/minha-conta/editar',
    '/minha-conta/senha',
  ].includes(route.path),
);
</script>

<template>
  <div
    class="app-container"
    :class="{ 'conta-shell': contaMobile }"
  >
    <ContaMobileChrome v-if="contaMobile" />
    <AppHeader
      v-if="!route.meta.admin"
      class="conta-desktop-header"
    />
    <RouterView class="content-wrap" />
    <appFooter
      v-if="!route.meta.admin"
      class="conta-desktop-footer"
    />
  </div>
</template>
<style scoped>
div.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content-wrap {
  flex: 1;
}
@media (max-width: 680px) {
  div.conta-shell {
    min-height: 100dvh;
    padding-bottom: calc(74px + env(safe-area-inset-bottom, 0px));
  }
  .conta-shell .conta-desktop-header,
  .conta-shell .conta-desktop-footer {
    display: none;
  }
}
</style>

<style>
/* Estilos da tela, mantidos no componente. */
/* semantic color variables for this project */
:root {
  --color-background: var(--vt-c-white);
  --color-background-soft: var(--vt-c-white-soft);
  --color-background-mute: var(--vt-c-white-mute);

  --color-border: var(--vt-c-divider-light-2);
  --color-border-hover: var(--vt-c-divider-light-1);

  --color-heading: var(--vt-c-text-light-1);
  --color-text: var(--vt-c-text-light-1);

  --section-gap: 160px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--vt-c-black);
    --color-background-soft: var(--vt-c-black-soft);
    --color-background-mute: var(--vt-c-black-mute);

    --color-border: var(--vt-c-divider-dark-2);
    --color-border-hover: var(--vt-c-divider-dark-1);

    --color-heading: var(--vt-c-text-dark-1);
    --color-text: var(--vt-c-text-dark-2);
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  font-weight: normal;
}

body {
  min-height: 100vh;
  color: var(--color-text);
  background: #f9feff;
  transition:
    color 0.5s,
    background-color 0.5s;
  line-height: 1.6;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  font-weight: normal;
}

a,
.green {
  text-decoration: none;
  color: #476978;
  transition: 0.4s;
}

/* Tokens e composição das telas de Igor, a partir do Figma. */
:root {
  --livraria-azul: #a0cde0;
  --livraria-acao: #476978;
  --livraria-borda: #d6e3e8;
  --livraria-suave: #eaf5fa;
  --livraria-texto: #111820;
  --livraria-perigo: #af4653;
}
body {
  color: var(--livraria-texto);
}
button,
input,
select,
textarea {
  font: inherit;
}
button,
a,
input,
select,
textarea {
  touch-action: manipulation;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
:focus-visible {
  outline: 3px solid #147a9c;
  outline-offset: 3px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 11px 24px;
  border: 1px solid var(--livraria-acao);
  border-radius: 6px;
  background: var(--livraria-acao);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  line-height: 1.35;
}
.btn:not(:disabled):hover {
  filter: brightness(0.93);
}
.btn.secundario {
  background: white;
  color: var(--livraria-acao);
}
.btn.perigo {
  background: var(--livraria-perigo);
  border-color: var(--livraria-perigo);
}
.btn.texto-perigo,
.erro-campo {
  color: var(--livraria-perigo);
}
.btn .v-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.texto-suave,
.subtitulo {
  color: #53636a;
}
.subtitulo {
  margin: 4px 0 30px;
}
.campo label {
  display: block;
  font-weight: 700;
  margin-bottom: 6px;
}
.campo input,
.campo select,
.campo textarea {
  display: block;
  width: 100%;
  min-height: 48px;
  padding: 11px 14px;
  border: 1px solid var(--livraria-borda);
  border-radius: 6px;
  background: white;
  color: var(--livraria-texto);
}
.campo textarea {
  resize: vertical;
  min-height: 88px;
}
.campo [aria-invalid='true'] {
  border: 2px solid var(--livraria-perigo);
}
.erro-campo {
  font-size: 14px;
  margin-top: 6px;
}
.painel {
  background: white;
  border: 1px solid var(--livraria-borda);
  border-radius: 14px;
}
.estado-requisicao {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 22px;
  margin: 16px 0;
  border: 1px solid var(--livraria-borda);
  border-radius: 9px;
  background: var(--livraria-suave);
}
.estado-requisicao.sucesso {
  color: #21664d;
  background: #edf8f2;
  border-color: #b9ddc9;
}
.estado-requisicao.erro {
  color: #873541;
  background: #fff2f3;
  border-color: #e5bdc3;
}
.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #b9d5df;
  border-top-color: var(--livraria-acao);
  border-radius: 50%;
  animation: girar 1s linear infinite;
}
@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
.acoes-form {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  margin-top: 36px;
}
.preco-detalhe {
  font-size: 34px;
  font-weight: 700;
  color: var(--livraria-acao);
  margin: 20px 0;
}
.descricao-livro {
  margin: 28px 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.link-voltar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  font-weight: 700;
}
@media (max-width: 700px) {
  .subtitulo {
    font-size: 14px;
    margin-bottom: 24px;
  }
  .cadastrar {
    width: 100%;
  }
  .acoes-form {
    gap: 12px;
  }
  .acoes-form .btn {
    flex: 1 1 100%;
  }
  .btn {
    min-height: 48px;
  }
}
</style>
