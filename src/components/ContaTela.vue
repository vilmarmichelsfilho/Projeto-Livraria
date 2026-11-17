<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ContaIcone from '@/components/ContaIcone.vue';
import usuarios from '@/services/usuariosService';
import api, { mensagemErro } from '@/services/api';
import '@/assets/conta.css';
import { buscarCep } from '@/services/cepService';
const props = defineProps({ modo: { type: String, required: true } });
const router = useRouter();
const route = useRoute();
const dados = reactive({
  nome: '',
  email: '',
  senha: '',
  confirmar: '',
  telefone: '',
  endereco: '',
  cidade: '',
  uf: '',
  cep: '',
  senha_atual: '',
});
const usuario = ref(null);
const carregando = ref(false);
const carregandoDados = ref(false);
const erro = ref('');
const sucesso = ref(route.query.sucesso || '');
const confirmarExclusao = ref(false);
const consultandoCep = ref(false);
const avisoCep = ref('');
let controleCep;
let versaoCep = 0;
onBeforeUnmount(() => {
  versaoCep++;
  controleCep?.abort();
});
async function atualizarCep() {
  dados.cep = dados.cep.replace(/\D/g, '').slice(0, 8);
  const versao = ++versaoCep;
  controleCep?.abort();
  consultandoCep.value = false;
  avisoCep.value = '';
  if (dados.cep.length !== 8) {
    return;
  }
  controleCep = new AbortController();
  const controle = controleCep;
  const original = {
    cidade: dados.cidade,
    uf: dados.uf,
    endereco: dados.endereco,
  };
  consultandoCep.value = true;
  const timeout = setTimeout(() => controle.abort(), 8000);
  try {
    const resultado = await buscarCep(dados.cep, { signal: controle.signal });
    if (versao !== versaoCep) {
      return;
    }
    for (const campo of ['cidade', 'uf', 'endereco']) {
      if (dados[campo] === original[campo]) {
        dados[campo] = resultado[campo];
      }
    }
    avisoCep.value =
      'Endereço localizado. Confira os dados e acrescente número e complemento.';
  } catch (error) {
    if (versao !== versaoCep) {
      return;
    }
    avisoCep.value =
      error.name === 'AbortError'
        ? 'A consulta demorou demais. Preencha o endereço manualmente ou digite o CEP novamente.'
        : error.message === 'Failed to fetch'
          ? 'Não foi possível consultar o CEP. Preencha o endereço manualmente.'
          : error.message;
  } finally {
    clearTimeout(timeout);
    if (versao === versaoCep) {
      consultandoCep.value = false;
    }
  }
}
const ufs =
  'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(
    ' ',
  );
