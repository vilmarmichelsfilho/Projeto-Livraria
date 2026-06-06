<script setup>
import produtoList from '../Produtos/produtoList.vue';
</script>

<template>
  <main>
   <section class="lancamentos">
    <h2>Lançamentos</h2>
    <produtoList></produtoList>
   </section>
  </main>
</template>
<style scoped>
section.lancamentos{
  margin: 6vw 6vw;
}
section.lancamentos h2{
  font-size: 2rem;
  font-weight: bold;
  color: black;
  margin: 0 0 3vw 2.7vw;
}
</style>
