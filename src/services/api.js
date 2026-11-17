import axios from 'axios';
import { API_URL } from '@/utils/api';

const api = axios.create({
  baseURL: API_URL,
});
export function mensagemErro(erro) {
  if (erro.response?.status === 404) {
    return 'Registro não encontrado.';
  }
  if (erro.request && !erro.response) {
    return 'Não foi possível conectar à API. Confira se npm run api está em execução.';
  }
  return (
    erro.response?.data?.message ||
    erro.message ||
    'Não foi possível concluir a operação.'
  );
}
export default api;
