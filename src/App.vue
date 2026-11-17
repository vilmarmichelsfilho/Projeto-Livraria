<script setup>
import { RouterView, useRoute } from 'vue-router'
import NavegacaoMobile from './components/Avaliacoes/NavegacaoMobile.vue'
import appFooter from './components/layout/appFooter.vue';
import AppHeader from './components/layout/appHeader.vue';
import { onMounted, ref } from 'vue'
import { carregarCatalogo, carregandoLoja, erroLoja, operandoLoja } from './services/lojaService.js'
import { carregarCarrinho } from './utils/cartUtils.js'
import { mensagemErroApi } from './services/api.js'
const route = useRoute()
const pronta = ref(false)
async function carregar() {
  carregandoLoja.value = true
  erroLoja.value = ''
  try {
    await carregarCatalogo()
    await carregarCarrinho()
    pronta.value = true
  } catch (erro) {
    erroLoja.value = mensagemErroApi(erro, 'carregar a loja')
  } finally { carregandoLoja.value = false }
}
onMounted(carregar)
</script>

<template>
  <div class="app-container" :class="{ 'avaliacao-mobile': route.name === 'Avaliar Livro' }">
    <AppHeader v-if="!route.meta.adminAvaliacoes" class="cabecalho-desktop"></AppHeader>
    <NavegacaoMobile v-if="route.name === 'Avaliar Livro'" />
     <p class="estado-loja" v-if="carregandoLoja" role="status">Carregando dados…</p>
     <div class="estado-loja" v-if="erroLoja" role="alert">{{ erroLoja }} <button :disabled="carregandoLoja || operandoLoja" @click="carregar">Tentar novamente</button></div>
     <p class="estado-loja" v-if="operandoLoja" role="status">Salvando alterações…</p>
     <RouterView v-if="pronta" class="content-wrap"/>
     <p class="estado-loja">Demonstração com o cliente Ana Exemplo. Favoritos e carrinho são compartilhados entre os acessos desse cliente.</p>
     <appFooter v-if="!route.meta.adminAvaliacoes" class="rodape-desktop"></appFooter>
  </div>
</template>
<style scoped>
.estado-loja { padding: 12px 24px; text-align: center; }
div.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content-wrap {
  flex: 1;
}
@media (max-width: 650px) {
  :global(html:has(.avaliacao-mobile)) { scroll-padding-bottom: calc(90px + env(safe-area-inset-bottom)); }
  .avaliacao-mobile { padding-bottom: calc(70px + env(safe-area-inset-bottom)); }
  .avaliacao-mobile .cabecalho-desktop, .avaliacao-mobile .rodape-desktop { display: none; }
}
</style>
