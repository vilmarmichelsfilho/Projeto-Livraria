<script setup>
import { computed } from 'vue';
import { carrinho } from '@/utils/cartUtils';
import ContaIcone from '@/components/ContaIcone.vue';
const quantidade = computed(() => {
  let total = 0;
  for (const item of carrinho) {
    total += item.quantidade;
  }
  return total;
});
const links = [
  { nome: 'inicio', texto: 'Início', to: '/' },
  { nome: 'livros', texto: 'Livros', to: '/#livros' },
  { nome: 'favoritos', texto: 'Favoritos', to: '/favoritos' },
  { nome: 'conta', texto: 'Conta', to: '/minha-conta' },
];
</script>
<template>
  <header class="conta-mobile-cabecalho">
    <RouterLink
      class="conta-mobile-marca"
      to="/"
      ><ContaIcone nome="livros" /><span>IFLibrary</span></RouterLink
    >
    <div class="conta-mobile-atalhos">
      <RouterLink
        to="/carrinho"
        :aria-label="'Carrinho, ' + quantidade + ' itens'"
        ><ContaIcone nome="carrinho" /><span
          v-if="quantidade"
          class="conta-mobile-quantidade"
          >{{ quantidade }}</span
        ></RouterLink
      ><RouterLink
        to="/minha-conta"
        aria-label="Minha conta"
        ><ContaIcone nome="conta"
      /></RouterLink>
    </div>
  </header>
  <nav
    class="conta-mobile-nav"
    aria-label="Navegação principal"
  >
    <RouterLink
      v-for="link in links"
      :key="link.nome"
      :to="link.to"
      :class="{ selecionado: link.nome === 'conta' }"
      :aria-current="link.nome === 'conta' ? 'page' : undefined"
      ><ContaIcone :nome="link.nome" /><span>{{ link.texto }}</span></RouterLink
    >
  </nav>
</template>
<style scoped>
.conta-mobile-cabecalho,
.conta-mobile-nav {
  display: none;
}
@media (max-width: 680px) {
  .conta-mobile-cabecalho {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 56px;
    flex-shrink: 0;
    background: #a0cde0;
    color: #28434f;
  }
  .conta-mobile-marca {
    display: flex;
    align-items: center;
    gap: 10px;
    color: inherit;
    font-size: 21px;
    font-weight: 700;
    min-height: 44px;
  }
  .conta-mobile-marca span {
    font-weight: 700;
  }
  .conta-mobile-nav a.selecionado span {
    font-weight: 700;
  }
  .conta-mobile-marca .v-icon {
    font-size: 21px;
    width: 21px;
    height: 24px;
  }
  .conta-mobile-atalhos {
    display: flex;
    gap: 6px;
  }
  .conta-mobile-atalhos a {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 40px;
    height: 44px;
    color: #476b7b;
  }
  .conta-mobile-atalhos .v-icon {
    font-size: 24px;
    width: 24px;
    height: 24px;
  }
  .conta-mobile-quantidade {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    background: #476b7b;
    color: white;
  }
  .conta-mobile-nav {
    position: fixed;
    z-index: 20;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    background: #fff;
    border-top: 1px solid #d5e4eb;
    padding: 5px 8px calc(10px + env(safe-area-inset-bottom, 0px));
  }
  .conta-mobile-nav a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-height: 56px;
    border-radius: 10px;
    color: #718d9c;
    font-size: 11px;
    line-height: 16px;
  }
  .conta-mobile-nav a.selecionado {
    background: #e9f5fa;
    color: #476b7b;
    font-weight: 700;
  }
  .conta-mobile-nav .v-icon {
    font-size: 21px;
    height: 21px;
    width: 21px;
  }
  a:focus-visible {
    outline: 3px solid #257799;
    outline-offset: 1px;
  }
}
</style>
