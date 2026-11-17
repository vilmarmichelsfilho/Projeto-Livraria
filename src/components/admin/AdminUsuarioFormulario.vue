<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UsuariosForm from '@/components/UsuariosForm.vue';
import service from '@/services/usuariosService';
import { mensagemErro } from '@/services/api';
import AdminIcon from './AdminIcon.vue';
const props = defineProps({ editar: Boolean });
const route = useRoute(),
  router = useRouter();
const usuario = ref(null),
  carregando = ref(true),
  busy = ref(false),
  erro = ref('');
async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    usuario.value = props.editar ? await service.obter(route.params.id) : {};
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    carregando.value = false;
  }
}
async function salvar(dados) {
  if (busy.value) return;
  busy.value = true;
  erro.value = '';
  try {
    const usuario = props.editar
      ? await service.atualizarAdmin(route.params.id, dados)
      : await service.cadastrarAdmin(dados);
    await router.push(`/admin/usuarios/${usuario.id}?salvo=1`);
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
</script>
<template>
  <section class="admin-page admin-users admin-user-form-page">
    <header class="admin-page-header">
      <h1>
        <RouterLink
          to="/admin/usuarios"
          class="admin-mobile-only admin-back-link"
          aria-label="Voltar aos usuários"
          ><AdminIcon name="back" /></RouterLink
        >{{ editar ? 'Editar usuário' : 'Cadastrar usuário' }}
      </h1>
      <p class="admin-subtitle">
        <span class="admin-desktop-only"
          >Os campos com asterisco são obrigatórios</span
        ><span class="admin-mobile-only"
          >Telefone e endereço são obrigatórios.</span
        >
      </p>
    </header>
    <p
      v-if="carregando"
      role="status"
    >
      Carregando usuário…
    </p>
    <div
      v-if="erro"
      class="admin-feedback error"
      role="alert"
    >
      {{ erro }}
      <button
        v-if="!usuario"
        @click="carregar"
      >
        Tentar novamente
      </button>
    </div>
    <UsuariosForm
      v-if="!carregando && usuario"
      :inicial="usuario"
      :editar="editar"
      :busy="busy"
      @save="salvar"
    />
  </section>
</template>
