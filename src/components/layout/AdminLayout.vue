<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>
<template>
  <div class="area-admin">
    <header class="admin-header">
      <RouterLink
        to="/"
        class="marca"
        ><v-icon icon="mdi-book-open-page-variant" />IFLibrary</RouterLink
      ><span>Administração</span>
      <RouterLink
        to="/"
        class="voltar-mobile"
        >Voltar à loja</RouterLink
      ><span class="admin-identificacao"
        >Ambiente acadêmico
        <v-icon
          icon="mdi-account-circle"
          size="28"
      /></span>
    </header>
    <div class="admin-corpo">
      <aside
        class="admin-sidebar"
        aria-label="Navegação administrativa"
      >
        <nav>
          <RouterLink
            to="/admin/livros"
            class="ativo"
            ><v-icon
              icon="mdi-book-open-page-variant"
              size="22"
            />Livros</RouterLink
          >
        </nav>
        <RouterLink
          to="/"
          class="voltar-loja"
          >Voltar à loja</RouterLink
        >
      </aside>
      <main class="admin-conteudo"><RouterView :key="$route.path" /></main>
    </div>
  </div>
</template>

<style>
/* Estilos da tela, mantidos no componente. */

.admin-header {
  display: flex;
  align-items: center;
  gap: 68px;
  min-height: 86px;
  padding: 20px 34px;
  background: var(--livraria-azul);
  color: var(--livraria-acao);
  font-weight: 700;
}
.marca {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--livraria-texto);
  font-size: 23px;
  font-weight: 700;
}
.marca .v-icon {
  font-size: 38px;
  min-width: 38px;
  width: 38px;
  height: 32px;
  object-fit: contain;
}
.admin-identificacao {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: auto;
  font-size: 14px;
  color: var(--livraria-texto);
}
.admin-identificacao .v-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.admin-corpo {
  display: grid;
  grid-template-columns: 228px minmax(0, 1fr);
  min-height: calc(100vh - 86px);
}
.admin-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 36px 16px;
  background: var(--livraria-suave);
}
.admin-sidebar nav a {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
}
.admin-sidebar nav .v-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.admin-sidebar .ativo {
  color: white;
  background: var(--livraria-acao);
}
.voltar-loja {
  margin: auto 16px 24px;
  font-weight: 700;
}
.voltar-mobile {
  display: none;
}
.admin-conteudo {
  padding: 34px 48px 70px;
  min-width: 0;
}
.admin-conteudo h1 {
  font-size: 30px;
  line-height: 1.3;
  font-weight: 700;
}
.admin-conteudo h2 {
  font-size: 28px;
  font-weight: 700;
}
@media (max-width: 1050px) {
  .admin-corpo {
    grid-template-columns: 170px minmax(0, 1fr);
  }
  .admin-conteudo {
    padding: 28px;
  }
  .admin-header {
    gap: 36px;
  }
}
@media (max-width: 700px) {
  .admin-header {
    padding: 16px 20px;
    gap: 12px;
    flex-wrap: wrap;
    min-height: 74px;
  }
  .marca {
    font-size: 20px;
  }
  .marca .v-icon {
    font-size: 28px;
    min-width: 28px;
    width: 28px;
    height: 25px;
  }
  .admin-header > span:not(.admin-identificacao) {
    font-size: 13px;
  }
  .admin-identificacao {
    display: none;
  }
  .voltar-mobile {
    display: block;
    margin-left: auto;
    font-size: 12px;
  }
  .admin-corpo {
    display: block;
  }
  .admin-sidebar {
    display: none;
  }
  .admin-conteudo {
    padding: 24px 20px 60px;
  }
  .admin-conteudo h1 {
    font-size: 27px;
  }
  .admin-conteudo h2 {
    font-size: 23px;
  }
}
</style>
