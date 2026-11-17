<script setup>
import { ref, watch, computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { favoritos } from '@/utils/favoritos';
import { carrinho } from '@/utils/cartUtils';
const route = useRoute();
const router = useRouter();
const pesquisa = ref(String(route.query.q || ''));
// computed recalcula o contador quando o carrinho muda.
const quantidadeCarrinho = computed(() => {
  let quantidade = 0;
  for (const item of carrinho) {
    quantidade += item.quantidade;
  }
  return quantidade;
});
watch(
  () => route.query.q,
  (valor) => {
    pesquisa.value = String(valor || '');
  },
);
function pesquisar() {
  const texto = pesquisa.value.trim();
  if (texto) {
    router.push({ path: '/', query: { q: texto } });
  } else {
    router.push('/');
  }
}
</script>
<template>
  <header class="loja-header">
    <RouterLink
      to="/"
      class="loja-marca"
      ><v-icon icon="mdi-book-open-page-variant" /><span
        >IFLibrary</span
      ></RouterLink
    >
    <form
      class="busca-loja"
      role="search"
      @submit.prevent="pesquisar"
    >
      <label
        class="sr-only"
        for="busca-catalogo"
        >Buscar livros por título ou autor</label
      ><input
        id="busca-catalogo"
        v-model="pesquisa"
        type="search"
        placeholder="Buscar livro ou autor…"
      /><button
        type="submit"
        aria-label="Buscar livros"
      >
        <v-icon
          icon="mdi-magnify"
          size="34"
        />
      </button>
    </form>
    <nav aria-label="Navegação da loja">
      <RouterLink
        to="/carrinho"
        aria-label="Carrinho"
        ><v-icon icon="mdi-cart" /><span
          v-if="quantidadeCarrinho"
          class="contador"
          >{{ quantidadeCarrinho }}</span
        ></RouterLink
      ><RouterLink
        to="/favoritos"
        aria-label="Favoritos"
        ><v-icon icon="mdi-star" /><span
          v-if="favoritos.length"
          class="contador"
          >{{ favoritos.length }}</span
        ></RouterLink
      >
      <RouterLink
        to="/minha-conta"
        aria-label="Minha conta"
      >
        <v-icon icon="mdi-account" />
      </RouterLink>
      <RouterLink
        class="link-admin"
        to="/admin/livros"
        >Administrar livros</RouterLink
      >
    </nav>
  </header>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.loja-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 84px;
  padding: 16px 32px;
  background: var(--livraria-azul);
}
.loja-marca {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 23px;
  color: black;
}
.loja-marca .v-icon {
  font-size: 46px;
  width: 46px;
  height: 46px;
  min-width: 46px;
}
.loja-marca span {
  font-weight: 700;
}
.busca-loja {
  flex: 1;
  max-width: 650px;
  display: flex;
  padding: 4px 16px;
  background: #7db6cf;
  border-radius: 50px;
}
.busca-loja input {
  width: 100%;
  min-width: 0;
  min-height: 42px;
  background: transparent;
  border: 0;
  color: black;
}
.busca-loja button {
  background: transparent;
  border: 0;
  cursor: pointer;
}
.loja-header nav {
  display: flex;
  align-items: center;
  gap: 22px;
}
.loja-header nav a {
  display: flex;
  align-items: center;
  position: relative;
  color: black;
}
.loja-header nav .v-icon {
  font-size: 32px;
  width: 32px;
  height: 32px;
  min-width: 32px;
}
.loja-header .link-admin {
  font-size: 13px;
  font-weight: 700;
}
.contador {
  position: absolute;
  top: -7px;
  right: -8px;
  color: white;
  background: #af4653;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
  font-size: 12px;
}
@media (max-width: 1050px) {
  .loja-header {
    gap: 18px;
  }
  .loja-marca span {
    font-size: 20px;
  }
  .loja-header .link-admin {
    max-width: 90px;
  }
  .loja-header nav {
    gap: 14px;
  }
}
@media (max-width: 700px) {
  .loja-header {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: 12px 20px;
    gap: 12px;
  }
  .loja-marca .v-icon {
    font-size: 28px;
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
  .loja-marca span {
    font-size: 20px;
  }
  .loja-header nav {
    grid-column: 2;
    grid-row: 1;
    gap: 14px;
  }
  .loja-header nav .v-icon {
    font-size: 25px;
    width: 25px;
    height: 25px;
    min-width: 25px;
  }
  .loja-header .link-admin {
    font-size: 11px;
    max-width: 66px;
  }
  .busca-loja {
    grid-row: 2;
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>