const subtitulosMobile = {
  login: 'Acesse sua conta para continuar.',
  cadastro: 'Todos os campos com * são obrigatórios.',
  conta: 'Seus dados e suas leituras.',
  editar: 'Mantenha seu contato e endereço atualizados.',
  senha: 'Confirme sua senha atual e escolha a nova senha.',
};
const destinoVoltar = computed(() => {
  if (props.modo === 'cadastro') {
    return '/entrar';
  }
  if (props.modo === 'login') {
    return '/';
  }
  return '/minha-conta';
});
const pedidosDialog = ref(null);
const pedidos = ref([]);
const buscandoPedidos = ref(false);
const erroPedidos = ref('');
async function abrirPedidos() {
  pedidosDialog.value.showModal();
  buscandoPedidos.value = true;
  erroPedidos.value = '';
  try {
    pedidos.value = (
      await api.get('/pedidos', { params: { id_usuario: usuario.value.id } })
    ).data;
  } catch (error) {
    erroPedidos.value = mensagemErro(error);
  } finally {
    buscandoPedidos.value = false;
  }
}
const titulos = {
  login: 'Entrar',
  cadastro: 'Criar conta',
  conta: 'Minha conta',
  editar: 'Editar meus dados',
  senha: 'Alterar senha',
};
const titulo = computed(() => titulos[props.modo]);
const campos = computed(() => {
  const campo = (
    key,
    label,
    type = 'text',
    required = false,
    autocomplete = key,
  ) => ({ key, label, type, required, autocomplete });
  const nome = campo('nome', 'Nome completo', 'text', true, 'name');
  const email = campo('email', 'E-mail', 'email', true, 'email');
  const senha = campo(
    'senha',
    props.modo === 'senha' ? 'Nova senha' : 'Senha',
    'password',
    true,
    props.modo === 'login' ? 'current-password' : 'new-password',
  );
  const confirmar = campo(
    'confirmar',
    props.modo === 'senha' ? 'Confirmar nova senha' : 'Confirmar senha',
    'password',
    true,
    'new-password',
  );
  const endereco = [
    campo('endereco', 'Endereço', 'text', true, 'street-address'),
    campo('cidade', 'Cidade', 'text', true, 'address-level2'),
    campo('uf', 'UF', 'text', true, 'address-level1'),
    campo('cep', 'CEP', 'text', true, 'postal-code'),
  ];
  if (props.modo === 'login') {
    return [email, senha];
  }
  if (props.modo === 'senha') {
    return [
      campo('senha_atual', 'Senha atual', 'password', true, 'current-password'),
      senha,
      confirmar,
    ];
  }
  if (props.modo === 'cadastro') {
    return [
      nome,
      email,
      campo('telefone', 'Telefone', 'tel', true, 'tel'),
      senha,
      confirmar,
      endereco[0],
      ...endereco.slice(1),
    ];
  }
  return [
    nome,
    email,
    campo('telefone', 'Telefone', 'tel', true, 'tel'),
    ...endereco,
  ];
});
const textosBotao = {
  login: 'Entrar na conta',
  cadastro: 'Criar minha conta',
  editar: 'Salvar alterações',
  senha: 'Salvar nova senha',
};
const acao = computed(() => textosBotao[props.modo]);
const protegido = computed(() =>
  ['conta', 'editar', 'senha'].includes(props.modo),
);
onMounted(carregar);
async function carregar() {
  if (!protegido.value) {
    return;
  }
  carregandoDados.value = true;
  erro.value = '';
  try {
    usuario.value = await usuarios.atual();
    Object.assign(dados, usuario.value);
  } catch (error) {
    if (
      !sessionStorage.getItem('iflibrary_usuario') ||
      error.response?.status === 404
    ) {
      sessionStorage.removeItem('iflibrary_usuario');
      await router.replace('/entrar');
    } else {
      erro.value = mensagemErro(error);
    }
  } finally {
    carregandoDados.value = false;
  }
}
async function enviar() {
  if (consultandoCep.value) {
    return;
  }
  erro.value = '';
  sucesso.value = '';
  if (['cadastro', 'editar'].includes(props.modo) && !dados.nome.trim()) {
    erro.value = 'Informe seu nome completo.';
    return;
  }
  if (
    ['cadastro', 'senha'].includes(props.modo) &&
    dados.senha !== dados.confirmar
  ) {
    erro.value = 'As senhas não coincidem.';
    return;
  }
  carregando.value = true;
  try {
    if (props.modo === 'login') {
      await usuarios.entrar({ email: dados.email, senha: dados.senha });
      await router.push('/minha-conta');
    }
    if (props.modo === 'cadastro') {
      const { nome, email, senha, telefone, endereco, cidade, uf, cep } = dados;
      await usuarios.cadastrar({
        nome,
        email,
        senha,
        telefone,
        endereco,
        cidade,
        uf,
        cep,
      });
      await router.push({
        path: '/entrar',
        query: {
          sucesso: 'Conta criada com sucesso! Entre com seu e-mail e senha.',
        },
      });
    }
    if (props.modo === 'editar') {
      const { nome, email, telefone, endereco, cidade, uf, cep } = dados;
      await usuarios.atualizar(usuario.value.id, {
        nome,
        email,
        telefone,
        endereco,
        cidade,
        uf,
        cep,
      });
      await router.push({
        path: '/minha-conta',
        query: { sucesso: 'Dados atualizados com sucesso.' },
      });
    }
    if (props.modo === 'senha') {
      await usuarios.alterarSenha(usuario.value.id, {
        senha_atual: dados.senha_atual,
        senha: dados.senha,
      });
      await router.push({
        path: '/minha-conta',
        query: { sucesso: 'Senha alterada com sucesso.' },
      });
    }
  } catch (error) {
    erro.value = mensagemErro(error);
  } finally {
    carregando.value = false;
  }
}
async function sair() {
  carregando.value = true;
  try {
    await usuarios.sair();
    await router.push('/entrar');
  } catch (error) {
    erro.value = mensagemErro(error);
    await router.push('/entrar');
  } finally {
    carregando.value = false;
  }
}
async function excluir() {
  carregando.value = true;
  erro.value = '';
  try {
    const result = await usuarios.excluir(usuario.value.id);
    sessionStorage.removeItem('iflibrary_usuario');
    await router.push({ path: '/entrar', query: { sucesso: result.message } });
  } catch (error) {
    erro.value = mensagemErro(error);
  } finally {
    carregando.value = false;
  }
}
</script>
<template>
  <main
    class="conta-pagina"
    :class="'conta-modo-' + modo"
  >
    <div class="conta-titulo-linha">
      <RouterLink
        v-if="modo !== 'conta'"
        :to="destinoVoltar"
        class="conta-voltar-mobile"
        aria-label="Voltar"
        ><ContaIcone nome="voltar"
      /></RouterLink>
      <h1>{{ titulo }}</h1>
    </div>
    <p class="conta-subtitulo conta-desktop">
      {{
        modo === 'conta'
          ? 'Consulte seus dados e acompanhe suas compras'
          : 'Preencha seus dados para continuar na IFLibrary'
      }}
    </p>
    <p class="conta-subtitulo conta-mobile">{{ subtitulosMobile[modo] }}</p>
    <p
      v-if="erro"
      class="conta-aviso erro"
      role="alert"
    >
      {{ erro }}
    </p>
    <p
      v-if="sucesso"
      class="conta-aviso sucesso"
      role="status"
    >
      {{ sucesso }}
    </p>
    <p
      v-if="carregandoDados"
      role="status"
    >
      Carregando seus dados…
    </p>
    <div
      v-else-if="protegido && !usuario"
      class="conta-aviso"
    >
      <button
        class="conta-botao"
        @click="carregar"
      >
        Tentar novamente
      </button>
    </div>
    <section
      v-else-if="modo === 'conta' && usuario"
      class="conta-painel conta-resumo conta-desktop"
      aria-label="Dados da conta"
    >
      <div class="conta-identidade">
        <v-icon
          icon="mdi-account-circle"
          aria-hidden="true"
        />
        <div>
          <h2>{{ usuario.nome }}</h2>
          <p>{{ usuario.email }}</p>
        </div>
      </div>
      <dl class="conta-detalhes">
        <div>
          <dt>Telefone</dt>
          <dd>{{ usuario.telefone || 'Não informado' }}</dd>
        </div>
        <div>
          <dt>Endereço</dt>
          <dd>{{ usuario.endereco || 'Não informado' }}</dd>
        </div>
        <div>
          <dt>Cidade e UF</dt>
          <dd>
            {{
              [usuario.cidade, usuario.uf].filter(Boolean).join(' • ') ||
              'Não informado'
            }}
          </dd>
        </div>
        <div>
          <dt>CEP</dt>
          <dd>
            {{
              usuario.cep
                ? usuario.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')
                : 'Não informado'
            }}
          </dd>
        </div>
      </dl>
      <div class="conta-acoes">
        <RouterLink
          class="conta-botao"
          to="/minha-conta/editar"
          >Editar meus dados</RouterLink
        >
        <RouterLink
          class="conta-botao secundario"
          to="/minha-conta/senha"
          >Alterar senha</RouterLink
        >
        <button
          class="conta-botao secundario"
          :disabled="carregando"
          @click="confirmarExclusao = true"
        >
          Excluir minha conta
        </button>
        <button
          class="conta-sair"
          :disabled="carregando"
          @click="sair"
        >
          Sair da conta
        </button>
      </div>
      <div
        v-if="confirmarExclusao"
        class="conta-confirmacao"
        role="alertdialog"
        aria-labelledby="excluir-titulo"
        aria-describedby="excluir-descricao"
      >
        <h3 id="excluir-titulo">Excluir sua conta?</h3>
        <p id="excluir-descricao">
          Esta ação encerra seu acesso. Se houver pedidos, sua conta será
          inativada para preservar o histórico.
        </p>
        <div class="conta-acoes">
          <button
            class="conta-botao"
            :disabled="carregando"
            @click="excluir"
          >
            {{ carregando ? 'Excluindo…' : 'Confirmar exclusão' }}</button
          ><button
            class="conta-botao secundario"
            :disabled="carregando"
            @click="confirmarExclusao = false"
          >
            Cancelar
          </button>
        </div>
      </div>
    </section>
    <section
      v-if="modo === 'conta' && usuario && !carregandoDados"
      class="conta-mobile conta-mobile-resumo"
      aria-label="Dados da conta"
    >
      <div class="conta-mobile-cartao">
        <div class="conta-mobile-identidade">
          <ContaIcone nome="conta" />
          <h2>{{ usuario.nome }}</h2>
        </div>
        <p class="conta-mobile-email">{{ usuario.email }}</p>
        <p class="conta-mobile-telefone">
          {{ usuario.telefone || 'Não informado' }}
        </p>
        <address>
          {{ usuario.endereco || 'Endereço não informado' }}<br />{{
            [usuario.cidade, usuario.uf].filter(Boolean).join(' • ')
          }}<br />CEP {{ usuario.cep?.replace(/^(\d{5})(\d{3})$/, '$1-$2') }}
        </address>
        <RouterLink
          to="/minha-conta/editar"
          class="conta-botao secundario"
          >Editar meus dados</RouterLink
        >
      </div>
      <div class="conta-mobile-menu">
        <RouterLink
          to="/minha-conta/senha"
          class="conta-botao secundario"
          >Alterar senha</RouterLink
        >
        <button
          class="conta-botao secundario"
          @click="abrirPedidos"
        >
          Meus pedidos
        </button>
        <button
          class="conta-botao secundario conta-sair-mobile"
          :disabled="carregando"
          @click="sair"
        >
          Sair da conta
        </button>
      </div>
      <dialog
        ref="pedidosDialog"
        class="conta-pedidos-dialog"
        aria-labelledby="titulo-pedidos"
      >
        <h2 id="titulo-pedidos">Meus pedidos</h2>
        <p
          v-if="buscandoPedidos"
          role="status"
        >
          Carregando pedidos…
        </p>
        <p
          v-else-if="erroPedidos"
          role="alert"
        >
          {{ erroPedidos }}
        </p>
        <p v-else-if="!pedidos.length">Você ainda não tem pedidos.</p>
        <ul v-else>
          <li
            v-for="pedido in pedidos"
            :key="pedido.id"
          >
            Pedido #{{ pedido.id }} — {{ pedido.status.replaceAll('_', ' ') }} —
            {{
              Number(pedido.total || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }}
          </li>
        </ul>
        <button
          class="conta-botao secundario"
          @click="pedidosDialog.close()"
        >
          Fechar
        </button>
      </dialog>
    </section>
    <form
      v-if="modo !== 'conta' && !carregandoDados && (!protegido || usuario)"
      class="conta-painel conta-formulario"
      :aria-busy="carregando"
      @submit.prevent="enviar"
    >
      <div class="conta-campos">
        <div
          v-for="campo in campos"
          :key="campo.key"
          class="conta-campo"
          :class="'conta-campo-' + campo.key"
        >
          <label :for="campo.key"
            >{{ campo.label }}{{ campo.required ? ' *' : '' }}</label
          >
          <select
            v-if="campo.key === 'uf'"
            id="uf"
            v-model="dados.uf"
            name="uf"
            required
            autocomplete="address-level1"
            :disabled="carregando"
          >
            <option
              disabled
              value=""
            >
              Selecione
            </option>
            <option
              v-for="uf in ufs"
              :key="uf"
              :value="uf"
            >
              {{ uf }}
            </option>
          </select>
          <input
            v-else
            :id="campo.key"
            v-model="dados[campo.key]"
            :name="campo.key"
            :type="campo.type"
            :required="campo.required"
            :autocomplete="campo.autocomplete"
            :minlength="campo.type === 'password' ? 8 : undefined"
            :maxlength="
              campo.key === 'uf' ? 2 : campo.key === 'cep' ? 9 : undefined
            "
            :inputmode="campo.key === 'cep' ? 'numeric' : undefined"
            :pattern="campo.key === 'cep' ? '[0-9]{5}-?[0-9]{3}' : undefined"
            :disabled="carregando"
            :aria-describedby="
              campo.key === 'senha' && modo !== 'login'
                ? 'senha-ajuda'
                : undefined
            "
            @input="campo.key === 'cep' && atualizarCep()"
          />
          <small
            v-if="campo.key === 'senha' && modo !== 'login'"
            id="senha-ajuda"
            >Mínimo de 8 caracteres.</small
          >
        </div>
      </div>
      <p
        v-if="consultandoCep || avisoCep"
        class="conta-observacao"
        role="status"
        aria-live="polite"
      >
        {{ consultandoCep ? 'Consultando CEP…' : avisoCep }}
      </p>
      <p
        v-if="modo === 'cadastro'"
        class="conta-observacao conta-instrucoes conta-desktop"
      >
        * Campos obrigatórios. Informe telefone e endereço para criar sua conta.
      </p>
      <p
        v-if="modo === 'login'"
        class="conta-mobile conta-mobile-ajuda"
      >
        Senha com pelo menos 8 caracteres.
      </p>
      <p
        v-if="modo === 'cadastro'"
        class="conta-mobile conta-mobile-ajuda"
      >
        Informe um telefone válido e o endereço completo. A senha deve ter ao
        menos 8 caracteres.
      </p>
      <div class="conta-acoes">
        <button
          class="conta-botao"
          type="submit"
          :disabled="carregando || consultandoCep"
        >
          <span :class="{ 'conta-desktop': modo === 'login' && !carregando }">{{
            carregando ? 'Aguarde…' : acao
          }}</span
          ><span
            v-if="modo === 'login' && !carregando"
            class="conta-mobile"
            >Entrar</span
          >
        </button>
        <RouterLink
          class="conta-botao secundario"
          :to="
            modo === 'login'
              ? '/cadastro'
              : modo === 'cadastro'
                ? '/entrar'
                : '/minha-conta'
          "
          ><span :class="{ 'conta-desktop': modo === 'login' }">{{
            modo === 'login'
              ? 'Criar conta'
              : modo === 'cadastro'
                ? 'Voltar'
                : 'Cancelar'
          }}</span
          ><span
            v-if="modo === 'login'"
            class="conta-mobile"
            >Criar uma conta</span
          ></RouterLink
        >
      </div>
      <p
        v-if="modo === 'login'"
        class="conta-mobile conta-mobile-rodape-login"
      >
        Seus pedidos, dados e avaliações em um só lugar.
      </p>
    </form>
  </main>
</template>
