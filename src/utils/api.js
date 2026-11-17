// Endereço da API usada pelas telas de livros.
export const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

export async function lerResposta(resposta) {
  if (resposta.status === 204) {
    return null;
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    const erro = new Error(
      dados.mensagem ||
        dados.message ||
        'Não foi possível concluir a operação.',
    );
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

export function mensagemErro(erro) {
  if (erro.status === 404) {
    return 'Livro não encontrado. Ele pode ter sido excluído.';
  }
  if (erro instanceof TypeError) {
    return 'Não foi possível acessar a API. Confira se npm run api está em execução e tente novamente.';
  }
  return erro.message || 'Não foi possível concluir a operação.';
}
