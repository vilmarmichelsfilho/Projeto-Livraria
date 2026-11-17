<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <footer class="rodape">
    <div class="rodape-conteudo">
      <div>
        <RouterLink
          class="rodape-logo"
          to="/"
          >IFLibrary</RouterLink
        >
        <p>Uma livraria para encontrar sua próxima leitura</p>
      </div>
      <div>
        <h2>Desenvolvido por</h2>
        <p>Vilmar Michels Filho • Igor Gabriel Decker • Davi Augusto Ramos</p>
      </div>
    </div>
    <p class="rodape-direitos">© Alguns direitos reservados. IFLibrary 2026.</p>
  </footer>
</template>
<style scoped>
.rodape {
  background: #a0cde0;
  color: #151f27;
  padding: 18px 4.45% 16px;
}
.rodape-conteudo {
  display: grid;
  grid-template-columns: minmax(0, 40fr) minmax(0, 60fr);
  gap: 20px;
}
.rodape-logo {
  color: #151f27;
  font-weight: 700;
  font-size: 24px;
}
.rodape h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 3px 0 7px;
}
.rodape-conteudo p {
  font-size: 14px;
  margin-top: 10px;
}
.rodape-direitos {
  text-align: center;
  margin-top: 26px;
  font-size: 13px;
  color: #476b7b;
  font-weight: 700;
}
@media (max-width: 680px) {
  .rodape-conteudo {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
