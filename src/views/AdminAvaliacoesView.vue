<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import LayoutAdminAvaliacoes from '@/components/Avaliacoes/LayoutAdminAvaliacoes.vue'
import EstrelasAvaliacao from '@/components/Avaliacoes/EstrelasAvaliacao.vue'
import ExcluirAvaliacao from '@/components/Avaliacoes/ExcluirAvaliacao.vue'
import { avaliacoesComLivros, dataAvaliacao, normalizarBusca } from '@/utils/avaliacoesAdmin'
import { erroAvaliacoes, carregandoAvaliacoes, carregarAvaliacoes } from '@/services/avaliacoesService'

const busca = ref('')
const nota = ref('')
const pagina = ref(1)
const mensagem = ref('')
const porPagina = 5
const filtradas = computed(() => {
  const termo = normalizarBusca(busca.value.trim())
  return avaliacoesComLivros.value.filter(item => (!nota.value || item.nota === Number(nota.value))
    && normalizarBusca(`${item.livro.titulo} ${item.autor}`).includes(termo))
})
const totalPaginas = computed(() => Math.max(1, Math.ceil(filtradas.value.length / porPagina)))
const visiveis = computed(() => filtradas.value.slice((pagina.value - 1) * porPagina, pagina.value * porPagina))
watch([busca, nota], () => { pagina.value = 1 })
watch(totalPaginas, total => { pagina.value = Math.min(pagina.value, total) })
function limparFiltros() { busca.value = ''; nota.value = '' }
onMounted(carregarAvaliacoes)
</script>

<template>
  <LayoutAdminAvaliacoes>
    <h1>Avaliações</h1>
    <p class="admin-subtitulo">Consulte e modere as opiniões dos leitores.</p>
    <form class="admin-filtros" role="search" aria-label="Filtrar avaliações" @submit.prevent>
      <div><label for="busca-avaliacao">Buscar avaliação</label><input id="busca-avaliacao" v-model="busca" type="search" placeholder="Livro ou cliente"></div>
      <div><label for="nota-avaliacao">Nota</label><select id="nota-avaliacao" v-model="nota"><option value="">Todas as notas</option><option v-for="valor in 5" :key="valor" :value="valor">{{ valor }} {{ valor === 1 ? 'estrela' : 'estrelas' }}</option></select></div>
    </form>
    <p v-if="carregandoAvaliacoes" role="status">Carregando avaliações…</p>
    <div v-else-if="erroAvaliacoes" class="av-erro" role="alert">{{ erroAvaliacoes }}<button class="av-botao" @click="carregarAvaliacoes">Tentar novamente</button></div>
    <template v-else>
      <p class="admin-contagem" role="status">{{ filtradas.length }} {{ filtradas.length === 1 ? 'avaliação publicada' : 'avaliações publicadas' }}</p>
      <p v-if="mensagem" role="status" class="admin-sucesso">{{ mensagem }}</p>
      <div class="admin-lista">
        <article v-for="item in visiveis" :key="item.livroId" class="admin-cartao">
          <h2>{{ item.livro.titulo }}</h2>
          <p class="admin-meta">{{ item.autor }} · {{ dataAvaliacao(item.criadaEm) }}</p>
          <EstrelasAvaliacao :nota="item.nota" />
          <p class="admin-previa">{{ item.comentario || 'Sem comentário.' }}</p>
          <div class="admin-card-acoes">
            <RouterLink class="av-botao" :to="`/admin/avaliacoes/${item.livroId}`" :aria-label="`Consultar avaliação de ${item.livro.titulo}`">Consultar</RouterLink>
            <ExcluirAvaliacao :livro="item.livro" :autor="item.autor" moderacao @excluida="mensagem = 'Avaliação excluída.'" />
          </div>
        </article>
      </div>
      <div v-if="!filtradas.length" class="admin-cartao admin-vazio">
        <h2>{{ busca || nota ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação publicada' }}</h2>
        <p>{{ busca || nota ? 'Tente outro livro, cliente ou nota.' : 'As avaliações publicadas nos livros aparecerão aqui.' }}</p>
        <button v-if="busca || nota" class="av-botao" @click="limparFiltros">Limpar filtros</button>
        <RouterLink v-else class="av-botao" to="/">Ir para a loja</RouterLink>
      </div>
      <nav class="admin-paginacao" aria-label="Paginação de avaliações">
        <button :disabled="pagina <= 1" aria-label="Página anterior" @click="pagina--">‹</button>
        <span>Página {{ pagina }} de {{ totalPaginas }}</span>
        <button :disabled="pagina >= totalPaginas" aria-label="Próxima página" @click="pagina++">›</button>
      </nav>
    </template>
    <p class="admin-nota-local">Modo demonstrativo: uma avaliação compartilhada por livro.</p>
  </LayoutAdminAvaliacoes>
</template>
