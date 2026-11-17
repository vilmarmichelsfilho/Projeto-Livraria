import api from "./api";
export default {
  async listar() {
    return (await api.get("/usuarios")).data;
  },
  async obter(id) {
    return (await api.get(`/usuarios/${id}`)).data;
  },
  async cadastrarAdmin(dados) {
    return (await api.post("/admin/usuarios", dados)).data;
  },
  async entrar(dados) {
    const { data } = await api.post("/auth/login", dados);
    sessionStorage.setItem("iflibrary_token", data.token);
    return data.usuario;
  },
  async atual() {
    return (await api.get("/auth/me")).data;
  },
  async cadastrar(dados) {
    return (await api.post("/usuarios", dados)).data;
  },
  async atualizar(id, dados) {
    return (await api.patch("/usuarios/" + id, dados)).data;
  },
  async alterarSenha(id, dados) {
    await api.patch("/usuarios/" + id + "/senha", dados);
  },
  async excluir(id) {
    return (await api.delete("/usuarios/" + id)).data;
  },
  async sair() {
    try {
      await api.post("/auth/logout");
    } finally {
      sessionStorage.removeItem("iflibrary_token");
    }
  },
};
