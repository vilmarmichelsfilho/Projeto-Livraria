import api from './api.js'

export function criarServico(recurso) {
  const caminho = id => `/${recurso}/${encodeURIComponent(id)}`
  return {
    listar: async (params = {}) => (await api.get(`/${recurso}`, { params })).data,
    buscarPorId: async id => (await api.get(caminho(id))).data,
    cadastrar: async dados => (await api.post(`/${recurso}`, dados)).data,
    atualizar: async (id, dados) => (await api.patch(caminho(id), dados)).data,
    excluir: async id => { await api.delete(caminho(id)) },
  }
}
