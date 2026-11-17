import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

export function mensagemErroApi(erro, acao) {
  return erro.response
    ? `Não foi possível ${acao} (HTTP ${erro.response.status}). Tente novamente.`
    : `Não foi possível ${acao}. Verifique se o JSON Server está em execução e tente novamente.`
}

export default api
