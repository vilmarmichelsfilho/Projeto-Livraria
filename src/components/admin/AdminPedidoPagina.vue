<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import PedidosForm from "@/components/PedidosForm.vue";
import ItensPedidoForm from "@/components/ItensPedidoForm.vue";
import ItemPedidoDetalhes from "@/components/ItemPedidoDetalhes.vue";
import ConfirmacaoExclusaoPedido from "./ConfirmacaoExclusaoPedido.vue";
import PedidoItensTabela from "./PedidoItensTabela.vue";
import AdminModal from "./AdminModal.vue";
import AdminIcon from "./AdminIcon.vue";
import PedidoAdicionarItem from "./PedidoAdicionarItem.vue";
import pedidosService, {
  moeda,
  totalItens,
  situacoesPedido,
  etapasPedido,
  erroPedido,
} from "@/services/pedidosService";

const props = defineProps({ modo: { type: String, required: true } });
const route = useRoute(),
  router = useRouter();
const novo = computed(() => props.modo === "novo");
const editavel = computed(
  () =>
    novo.value ||
    (props.modo === "editar" && pedido.value?.status === "RASCUNHO"),
);
const pedido = ref(null),
  itens = ref([]),
  clientes = ref([]),
  livros = ref([]);
const dados = ref({ id_usuario: "", destinatario: "", endereco_entrega: "" });
const carregando = ref(true),
  busy = ref(false),
  erro = ref(""),
  sucesso = ref(route.query.salvo ? "Rascunho salvo com sucesso." : "");
const itemForm = ref(false),
  itemEdicao = ref(null),
  itemDetalhes = ref(null),
  itemRemocao = ref(null);
const exclusao = ref(false),
  erroExclusao = ref(""),
  cancelamento = ref(false),
  situacao = ref("");
