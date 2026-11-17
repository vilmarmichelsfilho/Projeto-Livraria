import api from './api';

// Login de demonstração para dados fictícios, sem autenticação no servidor.
function camposUsuario(dados) {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    telefone: dados.telefone.trim(),
    endereco: dados.endereco.trim(),
    cidade: dados.cidade.trim(),
    uf: dados.uf.trim().toUpperCase(),
    cep: dados.cep.replace(/\D/g, ''),
  };
}

async function validarDados(dados, id) {
  for (const campo of Object.keys(dados)) {
    if (!dados[campo]) {
      throw new Error('Preencha todos os campos obrigatórios.');
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    throw new Error('Informe um e-mail válido.');
  }
  if (dados.cep.length !== 8) {
    throw new Error('O CEP deve conter 8 dígitos.');
  }
  const ufs =
    'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(
      ' ',
    );
  if (!ufs.includes(dados.uf)) {
    throw new Error('Selecione uma UF válida.');
  }
  const resposta = await api.get('/usuarios', {
    params: { email: dados.email },
  });
  const repetido = resposta.data.some(
    (usuario) => String(usuario.id) !== String(id),
  );
  if (repetido) {
    throw new Error('Este e-mail já está cadastrado.');
  }
}

function validarPerfil(perfil, ativo) {
  if (!['CLIENTE', 'ADMIN'].includes(perfil) || typeof ativo !== 'boolean') {
    throw new Error('Selecione um perfil e uma situação válidos.');
  }
}

async function cadastrarUsuario(dados, perfil, ativo) {
  const campos = camposUsuario(dados);
  await validarDados(campos);
  validarPerfil(perfil, ativo);
  if (dados.senha.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres.');
  }
  const agora = new Date().toISOString();
  const resposta = await api.post('/usuarios', {
    ...campos,
    senha: dados.senha,
    perfil,
    ativo,
    criado_em: agora,
    atualizado_em: agora,
  });
  return resposta.data;
}

export default {
  async listar() {
    return (await api.get('/usuarios')).data;
  },
  async obter(id) {
    return (await api.get(`/usuarios/${id}`)).data;
  },
  async cadastrarAdmin(dados) {
    return cadastrarUsuario(dados, dados.perfil, dados.ativo);
  },
  async atualizarAdmin(id, dados) {
    const respostaAtual = await api.get('/usuarios/' + id);
    const anterior = respostaAtual.data;
    const preenchido = { ...anterior, ...dados };
    const campos = camposUsuario(preenchido);
    await validarDados(campos, id);
    validarPerfil(preenchido.perfil, preenchido.ativo);

    // Não permite remover o acesso do último administrador ativo.
    if (
      anterior.perfil === 'ADMIN' &&
      anterior.ativo &&
      (preenchido.perfil !== 'ADMIN' || !preenchido.ativo)
    ) {
      const administradores = await api.get('/usuarios', {
        params: { perfil: 'ADMIN', ativo: true },
      });
      if (administradores.data.length <= 1) {
        throw new Error('O último administrador ativo deve ser preservado.');
      }
    }
    const resposta = await api.patch('/usuarios/' + id, {
      ...campos,
      perfil: preenchido.perfil,
      ativo: preenchido.ativo,
      atualizado_em: new Date().toISOString(),
    });
    return resposta.data;
  },
  async entrar(dados) {
    const email = dados.email.trim().toLowerCase();
    const resposta = await api.get('/usuarios', { params: { email } });
    const usuario = resposta.data.find((item) => item.senha === dados.senha);
    if (!usuario) {
      throw new Error('E-mail ou senha incorretos.');
    }
    if (!usuario.ativo) {
      throw new Error('Esta conta está inativa.');
    }
    sessionStorage.setItem('iflibrary_usuario', String(usuario.id));
    return usuario;
  },
  async atual() {
    const id = sessionStorage.getItem('iflibrary_usuario');
    if (!id) {
      throw new Error('Entre na sua conta.');
    }
    const resposta = await api.get('/usuarios/' + id);
    if (!resposta.data.ativo) {
      sessionStorage.removeItem('iflibrary_usuario');
      throw new Error('Esta conta está inativa.');
    }
    const usuario = { ...resposta.data };
    delete usuario.senha;
    return usuario;
  },
  async cadastrar(dados) {
    return cadastrarUsuario(dados, 'CLIENTE', true);
  },
  async atualizar(id, dados) {
    const campos = camposUsuario(dados);
    await validarDados(campos, id);
    const resposta = await api.patch('/usuarios/' + id, {
      ...campos,
      atualizado_em: new Date().toISOString(),
    });
    return resposta.data;
  },
  async alterarSenha(id, dados) {
    const resposta = await api.get('/usuarios/' + id);
    if (resposta.data.senha !== dados.senha_atual) {
      throw new Error('A senha atual está incorreta.');
    }
    if (dados.senha.length < 8) {
      throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    }
    await api.patch('/usuarios/' + id, {
      senha: dados.senha,
      atualizado_em: new Date().toISOString(),
    });
  },
  async excluir(id) {
    const resposta = await api.get('/usuarios/' + id);
    if (resposta.data.perfil === 'ADMIN' && resposta.data.ativo) {
      const administradores = await api.get('/usuarios', {
        params: { perfil: 'ADMIN', ativo: true },
      });
      if (administradores.data.length <= 1) {
        throw new Error('O último administrador ativo não pode ser excluído.');
      }
    }
    const pedidos = await api.get('/pedidos', { params: { id_usuario: id } });
    if (pedidos.data.length > 0) {
      await api.patch('/usuarios/' + id, {
        ativo: false,
        atualizado_em: new Date().toISOString(),
      });
      return {
        message: 'Conta inativada. O histórico de pedidos foi preservado.',
      };
    }
    const avaliacoes = await api.get('/avaliacoes', {
      params: { id_usuario: id },
    });
    for (const avaliacao of avaliacoes.data) {
      await api.delete('/avaliacoes/' + avaliacao.id);
    }
    await api.delete('/usuarios/' + id);
    return { message: 'Conta excluída com sucesso.' };
  },
  sair() {
    sessionStorage.removeItem('iflibrary_usuario');
  },
};
