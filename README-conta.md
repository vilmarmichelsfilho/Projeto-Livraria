# Telas de conta — IFLibrary

Execute npm install e npm run dev:all. Abra http://localhost:5173/entrar.

Rotas: /entrar, /cadastro, /minha-conta, /minha-conta/editar, /minha-conta/senha.
Crie uma conta para testar: os usuários originais de db.json têm hashes fictícios e não autenticam.

A API usa JSON Server 0.17 e persiste no db.json. npm run api inicia server.cjs com POST /usuarios, POST /auth/login, GET /auth/me, POST /auth/logout, GET/PATCH/DELETE /usuarios/:id e PATCH /usuarios/:id/senha. PATCH altera parcialmente os dados; POST cadastra; DELETE exclui contas sem pedidos ou inativa contas com histórico. push é operação de arrays; os métodos HTTP são POST/PATCH/DELETE.

id é a chave do JSON Server; id_usuario é seu alias, gerado no servidor. Senhas são hashes scrypt com salt. Perfil, atividade e datas são controlados pelo servidor. E-mails são normalizados e únicos, CEP é texto com oito dígitos. Telefone, endereço, cidade, UF e CEP são obrigatórios no cadastro e na edição, com validação no formulário e no servidor.

Tokens de sessão duram 24h, ficam em sessionStorage e são invalidados ao sair, excluir a conta ou reiniciar a API. Rotas de usuários restringem acesso ao próprio usuário e não retornam hashes. As demais entidades continuam com as rotas originais de demonstração do JSON Server; este trabalho não implementa autorização nem transações de catálogo/pedidos.

npm run test:conta executa testes em cópia temporária do banco. npm run build valida o build.

Validação opcional de navegador no Windows com Edge instalado: `node tests/browser-conta.cjs`. Usa banco temporário, portas locais e salva capturas em `.vite/conta-qa/`.

CEP: ao digitar oito dígitos no cadastro ou edição, o ViaCEP (https://viacep.com.br/) preenche cidade, UF e endereço no formato bairro, logradouro. Sem logradouro, mantém bairro e vírgula. Os campos continuam editáveis para número/complemento e falhas de consulta. Consulta tem limite de 8 segundos; respostas de CEPs anteriores são descartadas. Testes: node --test tests/cep.test.mjs.
