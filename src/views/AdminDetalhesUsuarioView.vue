<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import service from '@/services/usuariosService';
import pedidosService from '@/services/pedidosService';
import { mensagemErro } from '@/services/api';
import AdminIcon from '@/components/admin/AdminIcon.vue';
import AdminUsuarioExclusao from '@/components/admin/AdminUsuarioExclusao.vue';
const route = useRoute(),
  usuario = ref(null),
  pedidos = ref([]),
  carregando = ref(true),
  erro = ref(''),
  modal = ref(false),
  busy = ref(false),
  sucesso = ref(route.query.salvo ? 'Usuário salvo com sucesso.' : '');
const router = useRouter();
const inativar = ref(true);
const quantidade = computed(
  () =>
    pedidos.value.filter(
      (p) => String(p.id_usuario) === String(usuario.value?.id),
    ).length,
);
async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    [usuario.value, pedidos.value] = await Promise.all([
      service.obter(route.params.id),
      pedidosService.listar(),
    ]);
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    carregando.value = false;
  }
}
async function atualizado() {
  modal.value = false;
  if (!inativar.value && !quantidade.value) {
    await router.push('/admin/usuarios');
    return;
  }
  sucesso.value = 'Usuário inativado com sucesso.';
  await carregar();
}
async function ativar() {
  busy.value = true;
  erro.value = '';
  try {
    usuario.value = await service.atualizarAdmin(usuario.value.id, {
      ativo: true,
    });
    sucesso.value = 'Usuário ativado com sucesso.';
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
</script>
<template>
  <section class="admin-page admin-users admin-user-details-page">
    <header class="admin-page-header">
      <h1>
        <RouterLink
          to="/admin/usuarios"
          class="admin-mobile-only admin-back-link"
          aria-label="Voltar aos usuários"
          ><AdminIcon name="back" /></RouterLink
        ><span class="admin-desktop-only">Detalhes do usuário</span
        ><span class="admin-mobile-only">Consultar usuário</span>
      </h1>
      <p
        v-if="usuario"
        class="admin-subtitle"
      >
        Cadastro {{ String(usuario.id).padStart(3, '0') }} •
        {{ usuario.perfil === 'ADMIN' ? 'Admin' : 'Cliente' }}
        {{ usuario.ativo ? 'ativo' : 'inativo' }}
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
    <p
      v-if="sucesso"
      class="admin-feedback"
      role="status"
    >
      {{ sucesso }}
    </p>
    <article
      v-if="usuario && !carregando"
      class="admin-user-panel admin-user-details"
    >
      <div class="admin-user-details-card">
        <div class="admin-user-identity">
          <span class="admin-user-avatar"><AdminIcon name="user" /></span>
          <div>
            <h2>{{ usuario.nome }}</h2>
            <p>{{ usuario.email }}</p>
          </div>
        </div>
        <dl class="admin-user-data">
          <div>
            <dt>Telefone</dt>
            <dd>{{ usuario.telefone || 'Não informado' }}</dd>
          </div>
          <div>
            <dt>Endereço</dt>
            <dd>{{ usuario.endereco || 'Não informado' }}</dd>
          </div>
          <div>
            <dt>
              <span class="admin-desktop-only">Cidade e UF</span
              ><span class="admin-mobile-only">Cidade</span>
            </dt>
            <dd>{{ usuario.cidade }} • {{ usuario.uf }}</dd>
          </div>
          <div>
            <dt>CEP</dt>
            <dd>
              {{
                usuario.cep?.replace(/^(\d{5})(\d{3})$/, '$1-$2') ||
                'Não informado'
              }}
            </dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>{{ usuario.perfil === 'ADMIN' ? 'Admin' : 'Cliente' }}</dd>
          </div>
          <div>
            <dt>Pedidos no histórico</dt>
            <dd>
              {{ quantidade }} {{ quantidade === 1 ? 'pedido' : 'pedidos' }}
            </dd>
          </div>
        </dl>
      </div>
      <div class="admin-actions">
        <RouterLink
          :to="`/admin/usuarios/${usuario.id}/editar`"
          class="admin-button"
          >Editar usuário</RouterLink
        ><button
          v-if="usuario.ativo"
          class="admin-button-secondary"
          @click="
            inativar = true;
            modal = true;
          "
        >
          Inativar usuário</button
        ><button
          v-else
          :disabled="busy"
          @click="ativar"
        >
          {{ busy ? 'Salvando…' : 'Ativar usuário' }}
        </button>
        <button
          class="admin-button-danger admin-mobile-only"
          @click="
            inativar = false;
            modal = true;
          "
        >
          Excluir usuário
        </button>
      </div>
      <p class="admin-user-details-hint admin-mobile-only">
        Cadastros com pedidos são inativados. A exclusão remove também as
        avaliações do usuário.
      </p>
    </article>
    <RouterLink
      to="/admin/usuarios"
      class="admin-user-back"
      >Voltar aos usuários</RouterLink
    ><AdminUsuarioExclusao
      v-if="modal"
      :usuario="usuario"
      :inativar="inativar"
      @close="modal = false"
      @saved="atualizado"
    />
  </section>
</template>
