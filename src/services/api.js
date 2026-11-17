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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = sessionStorage.getItem("iflibrary_token");
    if (
      error.response?.status === 401 &&
      token &&
      error.config?.url !== "/auth/login" &&
      error.config?.headers?.Authorization === "Bearer " + token
    ) {
      sessionStorage.removeItem("iflibrary_token");
      window.dispatchEvent(new Event("iflibrary:sessao-expirada"));
    }
    return Promise.reject(error);
  },
);
export const mensagemErro = (error) =>
  error.response?.data?.message ||
  "Não foi possível conectar à API. Confira se o JSON Server está em execução.";
export default api;
