import axios from "axios";
import { API_URL } from "@/utils/api";

const api = axios.create({
  baseURL: API_URL,
});
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("iflibrary_token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
export const mensagemErro = (error) =>
  error.response?.data?.message ||
  "Não foi possível conectar à API. Confira se o JSON Server está em execução.";
export default api;
