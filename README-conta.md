# Telas de conta — IFLibrary

Execute npm install e npm run dev:all. A API fica em localhost:3000 e o front em localhost:5173.
O comando npm run api executa JSON Server direto no db.json. Não há arquivo de servidor próprio.

Rotas das telas: /entrar, /cadastro, /minha-conta, /minha-conta/editar e /minha-conta/senha.

O login é uma simulação escolar: a tela consulta GET /usuarios?email=..., confere a senha fictícia
e guarda o ID em sessionStorage (iflibrary_usuario). Sair limpa esse ID.
Não há tokens, autenticação ou autorização na API. Use somente dados fictícios.

Contas iniciais: ana.lima@example.com (ADMIN) e marina.costa@example.com (CLIENTE).
Senha fictícia dos usuários iniciais: Teste123! O campo senha fica em texto no db.json.

Cadastro: POST /usuarios, com ID gerado pelo JSON Server.
Consulta: GET /usuarios/:id. Edição e troca de senha: PATCH /usuarios/:id.
Exclusão sem pedidos: DELETE /usuarios/:id, depois de excluir as avaliações vinculadas.
Com pedidos, a tela inativa a conta com PATCH para preservar o histórico.
A tela também impede excluir o último administrador ativo.

Nome, e-mail, telefone, endereço, cidade, UF e CEP são obrigatórios.
As validações, a conferência de e-mail repetido e as datas são feitas pelo front.
O JSON Server padrão aceita requisições diretas sem aplicar essas regras.

CEP: oito dígitos consultam o ViaCEP para preencher cidade, UF e endereço.
Os campos continuam editáveis. O teste é node --test tests/cep.test.js.
