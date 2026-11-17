<script setup>
import { reactive } from "vue";
const props = defineProps({
  inicial: { type: Object, default: () => ({}) },
  editar: Boolean,
  busy: Boolean,
});
const emit = defineEmits(["save"]);
const dados = reactive({
  nome: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  uf: "",
  cep: "",
  perfil: "CLIENTE",
  ativo: true,
  senha: "",
  ...props.inicial,
});
const campos = [
  ["nome", "Nome completo", "text"],
  ["email", "E-mail", "email"],
  ["telefone", "Telefone", "tel"],
  ["endereco", "Endereço", "text"],
  ["cidade", "Cidade", "text"],
  ["uf", "UF", "text"],
  ["cep", "CEP", "text"],
];
const ufs =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(
    " ",
  );
</script>
<template>
  <form
    class="admin-user-panel admin-user-form"
    @submit.prevent="emit('save', { ...dados })"
  >
    <fieldset :disabled="busy" class="admin-user-fieldset">
      <div class="admin-form-grid">
        <label
          v-for="[chave, titulo, tipo] in campos"
          :key="chave"
          class="admin-field"
          ><span>{{ titulo }} *</span
          ><select v-if="chave === 'uf'" v-model="dados.uf" required>
            <option value="" disabled>Selecione a UF</option>
            <option v-for="uf in ufs" :key="uf" :value="uf">
              {{ uf }}
            </option></select
          ><input
            v-else
            v-model="dados[chave]"
            :type="tipo"
            required
            placeholder="Preencha este campo"
            :maxlength="chave === 'uf' ? 2 : chave === 'cep' ? 9 : undefined"
            :pattern="chave === 'cep' ? '[0-9]{5}-?[0-9]{3}' : undefined"
        /></label>
        <label class="admin-field"
          ><span>Perfil *</span
          ><select v-model="dados.perfil" required>
            <option value="CLIENTE">Cliente</option>
            <option value="ADMIN">Admin</option>
          </select></label
        >
        <label class="admin-field"
          ><span>Ativo *</span
          ><select v-model="dados.ativo">
            <option :value="true">Sim</option>
            <option :value="false">Não</option>
          </select></label
        >
        <label v-if="!editar" class="admin-field"
          ><span>Senha inicial *</span
          ><input
            v-model="dados.senha"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            placeholder="Preencha este campo"
          /><small>Mínimo de 8 caracteres.</small></label
        >
      </div>
      <p class="admin-user-form-hint admin-mobile-only">
        O e-mail deve ser único. Preserve o último administrador ativo.
      </p>
      <div class="admin-actions">
        <button :disabled="busy">
          {{
            busy
              ? "Salvando…"
              : editar
                ? "Salvar alterações"
                : "Cadastrar usuário"
          }}</button
        ><RouterLink
          to="/admin/usuarios"
          class="admin-button admin-button-secondary"
          >Cancelar</RouterLink
        >
      </div>
    </fieldset>
  </form>
</template>
