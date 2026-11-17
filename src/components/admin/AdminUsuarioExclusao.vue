<script setup>
import { computed, ref, onMounted } from 'vue';
import service from '@/services/usuariosService';
import pedidosService from '@/services/pedidosService';
import { mensagemErro } from '@/services/api';
import AdminModal from './AdminModal.vue';
import AdminIcon from './AdminIcon.vue';
const props = defineProps({
  usuario: { type: Object, required: true },
  inativar: Boolean,
});
const emit = defineEmits(['close', 'saved']);
const pedidos = ref([]),
  usuarios = ref([]),
  atual = ref(null),
  carregando = ref(true),
  busy = ref(false),
  erro = ref('');
const temPedidos = computed(() =>
  pedidos.value.some((p) => String(p.id_usuario) === String(props.usuario.id)),
);
const propria = computed(
  () => String(atual.value?.id) === String(props.usuario.id),
);
const ultimo = computed(
  () =>
    props.usuario.perfil === 'ADMIN' &&
    props.usuario.ativo &&
    usuarios.value.filter((u) => u.perfil === 'ADMIN' && u.ativo).length <= 1,
);
const protegido = computed(() => propria.value || ultimo.value);
const titulo = computed(() =>
  propria.value
    ? 'Esta conta está em uso'
    : ultimo.value
      ? 'Último administrador ativo'
      : temPedidos.value
        ? 'Este usuário tem pedidos'
        : props.inativar
          ? 'Inativar usuário?'
          : 'Excluir usuário?',
);
async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    [pedidos.value, usuarios.value, atual.value] = await Promise.all([
      pedidosService.listar(),
      service.listar(),
      service.atual(),
    ]);
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    carregando.value = false;
  }
}
async function confirmar() {
  if (busy.value || carregando.value || protegido.value || erro.value) return;
  busy.value = true;
  erro.value = '';
  try {
    if (temPedidos.value || props.inativar)
      await service.atualizarAdmin(props.usuario.id, { ativo: false });
    else await service.excluir(props.usuario.id);
    emit('saved');
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
</script>
<template>
  <AdminModal
    modal-class="admin-user-modal"
    :label="titulo"
    :busy="busy"
    @close="emit('close')"
    ><p
      v-if="carregando"
      role="status"
    >
      Verificando cadastro…
    </p>
    <template v-else
      ><span
        class="admin-modal-symbol"
        :class="{ lock: temPedidos || protegido }"
        ><AdminIcon :name="temPedidos || protegido ? 'lock' : 'trash'"
      /></span>
      <h2>{{ titulo }}</h2>
      <p>
        {{
          protegido
            ? 'A conta em uso e o último administrador ativo devem ser preservados.'
            : temPedidos
              ? `${usuario.nome} possui compras no histórico.`
              : `O cadastro de ${usuario.nome} será ${inativar ? 'inativado' : 'removido'}.`
        }}
      </p>
      <p class="admin-modal-explanation">
        {{
          protegido
            ? 'Utilize outra conta administrativa para gerenciar este cadastro e mantenha ao menos um administrador ativo.'
            : temPedidos
              ? 'Inative o cadastro para preservar o histórico dos pedidos.'
              : inativar
                ? 'O usuário não poderá entrar na conta nem ser selecionado em novos pedidos.'
                : 'Sem pedidos vinculados. As avaliações deste usuário também serão removidas.'
        }}
      </p></template
    >
    <p
      v-if="erro"
      class="admin-feedback error"
      role="alert"
    >
      {{ erro }}
    </p>
    <div class="admin-modal-actions">
      <button
        class="admin-button-secondary"
        :disabled="busy"
        @click="emit('close')"
      >
        {{ protegido ? 'Voltar' : 'Cancelar' }}</button
      ><button
        v-if="!carregando && !protegido && !erro"
        :class="temPedidos || inativar ? '' : 'admin-button-destructive'"
        :disabled="busy"
        @click="confirmar"
      >
        {{
          busy
            ? 'Salvando…'
            : temPedidos || inativar
              ? 'Inativar usuário'
              : 'Excluir usuário'
        }}</button
      ><button
        v-if="erro"
        :disabled="busy"
        @click="carregar"
      >
        Verificar novamente
      </button>
    </div></AdminModal
  >
</template>
