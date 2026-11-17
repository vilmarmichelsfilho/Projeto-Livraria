<script setup>
import { onMounted, computed, ref } from 'vue';
import {
  avaliacoes,
  erroAvaliacoes,
  carregandoAvaliacoes,
  carregarAvaliacoes,
} from '@/services/avaliacoesService';
import EstrelasAvaliacao from './EstrelasAvaliacao.vue';
import ExcluirAvaliacao from './ExcluirAvaliacao.vue';
import '@/assets/avaliacoes.css';

const props = defineProps({ livro: { type: Object, required: true } });
const idUsuario = sessionStorage.getItem('iflibrary_usuario');
const doLivro = computed(() =>
  avaliacoes.value.filter(
    (item) => String(item.id_livro) === String(props.livro.id),
  ),
);
const minha = computed(() =>
  doLivro.value.find((item) => String(item.id_usuario) === idUsuario),
);
const media = computed(() => {
  if (doLivro.value.length === 0) return 0;
  return (
    doLivro.value.reduce((total, item) => total + item.nota, 0) /
    doLivro.value.length
  );
});
const mensagem = ref('');
const data = (valor) => new Date(valor).toLocaleDateString('pt-BR');
onMounted(carregarAvaliacoes);
</script>

<template>
  <section
    id="avaliacoes"
    class="avaliacoes-ui leitores"
    aria-labelledby="titulo-avaliacoes"
  >
    <header class="resumo">
      <div>
        <h2 id="titulo-avaliacoes">Avaliações dos leitores</h2>
        <div class="media">
          <strong>{{
            doLivro.length
              ? media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
              : '—'
          }}</strong>
          <EstrelasAvaliacao
            :nota="media"
            resumo
          />
          <span>{{
            doLivro.length === 1
              ? '1 avaliação publicada'
              : `${doLivro.length} avaliações publicadas`
          }}</span>
        </div>
      </div>
      <RouterLink
        class="av-botao principal"
        :to="`/livro/${livro.endereco}/avaliar`"
      >
        {{ minha ? 'Editar minha avaliação' : 'Avaliar livro' }}
      </RouterLink>
    </header>
    <p
      v-if="carregandoAvaliacoes"
      role="status"
    >
      Carregando avaliações…
    </p>
    <div
      v-else-if="erroAvaliacoes"
      role="alert"
      class="av-erro"
    >
      {{ erroAvaliacoes }}
      <button
        class="av-botao"
        @click="carregarAvaliacoes"
      >
        Tentar novamente
      </button>
    </div>
    <p
      v-if="mensagem"
      role="status"
    >
      {{ mensagem }}
    </p>
    <template v-if="!erroAvaliacoes && !carregandoAvaliacoes && doLivro.length">
      <article
        v-for="item in doLivro"
        :key="item.id"
        class="av-cartao"
      >
        <div class="cartao-topo">
          <div>
            <h3>{{ item.id === minha?.id ? 'Você' : item.autor }}</h3>
            <time :datetime="item.criado_em">{{ data(item.criado_em) }}</time>
          </div>
          <div
            v-if="item.id === minha?.id"
            class="av-acoes"
          >
            <RouterLink
              class="av-botao"
              :to="`/livro/${livro.endereco}/avaliar`"
              >Editar</RouterLink
            >
            <ExcluirAvaliacao
              :avaliacao-id="item.id"
              :livro="livro"
              @excluida="mensagem = 'Avaliação excluída.'"
            />
          </div>
        </div>
        <div class="nota">
          <EstrelasAvaliacao :nota="item.nota" /><span
            >{{ item.nota }} de 5</span
          >
        </div>
        <p
          v-if="item.comentario"
          class="comentario"
        >
          {{ item.comentario }}
        </p>
        <p
          v-else
          class="av-suave"
        >
          Sem comentário.
        </p>
      </article>
    </template>
    <div
      v-else-if="!erroAvaliacoes && !carregandoAvaliacoes"
      class="av-cartao vazio"
    >
      <h3>Seja a primeira pessoa a avaliar este livro</h3>
      <p>Conte como foi sua leitura e compartilhe sua opinião.</p>
    </div>
    <p class="av-suave rodape-avaliacoes">
      Você pode publicar uma avaliação por livro e editar ou excluir a sua
      quando quiser.
    </p>
  </section>
</template>

<style scoped>
.leitores {
  padding: 28px 0 48px;
  margin-top: 56px;
}
.resumo,
.cartao-topo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}
.resumo {
  border-bottom: 1px solid #dce8ed;
  padding-bottom: 26px;
  margin-bottom: 30px;
}
.resumo > .av-botao {
  min-width: 280px;
  margin-top: 14px;
}
.media {
  display: flex;
  align-items: center;
  gap: 26px;
  flex-wrap: wrap;
}
.media strong {
  font-size: 36px;
  font-weight: 700;
}
.media span,
time {
  color: var(--av-suave);
}
.av-cartao {
  padding: 20px 26px;
  margin-bottom: 24px;
}
time {
  font-size: 14px;
}
.nota {
  display: flex;
  gap: 36px;
  align-items: center;
  margin: 12px 0;
  color: var(--av-suave);
  font-size: 15px;
}
.comentario {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 18px;
}
.rodape-avaliacoes {
  margin-top: 30px;
}
.vazio {
  padding: 32px 26px;
}
@media (max-width: 650px) {
  .resumo {
    flex-direction: column;
  }
  .resumo > .av-botao {
    min-width: 0;
    width: 100%;
  }
  .cartao-topo {
    flex-wrap: wrap;
  }
  .media {
    gap: 12px;
  }
  .av-cartao {
    padding: 20px;
  }
}
</style>