const idSalvo = ref(null);
const cliente = computed(() =>
  clientes.value.find(
    (usuario) => String(usuario.id) === String(pedido.value?.id_usuario),
  ),
);
const total = computed(() => totalItens(itens.value));
const proximas = computed(() => {
  const indice = etapasPedido.indexOf(pedido.value?.status);
  return indice >= 0 ? etapasPedido.slice(indice + 1, indice + 2) : [];
});
const podeCancelar = computed(() =>
  ["RECEBIDO", "EM_SEPARACAO"].includes(pedido.value?.status),
);
const dataPedido = computed(() => {
  const data = pedido.value?.confirmado_em || pedido.value?.criado_em;
  return data ? new Date(data).toLocaleDateString("pt-BR") : "";
});
async function carregar() {
  carregando.value = true;
  erro.value = "";
  try {
    const resultados = await Promise.all([
      pedidosService.clientes(),
      pedidosService.livros(),
      ...(novo.value ? [] : [pedidosService.obter(route.params.id)]),
    ]);
    clientes.value = resultados[0];
    livros.value = resultados[1];
    if (!novo.value) {
      pedido.value = resultados[2];
      itens.value = pedido.value.itens ?? [];
      idSalvo.value = pedido.value.id;
      dados.value = {
        id_usuario: pedido.value.id_usuario,
        destinatario: pedido.value.destinatario || cliente.value?.nome || "",
        endereco_entrega:
          pedido.value.endereco_entrega ||
          [
            cliente.value?.endereco,
            cliente.value?.cidade,
            cliente.value?.uf,
            cliente.value?.cep,
          ]
            .filter(Boolean)
            .join(" • "),
      };
      situacao.value = proximas.value[0] || "";
      if (props.modo === "editar" && pedido.value.status !== "RASCUNHO")
        await router.replace(`/admin/pedidos/${pedido.value.id}`);
      else if (props.modo === "detalhes" && pedido.value.status === "RASCUNHO")
        await router.replace(`/admin/pedidos/${pedido.value.id}/editar`);
    }
  } catch (error) {
    erro.value = erroPedido(error);
  } finally {
    carregando.value = false;
  }
}
async function salvar(confirmar = false) {
  if (busy.value) return;
  busy.value = true;
  erro.value = "";
  sucesso.value = "";
  try {
    const salvo = await pedidosService.salvar(
      idSalvo.value,
      dados.value,
      itens.value,
    );
    idSalvo.value = salvo.id;
    pedido.value = salvo;
    if (confirmar) {
      await pedidosService.mudarSituacao(salvo.id, "RECEBIDO");
      await router.push(`/admin/pedidos/${salvo.id}`);
    } else if (novo.value)
      await router.replace(`/admin/pedidos/${salvo.id}/editar?salvo=1`);
    else sucesso.value = "Alterações salvas com sucesso.";
  } catch (error) {
    erro.value = erroPedido(error);
  } finally {
    busy.value = false;
  }
}
function abrirItem(item = null) {
  itemEdicao.value = item;
  itemForm.value = true;
}
function salvarItem(item) {
  const indice = itens.value.findIndex(
    (existente) => String(existente.id_livro) === String(item.id_livro),
  );
  if (indice < 0) itens.value.push(item);
  else itens.value[indice] = item;
  itemForm.value = false;
}
async function excluir() {
  if (busy.value) return;
  busy.value = true;
  erroExclusao.value = "";
  try {
    await pedidosService.excluir(pedido.value.id);
    await router.push("/admin/pedidos");
  } catch (error) {
    erroExclusao.value = erroPedido(error);
  } finally {
    busy.value = false;
  }
}
async function atualizar(status) {
  if (busy.value) return;
  busy.value = true;
  erro.value = "";
  sucesso.value = "";
  try {
    pedido.value = await pedidosService.mudarSituacao(pedido.value.id, status);
    situacao.value = proximas.value[0] || "";
    cancelamento.value = false;
    sucesso.value =
      status === "CANCELADO"
        ? "Pedido cancelado com sucesso."
        : "Situação atualizada com sucesso.";
  } catch (error) {
    erro.value = erroPedido(error);
    cancelamento.value = false;
  } finally {
    busy.value = false;
  }
}
onMounted(carregar);
</script>

