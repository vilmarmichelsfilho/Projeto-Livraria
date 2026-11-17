<script setup>
import { computed, ref } from 'vue'
import { avaliacoes, erroAvaliacoes, carregarAvaliacoes } from '@/services/avaliacoesService'
import EstrelasAvaliacao from './EstrelasAvaliacao.vue'
import ExcluirAvaliacao from './ExcluirAvaliacao.vue'
import '@/assets/avaliacoes.css'

const props = defineProps({ livro: { type: Object, required: true } })
const minha = computed(() => avaliacoes.value.find(item => item.livroId === props.livro.id))
const mensagem = ref('')
const data = valor => new Date(valor).toLocaleDateString('pt-BR')
</script>

<template>
  <section id="avaliacoes" class="avaliacoes-ui leitores" aria-labelledby="titulo-avaliacoes">
    <header class="resumo">
      <div>
        <h2 id="titulo-avaliacoes">Avaliações dos leitores</h2>
        <div class="media">
          <strong>{{ minha ? minha.nota.toFixed(1).replace('.', ',') : '—' }}</strong>
          <EstrelasAvaliacao :nota="minha?.nota ?? 0" resumo />
          <span>{{ minha ? '1 avaliação publicada' : 'Nenhuma avaliação publicada' }}</span>
        </div>
      </div>
      <RouterLink class="av-botao principal" :to="`/livro/${livro.endereco}/avaliar`">
        {{ minha ? 'Editar minha avaliação' : 'Avaliar livro' }}
      </RouterLink>
    </header>
    <div v-if="erroAvaliacoes" role="alert" class="av-erro">
      {{ erroAvaliacoes }} <button class="av-botao" @click="carregarAvaliacoes">Tentar novamente</button>
    </div>
    <p role="status">{{ mensagem }}</p>
    <article v-if="minha" class="av-cartao">
      <div class="cartao-topo">
        <div><h3>Você</h3><time :datetime="minha.criadaEm">{{ data(minha.criadaEm) }}</time></div>
        <div class="av-acoes">
          <RouterLink class="av-botao" :to="`/livro/${livro.endereco}/avaliar`">Editar</RouterLink>
          <ExcluirAvaliacao :livro="livro" @excluida="mensagem = 'Avaliação excluída.'" />
        </div>
      </div>
      <div class="nota"><EstrelasAvaliacao :nota="minha.nota" /><span>{{ minha.nota }} de 5</span></div>
      <p v-if="minha.comentario" class="comentario">{{ minha.comentario }}</p>
      <p v-else class="av-suave">Sem comentário.</p>
    </article>
    <div v-else-if="!erroAvaliacoes" class="av-cartao vazio">
      <h3>Seja a primeira pessoa a avaliar este livro</h3>
      <p>Conte como foi sua leitura e compartilhe sua opinião.</p>
    </div>
    <p class="av-suave rodape-avaliacoes">Você pode publicar uma avaliação por livro e editar ou excluir a sua quando quiser.</p>
    <p class="av-suave aviso-local">As avaliações são salvas apenas neste navegador.</p>
  </section>
</template>

<style scoped>
.leitores { padding: 28px 0 48px; margin-top: 56px; }
.resumo, .cartao-topo { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
.resumo { border-bottom: 1px solid #dce8ed; padding-bottom: 26px; margin-bottom: 30px; }
.resumo > .av-botao { min-width: 280px; margin-top: 14px; }
.media { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; }
.media strong { font-size: 36px; font-weight: 700; }
.media span, time { color: var(--av-suave); }
.av-cartao { padding: 20px 26px; margin-bottom: 24px; }
time { font-size: 14px; }
.nota { display: flex; gap: 36px; align-items: center; margin: 12px 0; color: var(--av-suave); font-size: 15px; }
.comentario { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 18px; }
.rodape-avaliacoes { margin-top: 30px; }
.aviso-local { font-size: 13px; margin-top: 8px; }
.vazio { padding: 32px 26px; }
@media (max-width: 650px) {
  .resumo { flex-direction: column; }
  .resumo > .av-botao { min-width: 0; width: 100%; }
  .cartao-topo { flex-wrap: wrap; }
  .media { gap: 12px; }
  .av-cartao { padding: 20px; }
}
</style>
