<script setup>
import { ref, computed, onMounted, watch } from "vue";
import service from "@/services/usuariosService";
import { mensagemErro } from "@/services/api";
import AdminIcon from "@/components/admin/AdminIcon.vue";
import AdminUsuarioExclusao from "@/components/admin/AdminUsuarioExclusao.vue";
const usuarios = ref([]),
  busca = ref(""),
  carregando = ref(true),
  erro = ref(""),
  selecionado = ref(null),
  sucesso = ref("");
const perfil = ref("");
const pagina = ref(1);
const paginas = computed(() =>
  Math.max(1, Math.ceil(filtrados.value.length / 8)),
);
const usuariosPagina = computed(() =>
  filtrados.value.slice((pagina.value - 1) * 8, pagina.value * 8),
);
watch([busca, perfil], () => {
  pagina.value = 1;
});
const filtrados = computed(() =>
  usuarios.value.filter(
    (u) =>
      (!perfil.value || u.perfil === perfil.value) &&
      `${u.nome} ${u.email}`
        .toLocaleLowerCase("pt-BR")
        .includes(busca.value.trim().toLocaleLowerCase("pt-BR")),
  ),
);
async function carregar() {
  carregando.value = true;
  erro.value = "";
  try {
    usuarios.value = await service.listar();
  } catch (e) {
    erro.value = mensagemErro(e);
  } finally {
    carregando.value = false;
  }
}
async function atualizado() {
  selecionado.value = null;
  sucesso.value = "Cadastro atualizado com sucesso.";
  await carregar();
}
onMounted(carregar);
</script>
<template>
  <section class="admin-page admin-users">
    <header class="admin-page-header">
      <h1>Usuários</h1>
      <p class="admin-subtitle">
        <span class="admin-desktop-only"
          >Gerencie clientes e administradores</span
        ><span class="admin-mobile-only"
          >Gerencie os cadastros e os perfis.</span
        >
      </p>
    </header>
    <div v-if="sucesso" class="admin-feedback" role="status">{{ sucesso }}</div>
    <div class="admin-user-search">
      <label class="admin-field"
        ><span class="admin-desktop-only">Pesquisa</span
        ><span class="admin-mobile-only">Buscar usuário</span
        ><input
          v-model="busca"
          type="search"
          placeholder="Nome ou e-mail" /></label
      ><label class="admin-field admin-user-profile-filter"
        ><span>Perfil</span
        ><select v-model="perfil">
          <option value="">Todos</option>
          <option value="CLIENTE">Cliente</option>
          <option value="ADMIN">Admin</option>
        </select></label
      ><RouterLink to="/admin/usuarios/novo" class="admin-button"
        ><AdminIcon name="plus" />Cadastrar usuário</RouterLink
      >
    </div>
    <p v-if="carregando" role="status">Carregando usuários…</p>
    <div v-else-if="erro" class="admin-feedback error" role="alert">
      {{ erro }} <button @click="carregar">Tentar novamente</button>
    </div>
    <template v-else
      ><div class="admin-table-wrap admin-desktop-only">
        <table class="admin-table admin-user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in filtrados" :key="usuario.id">
              <td>{{ usuario.nome }}</td>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.perfil === "ADMIN" ? "Admin" : "Cliente" }}</td>
              <td>
                <span
                  class="admin-badge"
                  :class="{ inativo: !usuario.ativo }"
                  >{{ usuario.ativo ? "Ativo" : "Inativo" }}</span
                >
              </td>
              <td>
                <div class="admin-row-actions">
                  <RouterLink
                    :to="`/admin/usuarios/${usuario.id}`"
                    class="admin-icon-button"
                    :aria-label="`Consultar ${usuario.nome}`"
                    ><AdminIcon name="eye" /></RouterLink
                  ><RouterLink
                    :to="`/admin/usuarios/${usuario.id}/editar`"
                    class="admin-icon-button"
                    :aria-label="`Editar ${usuario.nome}`"
                    ><AdminIcon name="edit" /></RouterLink
                  ><button
                    class="admin-icon-button danger"
                    :aria-label="`Excluir ${usuario.nome}`"
                    @click="selecionado = usuario"
                  >
                    <AdminIcon name="trash" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtrados.length">
              <td colspan="5">
                {{
                  busca
                    ? "Nenhum usuário encontrado para esta pesquisa."
                    : "Nenhum usuário cadastrado."
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-user-cards admin-mobile-only">
        <article
          v-for="usuario in usuariosPagina"
          :key="usuario.id"
          class="admin-user-card"
        >
          <h2><AdminIcon name="user" />{{ usuario.nome }}</h2>
          <p>{{ usuario.email }}</p>
          <div class="admin-user-card-badges">
            <span class="admin-badge">{{
              usuario.perfil === "ADMIN" ? "Admin" : "Cliente"
            }}</span
            ><span v-if="!usuario.ativo" class="admin-badge inativo"
              >Inativo</span
            >
          </div>
          <div class="admin-user-card-actions">
            <RouterLink
              :to="`/admin/usuarios/${usuario.id}`"
              class="admin-button admin-button-secondary"
              :aria-label="`Consultar ${usuario.nome}`"
              >Consultar</RouterLink
            ><RouterLink
              :to="`/admin/usuarios/${usuario.id}/editar`"
              class="admin-button admin-button-secondary"
              :aria-label="`Editar ${usuario.nome}`"
              >Editar</RouterLink
            ><button
              class="admin-user-card-delete"
              :aria-label="`Excluir ${usuario.nome}`"
              @click="selecionado = usuario"
            >
              <AdminIcon name="trash" />
            </button>
          </div>
        </article>
        <p v-if="!filtrados.length" role="status">Nenhum usuário encontrado.</p>
        <nav
          v-if="filtrados.length"
          class="admin-user-pagination"
          aria-label="Paginação de usuários"
        >
          <button
            v-if="pagina > 1"
            class="admin-icon-button"
            aria-label="Página anterior"
            @click="pagina--"
          >
            ‹</button
          ><span>Página {{ pagina }} de {{ paginas }}</span
          ><button
            v-if="pagina < paginas"
            class="admin-icon-button"
            aria-label="Próxima página"
            @click="pagina++"
          >
            ›
          </button>
        </nav>
      </div></template
    >
    <AdminUsuarioExclusao
      v-if="selecionado"
      :usuario="selecionado"
      @close="selecionado = null"
      @saved="atualizado"
    />
  </section>
</template>