<template>
  <section class="admin-page">
    <p v-if="carregando" role="status">Carregando pedido…</p>
    <template v-else>
      <div v-if="erro" class="admin-feedback error" role="alert">
        {{ erro }}
        <button
          v-if="!novo && !pedido"
          class="admin-button-secondary"
          @click="carregar"
        >
          Tentar novamente
        </button>
      </div>
      <div v-if="sucesso" class="admin-feedback" role="status">
        {{ sucesso }}
      </div>
      <template v-if="novo || pedido">
        <header class="admin-page-header">
          <h1>
            <RouterLink
              class="admin-mobile-only admin-back-link"
              to="/admin/pedidos"
              aria-label="Voltar aos pedidos"
              ><AdminIcon name="back"
            /></RouterLink>
            <span class="admin-desktop-only">
              {{
                novo
                  ? "Criar pedido"
                  : editavel
                    ? `Editar pedido #${pedido.id}`
                    : `Pedido #${pedido.id}`
              }}
            </span>
            <span class="admin-mobile-only">{{
              novo
                ? "Criar pedido"
                : editavel
                  ? "Editar rascunho"
                  : `Pedido #${pedido.id}`
            }}</span>
          </h1>
          <p class="admin-subtitle admin-desktop-only">
            {{
              novo
                ? "O pedido inicia como rascunho e ainda não altera o estoque"
                : `${situacoesPedido[pedido.status]}${editavel ? "" : ` em ${dataPedido}`} • Cliente ${cliente?.nome || "não encontrado"}`
            }}
          </p>
          <p class="admin-subtitle admin-mobile-only">
            {{
              editavel
                ? "As alterações são permitidas no rascunho."
                : `${situacoesPedido[pedido.status]} em ${dataPedido}`
            }}
          </p>
          <span
            v-if="!editavel"
            class="admin-badge admin-mobile-only admin-current-status"
            >{{ situacoesPedido[pedido.status] }}</span
          >
        </header>
        <form v-if="editavel" @submit.prevent="salvar(false)">
          <PedidosForm
            v-model="dados"
            :clientes="clientes"
            :novo="novo"
            :disabled="busy"
          />
          <PedidoAdicionarItem
            :livros="livros"
            :itens="itens"
            :disabled="busy"
            @add="salvarItem"
          />
          <h2 v-if="novo" class="admin-desktop-only">Itens do pedido</h2>
          <div v-if="!itens.length" class="admin-empty admin-desktop-only">
            <p>Adicione o primeiro livro ao rascunho</p>
            <button type="button" :disabled="busy" @click="abrirItem()">
              <AdminIcon name="plus" />Adicionar item
            </button>
          </div>
          <PedidoItensTabela
            v-if="itens.length"
            :itens="itens"
            :livros="livros"
            editavel
            :disabled="busy"
            @edit="abrirItem"
            @view="itemDetalhes = $event"
            @remove="itemRemocao = $event"
            @quantity="salvarItem"
          />
          <div v-if="itens.length" class="admin-total-row admin-desktop-only">
            <button type="button" :disabled="busy" @click="abrirItem()">
              <AdminIcon name="plus" />Adicionar item
            </button>
            <p class="admin-total">Total {{ moeda(total) }}</p>
          </div>
          <p class="admin-total admin-mobile-only admin-mobile-total">
            Total: {{ moeda(total) }}
          </p>
          <div class="admin-actions">
            <button :disabled="busy">
              {{
                busy
                  ? "Salvando…"
                  : novo
                    ? "Salvar rascunho"
                    : "Salvar alterações"
              }}</button
            ><RouterLink
              :class="{ 'admin-mobile-only': !novo }"
              class="admin-button admin-button-secondary"
              to="/admin/pedidos"
              >Cancelar</RouterLink
            ><button
              v-if="!novo"
              type="button"
              class="admin-button-secondary"
              :disabled="busy || !itens.length"
              @click="salvar(true)"
            >
              Confirmar pedido
            </button>
          </div>
        </form>
        <div v-else class="admin-confirmed-content">
          <div
            v-if="pedido.status !== 'CANCELADO'"
            class="admin-tracking-card admin-mobile-only"
          >
            <h2>Acompanhe seu pedido</h2>
            <ol aria-label="Andamento do pedido">
              <li
                v-for="etapa in etapasPedido"
                :key="etapa"
                :class="{ current: pedido.status === etapa }"
                :aria-current="pedido.status === etapa ? 'step' : undefined"
              >
                {{ pedido.status === etapa ? "●" : "○" }}
                {{ situacoesPedido[etapa] }}
              </li>
            </ol>
            <p>
              {{
                pedido.status === "RECEBIDO"
                  ? "Pedido recebido. Em breve iniciaremos a separação."
                  : pedido.status === "EM_SEPARACAO"
                    ? "Seu pedido está sendo preparado para envio."
                    : pedido.status === "ENVIADO"
                      ? "Seu pedido está a caminho."
                      : "Pedido entregue."
              }}
            </p>
          </div>
          <ol
            v-if="pedido.status !== 'CANCELADO'"
            class="admin-progress admin-desktop-only"
            aria-label="Andamento do pedido"
          >
            <li
              v-for="etapa in etapasPedido"
              :key="etapa"
              :class="{ current: pedido.status === etapa }"
              :aria-current="pedido.status === etapa ? 'step' : undefined"
            >
              {{ situacoesPedido[etapa] }}
            </li>
          </ol>
          <PedidoItensTabela :itens="itens" :livros="livros" />
          <div class="admin-address">
            <h2>Destinatário e endereço</h2>
            <p>
              <span>{{ pedido.destinatario || cliente?.nome }}</span
              ><span class="admin-desktop-only"> • </span>
              <span>{{
                pedido.endereco_entrega || "Endereço não informado"
              }}</span>
            </p>
          </div>
          <p class="admin-total admin-details-total">
            <span class="admin-desktop-only">Total </span
            ><span class="admin-mobile-only">Total: </span>{{ moeda(total) }}
          </p>
          <form
            v-if="proximas.length || podeCancelar"
            class="admin-status-form"
            @submit.prevent="atualizar(situacao)"
          >
            <label v-if="proximas.length" class="admin-field"
              ><span>Atualizar situação</span
              ><select v-model="situacao" :disabled="busy">
                <option
                  v-for="status in proximas"
                  :key="status"
                  :value="status"
                >
                  {{ situacoesPedido[status] }}
                </option>
              </select></label
            ><button v-if="proximas.length" :disabled="busy">
              {{ busy ? "Salvando…" : "Salvar situação" }}</button
            ><button
              v-if="podeCancelar"
              type="button"
              class="admin-button-secondary"
              :disabled="busy"
              @click="cancelamento = true"
            >
              Cancelar pedido
            </button>
          </form>
        </div>
        <div v-if="!novo" class="admin-notice">
          <p>
            {{
              editavel
                ? "Somente pedidos em rascunho podem ser excluídos."
                : "Pedidos confirmados são preservados; use o cancelamento permitido."
            }}
          </p>
          <button
            class="admin-button-danger"
            :disabled="busy"
            @click="
              erroExclusao = '';
              exclusao = true;
            "
          >
            {{ editavel ? "Excluir rascunho" : "Excluir pedido" }}
          </button>
        </div>
      </template>
      <RouterLink
        v-else
        class="admin-button admin-button-secondary"
        to="/admin/pedidos"
        >Voltar aos pedidos</RouterLink
      >
    </template>
    <ItensPedidoForm
      v-if="itemForm"
      :livros="livros"
      :itens="itens"
      :item="itemEdicao"
      @close="itemForm = false"
      @save="salvarItem"
    />
    <ItemPedidoDetalhes
      v-if="itemDetalhes"
      :item="itemDetalhes"
      @close="itemDetalhes = null"
    />
    <ConfirmacaoExclusaoPedido
      v-if="exclusao"
      :pedido="pedido"
      :busy="busy"
      :erro="erroExclusao"
      @close="exclusao = false"
      @confirm="excluir"
      @view="exclusao = false"
    />
    <AdminModal
      v-if="itemRemocao"
      label="Remover item?"
      @close="itemRemocao = null"
      ><h2>Remover item?</h2>
      <p>
        {{ itemRemocao.titulo_livro }} será removido do rascunho. Salve as
        alterações para aplicar.
      </p>
      <div class="admin-modal-actions">
        <button class="admin-button-secondary" @click="itemRemocao = null">
          Cancelar</button
        ><button
          class="admin-button-destructive"
          @click="
            itens = itens.filter(
              (item) => item.id_livro !== itemRemocao.id_livro,
            );
            itemRemocao = null;
          "
        >
          Remover item
        </button>
      </div></AdminModal
    >
    <AdminModal
      v-if="cancelamento"
      label="Cancelar pedido?"
      :busy="busy"
      @close="!busy && (cancelamento = false)"
      ><h2>Cancelar pedido?</h2>
      <p>
        O pedido #{{ pedido.id }} será cancelado e os itens voltarão ao estoque.
        O registro será preservado no histórico.
      </p>
      <div class="admin-modal-actions">
        <button
          class="admin-button-secondary"
          :disabled="busy"
          @click="cancelamento = false"
        >
          Voltar</button
        ><button
          class="admin-button-destructive"
          :disabled="busy"
          @click="atualizar('CANCELADO')"
        >
          {{ busy ? "Cancelando…" : "Cancelar pedido" }}
        </button>
      </div></AdminModal
    >
  </section>
</template>
