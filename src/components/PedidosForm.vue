<script setup>
const model = defineModel({ type: Object, required: true });
const props = defineProps({
  clientes: { type: Array, default: () => [] },
  novo: Boolean,
  disabled: Boolean,
});
function selecionar() {
  const cliente = props.clientes.find(
    (cliente) => String(cliente.id) === String(model.value.id_usuario),
  );
  if (!cliente) return;
  model.value.destinatario = cliente.nome;
  model.value.endereco_entrega = [
    cliente.endereco,
    cliente.cidade,
    cliente.uf,
    cliente.cep,
  ]
    .filter(Boolean)
    .join(" • ");
}
</script>
<template>
  <div class="admin-form-grid">
    <label class="admin-field"
      ><span>Cliente *</span
      ><select
        v-model="model.id_usuario"
        required
        :disabled="disabled"
        @change="selecionar"
      >
        <option value="" disabled>Selecione um cliente</option>
        <option
          v-for="cliente in clientes"
          :key="cliente.id"
          :value="cliente.id"
          :disabled="!cliente.ativo"
        >
          {{ cliente.nome }}{{ cliente.ativo ? "" : " (inativo)" }}
        </option></select
      ><small
        >Cadastre os clientes em
        <RouterLink to="/admin/usuarios">Usuários</RouterLink>. Somente clientes
        ativos podem receber novos pedidos.</small
      ></label
    >
    <label v-if="novo" class="admin-field admin-desktop-only"
      ><span>Situação</span
      ><select disabled aria-label="Situação inicial">
        <option>Rascunho</option>
      </select></label
    >
    <label v-if="novo" class="admin-field admin-desktop-only"
      ><span>Destinatário</span
      ><input
        v-model="model.destinatario"
        :disabled="disabled"
        autocomplete="name"
    /></label>
    <label class="admin-field admin-desktop-only"
      ><span>Endereço de entrega</span
      ><input
        v-model="model.endereco_entrega"
        :disabled="disabled"
        autocomplete="street-address"
    /></label>
    <div class="admin-mobile-only admin-mobile-draft-info">
      <span class="admin-badge">Rascunho</span>
      <details class="admin-delivery-details">
        <summary>Dados de entrega</summary>
        <label class="admin-field"
          ><span>Destinatário</span
          ><input
            v-model="model.destinatario"
            :disabled="disabled"
            autocomplete="name"
        /></label>
        <label class="admin-field"
          ><span>Endereço de entrega</span
          ><input
            v-model="model.endereco_entrega"
            :disabled="disabled"
            autocomplete="street-address"
        /></label>
      </details>
    </div>
  </div>
</template>
