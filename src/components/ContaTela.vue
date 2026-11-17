<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import usuarios from "@/services/usuariosService";
import { mensagemErro } from "@/services/api";
import "@/assets/conta.css";
import { buscarCep } from "@/services/cepService";
const props = defineProps({ modo: { type: String, required: true } });
const router = useRouter(),
  route = useRoute();
const dados = reactive({
  nome: "",
  email: "",
  senha: "",
  confirmar: "",
  telefone: "",
  endereco: "",
  cidade: "",
  uf: "",
  cep: "",
  senha_atual: "",
});
const usuario = ref(null),
  carregando = ref(false),
  carregandoDados = ref(false),
  erro = ref(""),
  sucesso = ref(route.query.sucesso || ""),
  confirmarExclusao = ref(false);
const consultandoCep = ref(false);
const avisoCep = ref("");
let controleCep;
let versaoCep = 0;
onBeforeUnmount(() => {
  versaoCep++;
  controleCep?.abort();
});
async function atualizarCep() {
  dados.cep = dados.cep.replace(/\D/g, "").slice(0, 8);
  const versao = ++versaoCep;
  controleCep?.abort();
  consultandoCep.value = false;
  avisoCep.value = "";
  if (dados.cep.length !== 8) return;
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
    if (versao !== versaoCep) return;
    for (const campo of ["cidade", "uf", "endereco"]) {
      if (dados[campo] === original[campo]) dados[campo] = resultado[campo];
    }
    avisoCep.value =
      "Endereço localizado. Confira os dados e acrescente número e complemento.";
  } catch (error) {
    if (versao !== versaoCep) return;
    avisoCep.value =
      error.name === "AbortError"
        ? "A consulta demorou demais. Preencha o endereço manualmente ou digite o CEP novamente."
        : error.message === "Failed to fetch"
          ? "Não foi possível consultar o CEP. Preencha o endereço manualmente."
          : error.message;
  } finally {
    clearTimeout(timeout);
    if (versao === versaoCep) consultandoCep.value = false;
  }
}
const titulos = {
  login: "Entrar",
  cadastro: "Criar conta",
  conta: "Minha conta",
  editar: "Editar meus dados",
  senha: "Alterar senha",
};
const titulo = computed(() => titulos[props.modo]);
const campos = computed(() => {
  const campo = (
    key,
    label,
    type = "text",
    required = false,
    autocomplete = key,
  ) => ({ key, label, type, required, autocomplete });
  const nome = campo("nome", "Nome completo", "text", true, "name"),
    email = campo("email", "E-mail", "email", true, "email");
  const senha = campo(
    "senha",
    props.modo === "senha" ? "Nova senha" : "Senha",
    "password",
    true,
    props.modo === "login" ? "current-password" : "new-password",
  );
  const confirmar = campo(
    "confirmar",
    props.modo === "senha" ? "Confirmar nova senha" : "Confirmar senha",
    "password",
    true,
    "new-password",
  );
  const endereco = [
    campo("endereco", "Endereço", "text", true, "street-address"),
    campo("cidade", "Cidade", "text", true, "address-level2"),
    campo("uf", "UF", "text", true, "address-level1"),
    campo("cep", "CEP", "text", true, "postal-code"),
  ];
  if (props.modo === "login") return [email, senha];
  if (props.modo === "senha")
    return [
      campo("senha_atual", "Senha atual", "password", true, "current-password"),
      senha,
      confirmar,
    ];
  if (props.modo === "cadastro")
    return [
      nome,
      email,
      campo("telefone", "Telefone", "tel", true, "tel"),
      senha,
      endereco[0],
      confirmar,
      ...endereco.slice(1),
    ];
  return [
    nome,
    email,
    campo("telefone", "Telefone", "tel", true, "tel"),
    ...endereco,
  ];
});
const acao = computed(
  () =>
    ({
      login: "Entrar na conta",
      cadastro: "Criar minha conta",
      editar: "Salvar alterações",
      senha: "Salvar nova senha",
    })[props.modo],
);
const protegido = computed(() =>
  ["conta", "editar", "senha"].includes(props.modo),
);
onMounted(carregar);
async function carregar() {
  if (!protegido.value) return;
  carregandoDados.value = true;
  erro.value = "";
  try {
    usuario.value = await usuarios.atual();
    Object.assign(dados, usuario.value);
  } catch (error) {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("iflibrary_token");
      await router.replace("/entrar");
    } else erro.value = mensagemErro(error);
  } finally {
    carregandoDados.value = false;
  }
}
async function enviar() {
  if (consultandoCep.value) return;
  erro.value = "";
  sucesso.value = "";
  if (["cadastro", "editar"].includes(props.modo) && !dados.nome.trim()) {
    erro.value = "Informe seu nome completo.";
    return;
  }
  if (
    ["cadastro", "senha"].includes(props.modo) &&
    dados.senha !== dados.confirmar
  ) {
    erro.value = "As senhas não coincidem.";
    return;
  }
  carregando.value = true;
  try {
    if (props.modo === "login") {
      await usuarios.entrar({ email: dados.email, senha: dados.senha });
      await router.push("/minha-conta");
    }
    if (props.modo === "cadastro") {
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
        path: "/entrar",
        query: {
          sucesso: "Conta criada com sucesso! Entre com seu e-mail e senha.",
        },
      });
    }
    if (props.modo === "editar") {
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
        path: "/minha-conta",
        query: { sucesso: "Dados atualizados com sucesso." },
      });
    }
    if (props.modo === "senha") {
      await usuarios.alterarSenha(usuario.value.id, {
        senha_atual: dados.senha_atual,
        senha: dados.senha,
      });
      await router.push({
        path: "/minha-conta",
        query: { sucesso: "Senha alterada com sucesso." },
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
    await router.push("/entrar");
  } catch (error) {
    erro.value = mensagemErro(error);
    await router.push("/entrar");
  } finally {
    carregando.value = false;
  }
}
async function excluir() {
  carregando.value = true;
  erro.value = "";
  try {
    const result = await usuarios.excluir(usuario.value.id);
    sessionStorage.removeItem("iflibrary_token");
    await router.push({ path: "/entrar", query: { sucesso: result.message } });
  } catch (error) {
    erro.value = mensagemErro(error);
  } finally {
    carregando.value = false;
  }
}
</script>
<template>
  <main class="conta-pagina" :class="'conta-modo-' + modo">
    <h1>{{ titulo }}</h1>
    <p class="conta-subtitulo">
      {{
        modo === "conta"
          ? "Consulte seus dados e acompanhe suas compras"
          : "Preencha seus dados para continuar na IFLibrary"
      }}
    </p>
    <p v-if="erro" class="conta-aviso erro" role="alert">{{ erro }}</p>
    <p v-if="sucesso" class="conta-aviso sucesso" role="status">
      {{ sucesso }}
    </p>
    <p v-if="carregandoDados" role="status">Carregando seus dados…</p>
    <div v-else-if="protegido && !usuario" class="conta-aviso">
      <button class="conta-botao" @click="carregar">Tentar novamente</button>
    </div>
    <section
      v-else-if="modo === 'conta' && usuario"
      class="conta-painel conta-resumo"
      aria-label="Dados da conta"
    >
      <div class="conta-identidade">
        <v-icon icon="mdi-account-circle" aria-hidden="true" />
        <div>
          <h2>{{ usuario.nome }}</h2>
          <p>{{ usuario.email }}</p>
        </div>
      </div>
      <dl class="conta-detalhes">
        <div>
          <dt>Telefone</dt>
          <dd>{{ usuario.telefone || "Não informado" }}</dd>
        </div>
        <div>
          <dt>Endereço</dt>
          <dd>{{ usuario.endereco || "Não informado" }}</dd>
        </div>
        <div>
          <dt>Cidade e UF</dt>
          <dd>
            {{
              [usuario.cidade, usuario.uf].filter(Boolean).join(" • ") ||
              "Não informado"
            }}
          </dd>
        </div>
        <div>
          <dt>CEP</dt>
          <dd>
            {{
              usuario.cep
                ? usuario.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
                : "Não informado"
            }}
          </dd>
        </div>
      </dl>
      <div class="conta-acoes">
        <RouterLink class="conta-botao" to="/minha-conta/editar"
          >Editar meus dados</RouterLink
        >
        <RouterLink class="conta-botao secundario" to="/minha-conta/senha"
          >Alterar senha</RouterLink
        >
        <button
          class="conta-botao secundario"
          :disabled="carregando"
          @click="confirmarExclusao = true"
        >
          Excluir minha conta
        </button>
        <button class="conta-sair" :disabled="carregando" @click="sair">
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
          <button class="conta-botao" :disabled="carregando" @click="excluir">
            {{ carregando ? "Excluindo…" : "Confirmar exclusão" }}</button
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
    <form
      v-else
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
            >{{ campo.label }}{{ campo.required ? " *" : "" }}</label
          >
          <input
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
        {{ consultandoCep ? "Consultando CEP…" : avisoCep }}
      </p>
      <p v-if="modo === 'cadastro'" class="conta-observacao conta-instrucoes">
        * Campos obrigatórios. Informe telefone e endereço para criar sua conta.
      </p>
      <div class="conta-acoes">
        <button
          class="conta-botao"
          type="submit"
          :disabled="carregando || consultandoCep"
        >
          {{ carregando ? "Aguarde…" : acao }}
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
          >{{
            modo === "login"
              ? "Criar conta"
              : modo === "cadastro"
                ? "Voltar"
                : "Cancelar"
          }}</RouterLink
        >
      </div>
    </form>
  </main>
</template>
