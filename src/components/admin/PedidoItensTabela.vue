<script setup>
import AdminIcon from "./AdminIcon.vue";
import { moeda } from "@/services/pedidosService";
defineProps({
  itens: { type: Array, required: true },
  editavel: Boolean,
  disabled: Boolean,
  livros: { type: Array, default: () => [] },
});
const emit = defineEmits(["view", "edit", "remove", "quantity"]);
const capa = (livro) =>
  livro?.capa
    ? `${import.meta.env.BASE_URL}${livro.capa.replace(/^\//, "")}`
    : "";
</script>
<template>
  <div class="admin-order-items">
    <div class="admin-table-wrap admin-desktop-only">
      <table class="admin-table" aria-label="Itens do pedido">
        <thead>
          <tr>
            <th scope="col">Livro</th>
            <th scope="col">Quantidade</th>
            <th scope="col">{{ editavel ? "Preço" : "Preço unitário" }}</th>
            <th scope="col">Subtotal</th>
            <th v-if="editavel" scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in itens" :key="item.id_livro">
            <td>{{ item.titulo_livro }}</td>
            <td>{{ item.quantidade }}</td>
            <td>{{ moeda(item.preco_unitario) }}</td>
            <td>{{ moeda(item.quantidade * item.preco_unitario) }}</td>
            <td v-if="editavel">
              <div class="admin-row-actions">
                <button
                  type="button"
                  class="admin-icon-button"
                  :aria-label="`Consultar ${item.titulo_livro}`"
                  :disabled="disabled"
                  @click="emit('view', item)"
                >
                  <AdminIcon name="eye" /></button
                ><button
                  type="button"
                  class="admin-icon-button"
                  :aria-label="`Editar ${item.titulo_livro}`"
                  :disabled="disabled"
                  @click="emit('edit', item)"
                >
                  <AdminIcon name="edit" /></button
                ><button
                  type="button"
                  class="admin-icon-button danger"
                  :aria-label="`Remover ${item.titulo_livro}`"
                  :disabled="disabled"
                  @click="emit('remove', item)"
                >
                  <AdminIcon name="trash" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!itens.length">
            <td :colspan="editavel ? 5 : 4">Este pedido não possui itens.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="admin-item-cards admin-mobile-only"
      aria-label="Itens do pedido"
    >
      <div
        v-for="item in itens"
        :key="item.id_livro"
        class="admin-item-card-group"
      >
        <article class="admin-item-card">
          <img
            v-if="
              capa(
                livros.find(
                  (livro) => String(livro.id) === String(item.id_livro),
                ),
              )
            "
            class="admin-book-cover"
            :src="
              capa(
                livros.find(
                  (livro) => String(livro.id) === String(item.id_livro),
                ),
              )
            "
            :alt="`Capa de ${item.titulo_livro}`"
            loading="lazy"
          />
          <div v-else class="admin-book-cover admin-cover-placeholder">
            <AdminIcon name="book" />
          </div>
          <div class="admin-item-info">
            <h3>{{ item.titulo_livro }}</h3>
            <p
              v-if="
                livros.find(
                  (livro) => String(livro.id) === String(item.id_livro),
                )?.autor
              "
            >
              {{
                livros.find(
                  (livro) => String(livro.id) === String(item.id_livro),
                ).autor
              }}
            </p>
            <strong>{{ moeda(item.preco_unitario) }}</strong
            ><span class="admin-badge">Qtd. {{ item.quantidade }}</span>
          </div>
        </article>
        <div v-if="editavel" class="admin-item-card-actions">
          <div
            class="admin-quantity-stepper"
            :aria-label="`Quantidade de ${item.titulo_livro}`"
          >
            <button
              type="button"
              :aria-label="`Diminuir quantidade de ${item.titulo_livro}`"
              :disabled="disabled || item.quantidade <= 1"
              @click="
                emit('quantity', { ...item, quantidade: item.quantidade - 1 })
              "
            >
              −</button
            ><output aria-live="polite">{{ item.quantidade }}</output
            ><button
              type="button"
              :aria-label="`Aumentar quantidade de ${item.titulo_livro}`"
              :disabled="disabled"
              @click="
                emit('quantity', { ...item, quantidade: item.quantidade + 1 })
              "
            >
              +
            </button>
          </div>
          <button
            type="button"
            class="admin-button-danger"
            :disabled="disabled"
            @click="emit('remove', item)"
          >
            Remover item
          </button>
        </div>
      </div>
      <p v-if="!itens.length" class="admin-items-empty">
        Adicione o primeiro livro ao rascunho.
      </p>
    </div>
  </div>
</template>
