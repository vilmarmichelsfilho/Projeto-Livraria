<script setup>
import { computed } from 'vue'
import BookIcon from '@iconify-vue/mdi/book-open-variant'
import CartIcon from '@iconify-vue/mdi/cart-outline'
import AccountIcon from '@iconify-vue/mdi/account-outline'
import HomeIcon from '@iconify-vue/mdi/home-outline'
import HeartIcon from '@iconify-vue/mdi/heart-outline'
import { carrinho } from '@/utils/cartUtils'

const quantidade = computed(() => carrinho.reduce((total, item) => total + item.quantidade, 0))
</script>

<template>
  <header class="av-mobile-header">
    <RouterLink to="/" class="marca"><BookIcon aria-hidden="true" /><span>IFLibrary</span></RouterLink>
    <div class="atalhos">
      <RouterLink to="/carrinho" :aria-label="`Carrinho, ${quantidade} itens`" class="carrinho">
        <CartIcon aria-hidden="true" /><span v-if="quantidade" class="contador">{{ quantidade }}</span>
      </RouterLink>
      <RouterLink to="/usuario" aria-label="Minha conta"><AccountIcon aria-hidden="true" /></RouterLink>
    </div>
  </header>
  <nav class="av-mobile-nav" aria-label="Navegação principal">
    <RouterLink to="/"><HomeIcon aria-hidden="true" /><span>Início</span></RouterLink>
    <RouterLink to="/" class="selecionado" aria-current="true"><BookIcon aria-hidden="true" /><span>Livros</span></RouterLink>
    <RouterLink to="/favoritos"><HeartIcon aria-hidden="true" /><span>Favoritos</span></RouterLink>
    <RouterLink to="/usuario"><AccountIcon aria-hidden="true" /><span>Conta</span></RouterLink>
  </nav>
</template>

<style scoped>
.av-mobile-header, .av-mobile-nav { display: none; }
@media (max-width: 650px) {
  .av-mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 16px; background: #a0cddd; color: #263e49; min-height: 56px; }
  a { display: flex; align-items: center; justify-content: center; color: inherit; min-height: 44px; }
  .marca { gap: 6px; font-size: 20px; }
  .marca span { font-weight: 700; }
  svg { width: 24px; height: 24px; flex-shrink: 0; }
  .marca svg { width: 21px; }
  .atalhos { display: flex; gap: 6px; }
  .atalhos a { width: 44px; }
  .carrinho { position: relative; }
  .contador { position: absolute; top: 0; right: 1px; background: #476978; color: #fff; font-size: 11px; line-height: 18px; min-width: 18px; padding: 0 3px; border-radius: 50%; text-align: center; }
  .av-mobile-nav { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); position: fixed; bottom: 0; left: 0; right: 0; z-index: 10; gap: 12px; padding: 6px 8px calc(6px + env(safe-area-inset-bottom)); min-height: 70px; border-top: 1px solid #e1ebef; background: #fff; color: #6f8590; }
  .av-mobile-nav a { flex-direction: column; gap: 3px; min-height: 56px; border-radius: 9px; font-size: 10px; }
  .av-mobile-nav svg { width: 21px; height: 21px; }
  .av-mobile-nav .selecionado { color: #476978; background: #e9f5fa; }
  a:focus-visible { outline: 2px solid #476978; outline-offset: 2px; }
}
</style>
