import api from './api';

export const situacoesPedido = {
  RASCUNHO: 'Rascunho',
  RECEBIDO: 'Recebido',
  EM_SEPARACAO: 'Em separação',
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};
export const etapasPedido = ['RECEBIDO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE'];

export function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function totalItens(itens) {
  let total = 0;
  for (const item of itens) {
    total += item.quantidade * item.preco_unitario;
  }
  return Math.round(total * 100) / 100;
}

export function erroPedido(erro) {
  if (erro.response?.status === 404) {
    return 'Pedido não encontrado.';
  }
  if (erro.response?.data?.message) {
    return erro.response.data.message;
  }
  if (erro.request && !erro.response) {
    return 'Não foi possível conectar à API. Inicie a API com npm run api e tente novamente.';
  }
  return erro.message;
}

async function obter(id) {
  const resposta = await api.get('/pedidos/' + id);
  return resposta.data;
}

async function listar() {
  const resposta = await api.get('/pedidos');
  return resposta.data;
}

async function clientes() {
  const resposta = await api.get('/usuarios');
  return resposta.data.filter((usuario) => usuario.perfil === 'CLIENTE');
}

async function livros() {
  const resposta = await api.get('/livros');
  return resposta.data.filter((livro) => livro.ativo);
}

async function conferirRascunho(id) {
  const pedido = await obter(id);
  if (pedido.status !== 'RASCUNHO') {
    throw new Error(
      'Somente pedidos em rascunho podem ser alterados ou excluídos.',
    );
  }
}

async function salvar(id, dados, itens) {
  if (!dados.id_usuario) {
    throw new Error('Selecione um cliente.');
  }
  const respostaCliente = await api.get('/usuarios/' + dados.id_usuario);
  if (!respostaCliente.data.ativo) {
    throw new Error('Selecione um cliente ativo.');
  }

  const itensParaSalvar = [];
  for (const item of itens) {
    itensParaSalvar.push({
      id_livro: item.id_livro,
      titulo_livro: item.titulo_livro,
      quantidade: item.quantidade,
      preco_unitario: Number(item.preco_unitario).toFixed(2),
    });
  }

  const agora = new Date().toISOString();
  const campos = {
    ...dados,
    itens: itensParaSalvar,
    total: totalItens(itens),
    atualizado_em: agora,
  };

  if (id) {
    await conferirRascunho(id);
    const resposta = await api.patch('/pedidos/' + id, campos);
    return resposta.data;
  }

  campos.status = 'RASCUNHO';
  campos.criado_em = agora;
  campos.confirmado_em = null;
  campos.cancelado_em = null;
  campos.motivo_cancelamento = null;
  const resposta = await api.post('/pedidos', campos);
  return resposta.data;
}

async function excluir(id) {
  await conferirRascunho(id);
  await api.delete('/pedidos/' + id);
}

async function mudarSituacao(id, status) {
  const pedido = await obter(id);
  const itens = pedido.itens || [];
  const confirmar = pedido.status === 'RASCUNHO' && status === 'RECEBIDO';
  const cancelar =
    ['RECEBIDO', 'EM_SEPARACAO'].includes(pedido.status) &&
    status === 'CANCELADO';
  const etapaAtual = etapasPedido.indexOf(pedido.status);
  const avancar = etapaAtual >= 0 && status === etapasPedido[etapaAtual + 1];

  if (!confirmar && !cancelar && !avancar) {
    throw new Error('Esta mudança de situação não é permitida.');
  }
  if (
    confirmar &&
    (!itens.length ||
      !pedido.destinatario?.trim() ||
      !pedido.endereco_entrega?.trim())
  ) {
    throw new Error(
      'Preencha o destinatário, o endereço e adicione pelo menos um livro antes de confirmar.',
    );
  }

  const livrosAlterados = [];
  try {
    if (confirmar || cancelar) {
      // Confere todos os livros antes de alterar qualquer estoque.
      const livrosConferidos = [];
      for (const item of itens) {
        const resposta = await api.get('/livros/' + item.id_livro);
        const livro = resposta.data;
        if (confirmar && (!livro.ativo || livro.estoque < item.quantidade)) {
          throw new Error(
            'Estoque insuficiente para ' + item.titulo_livro + '.',
          );
        }
        livrosConferidos.push({ livro, item });
      }

      for (const registro of livrosConferidos) {
        const livro = registro.livro;
        const item = registro.item;
        let estoque = livro.estoque - item.quantidade;
        if (cancelar) {
          estoque = livro.estoque + item.quantidade;
        }
        await api.patch('/livros/' + livro.id, { estoque });
        livrosAlterados.push(livro);
      }
    }

    const agora = new Date().toISOString();
    const campos = { status, atualizado_em: agora };
    if (confirmar) {
      campos.confirmado_em = agora;
      campos.total = totalItens(itens);
    }
    if (cancelar) {
      campos.cancelado_em = agora;
      campos.motivo_cancelamento = 'Cancelado pela administração.';
    }
    const resposta = await api.patch('/pedidos/' + id, campos);
    return resposta.data;
  } catch (erro) {
    // Se uma requisição falhar, tenta devolver os estoques ao valor anterior.
    let falhouReposicao = false;
    for (const livro of livrosAlterados) {
      try {
        await api.patch('/livros/' + livro.id, { estoque: livro.estoque });
      } catch {
        falhouReposicao = true;
      }
    }
    if (falhouReposicao) {
      throw new Error(
        'A operação falhou. Confira o estoque dos livros antes de tentar novamente.',
        { cause: erro },
      );
    }
    throw erro;
  }
}

export default {
  obter,
  listar,
  clientes,
  livros,
  salvar,
  excluir,
  mudarSituacao,
};
