<script setup>
import BookOpenVariantIcon from "@iconify-vue/mdi/book-open-variant";
import CartIcon from "@iconify-vue/mdi/cart";
import AccountIcon from "@iconify-vue/mdi/account";
import StarIcon from "@iconify-vue/mdi/star";
import SearchIcon from "@iconify-vue/mdi/search";
import { ref, watch, computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { produtos } from "@/data/produtos";
import { carrinho } from "@/utils/cartUtils";

let quantidadefavoritos = computed(() => {
  return produtos.filter((item) => item.favorito).length;
});
const quantidadeCarrinho = computed(() =>
  carrinho.reduce((total, item) => total + item.quantidade, 0),
);
const route = useRoute();
const router = useRouter();

const pesquisa = ref(route.query.q ?? "");

watch(pesquisa, (valor) => {
  router.push({
    path: "/",
    query: valor ? { q: valor } : {},
  });
});

watch(
  () => route.query.q,
  (valor) => {
    pesquisa.value = valor ?? "";
  },
);
</script>

<template>
  <div class="container">
    <div class="logo">
      <RouterLink to="/">
        <BookOpenVariantIcon style="width: 46px" />
        <h2>IFLibrary</h2>
      </RouterLink>
    </div>
    <div class="barra-pesquisa">
      <input
        v-model="pesquisa"
        type="search"
        placeholder="Buscar produto..."
        class="busca"
        aria-label="Buscar produto"
      />
      <SearchIcon style="width: 46px" />
    </div>
    <div class="nav">
      <nav>
        <ul>
          <li>
            <RouterLink to="/carrinho">
              <CartIcon style="width: 46px" />
            </RouterLink>
          </li>
          <span class="carrinho" v-show="quantidadeCarrinho != 0">{{
            quantidadeCarrinho
          }}</span>
          <li>
            <RouterLink to="/favoritos">
              <StarIcon style="width: 46px" />
            </RouterLink>
          </li>
          <span class="favoritos" v-show="quantidadefavoritos != 0">{{
            quantidadefavoritos
          }}</span>
          <li>
            <RouterLink to="/minha-conta" aria-label="Minha conta">
              <AccountIcon style="width: 46px" />
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.favoritos {
  font-size: 1rem;
  font-weight: bold;
  width: 1.5rem;
  height: 1.5rem;
  text-align: center;
  right: 6rem;
  position: absolute;
  border-radius: 100rem;
  background: red;
}

.carrinho {
  font-size: 1rem;
  font-weight: bold;
  width: 1.5rem;
  height: 1.5rem;
  text-align: center;
  right: 10.5rem;
  position: absolute;
  border-radius: 100rem;
  background: red;
}

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
  background: #a0cde0;
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

.logo a {
  display: flex;
  align-items: center;
  color: black;
  font-family: "Afacad", sans-serif;
  font-weight: bold;
  gap: 5px;
}

.logo h2 {
  font-family: "Afacad", sans-serif;
  font-weight: bold;
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
  background: #7db6cf;
  border-radius: 50px;
  padding: 0 1rem;
}

.barra-pesquisa input {
  width: 600px;
  text-decoration: none;
  border: none;
  background-color: rgba(255, 255, 255, 0);
  font-family: "Afacad", sans-serif;
  font-weight: bold;
  font-size: 1rem;
}

.container {
  align-items: center;
  gap: 24px;
  min-height: 84px;
}
.barra-pesquisa {
  flex: 0 1 650px;
  min-width: 0;
  height: 52px;
  align-items: center;
}
.barra-pesquisa input {
  width: 100%;
  min-width: 0;
  outline-offset: 4px;
}
.barra-pesquisa svg {
  width: 30px !important;
  flex-shrink: 0;
}
.nav ul {
  padding: 0;
}
.nav ul li a svg {
  width: 36px !important;
}
@media (max-width: 680px) {
  .container {
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 16px;
  }
  .barra-pesquisa {
    order: 3;
    flex-basis: 100%;
  }
  .nav ul {
    gap: 12px;
  }
  .logo h2 {
    font-size: 21px;
  }
}
@media (min-width: 1100px) {
  .container {
    display: grid;
    grid-template-columns: 276px minmax(0, 650px) minmax(174px, 1fr);
  }
  .nav {
    justify-self: end;
    margin-right: 76px;
  }
}
</style>
