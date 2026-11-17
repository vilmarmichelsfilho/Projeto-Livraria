<script setup>
import { formataPreco } from '@/utils/produtosUtils';
import { RouterLink } from 'vue-router';
import CapaLivro from '@/components/CapaLivro.vue';
defineProps({
  titulo: String,
  endereco: String,
  autor: String,
  preco: Number,
  capa: String,
  id: Number,
  favorito: Boolean,
  estoque: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
  ocupado: Boolean,
});
const emit = defineEmits(['adicionarcarrinho', 'favoritar']);
</script>
<template>
  <li class="produto-card">
    <RouterLink :to="`/livro/${endereco}`"
      ><CapaLivro
        :src="capa"
        :titulo="titulo"
    /></RouterLink>
    <h2>
      <RouterLink :to="`/livro/${endereco}`">{{ titulo }}</RouterLink>
    </h2>
    <p class="autor">{{ autor }}</p>
    <div class="preco-favorito">
      <p>{{ formataPreco(preco) }}</p>
      <button
        type="button"
        class="favoritar"
        :aria-label="`${favorito ? 'Remover' : 'Adicionar'} ${titulo} ${favorito ? 'dos' : 'aos'} favoritos`"
        :aria-pressed="favorito"
        @click="emit('favoritar', id)"
      >
        <v-icon
          icon="mdi-star"
          size="24"
          v-if="favorito"
        /><v-icon
          icon="mdi-star-outline"
          size="24"
          v-else
        />
      </button>
    </div>
    <button
      class="btn adicionar-carrinho"
      :disabled="estoque <= 0 || !ativo || ocupado"
      @click="emit('adicionarcarrinho', id, 1)"
    >
      <v-icon
        icon="mdi-cart"
        size="19"
      />{{
        ocupado
          ? 'Adicionando…'
          : estoque <= 0 || !ativo
            ? 'Indisponível'
            : 'Adicionar ao carrinho'
      }}
    </button>
  </li>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.produto-card {
  display: flex;
  flex-direction: column;
  width: 310px;
  padding: 14px;
  border-radius: 14px;
  background: var(--livraria-azul);
}
.produto-card .capa-livro {
  height: 415px;
  border-radius: 7px;
  object-fit: contain;
}
.produto-card h2 {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
  margin-top: 5px;
}
.produto-card h2 a {
  color: black;
  font-weight: inherit;
}
.produto-card .autor {
  font-size: 14px;
  color: #4d4c4c;
  font-weight: 700;
}
.preco-favorito {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}
.preco-favorito p {
  font-weight: 700;
}
.favoritar {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--livraria-acao);
}
.adicionar-carrinho {
  margin: 12px 8px 0;
  padding: 15px 10px;
  font-size: 15px;
}
@media (max-width: 700px) {
  .produto-card {
    width: 100%;
    max-width: 350px;
    padding: 16px;
  }
  .produto-card .capa-livro {
    height: 390px;
  }
  .produto-card h2 {
    font-size: 19px;
  }
  .adicionar-carrinho {
    margin: 12px 0 0;
  }
}
</style>
