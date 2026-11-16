import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
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
