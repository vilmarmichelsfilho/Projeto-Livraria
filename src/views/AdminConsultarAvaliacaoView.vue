<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChevronLeftIcon from '@iconify-vue/mdi/chevron-left'
import LayoutAdminAvaliacoes from '@/components/Avaliacoes/LayoutAdminAvaliacoes.vue'
import EstrelasAvaliacao from '@/components/Avaliacoes/EstrelasAvaliacao.vue'
import ExcluirAvaliacao from '@/components/Avaliacoes/ExcluirAvaliacao.vue'
import { avaliacoesComLivros, dataAvaliacao } from '@/utils/avaliacoesAdmin'
import { erroAvaliacoes, carregarAvaliacoes } from '@/services/avaliacoesService'
import { formataPreco } from '@/utils/produtosUtils'

const route = useRoute()
const router = useRouter()
const avaliacao = computed(() => avaliacoesComLivros.value.find(item => String(item.livroId) === route.params.id))
</script>

<template>
  <LayoutAdminAvaliacoes>
    <div class="admin-titulo"><RouterLink to="/admin/avaliacoes" aria-label="Voltar à lista"><ChevronLeftIcon aria-hidden="true" /></RouterLink><h1>Consultar avaliação</h1></div>
    <div v-if="erroAvaliacoes" class="av-erro" role="alert">{{ erroAvaliacoes }}<button class="av-botao" @click="carregarAvaliacoes">Tentar novamente</button></div>
    <template v-else-if="avaliacao">
      <p class="admin-subtitulo">Avaliação #{{ avaliacao.livroId }}</p>
      <div class="admin-cartao admin-livro">
        <img v-if="avaliacao.livro.capa" :src="`/${avaliacao.livro.capa}`" :alt="`Capa de ${avaliacao.livro.titulo}`">
        <div><h2>{{ avaliacao.livro.titulo }}</h2><p class="admin-meta">{{ avaliacao.livro.autor }}</p><p v-if="avaliacao.livro.preco !== null" class="admin-preco">{{ formataPreco(avaliacao.livro.preco) }}</p></div>
      </div>
      <article class="admin-cartao admin-consulta">
        <h2>{{ avaliacao.autor }}</h2>
        <p class="admin-meta">Autor da avaliação</p>
        <div class="admin-nota"><EstrelasAvaliacao :nota="avaliacao.nota" /><span>{{ avaliacao.nota }} de 5</span></div>
        <h3>Comentário</h3>
        <p class="admin-comentario">{{ avaliacao.comentario || 'Sem comentário.' }}</p>
        <p class="admin-data">Publicada em <time :datetime="avaliacao.criadaEm">{{ dataAvaliacao(avaliacao.criadaEm) }}</time></p>
      </article>
      <div class="admin-detalhe-acoes">
        <ExcluirAvaliacao :livro="avaliacao.livro" :autor="avaliacao.autor" moderacao @excluida="router.push('/admin/avaliacoes')">Excluir avaliação</ExcluirAvaliacao>
        <RouterLink class="av-botao" to="/admin/avaliacoes">Voltar à lista</RouterLink>
      </div>
      <p class="admin-aviso">A nota e o comentário são editados apenas pelo autor.</p>
    </template>
    <div v-else class="admin-cartao admin-vazio">
      <h2>Avaliação não encontrada</h2><p>Ela pode ter sido excluída ou não estar salva neste navegador.</p><RouterLink class="av-botao" to="/admin/avaliacoes">Voltar à lista</RouterLink>
    </div>
  </LayoutAdminAvaliacoes>
</template>
