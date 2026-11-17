OLYMPUSLIBRARY — DOCUMENTAÇÃO DO CRUD DE LIVROS
Projeto do Hackathon | Vue e JSON Server

1. IDENTIFICAÇÃO

Projeto: OlympusLibrary (IFLibrary na interface).
Turma: não informada; preencher antes da entrega.
Equipe: Igor Gabriel Decker, Vilmar Michels Filho, Davi Augusto Ramos e Vitor.
Entidade: Livros.
Responsável pelo CRUD completo: Igor Gabriel Decker.
Versão do documento: 1.4 — 16/11/2026.
Repositório: https://github.com/vilmarmichelsfilho/Projeto-Livraria
API: http://localhost:3000 — JSON Server 0.17.4.
Aplicação: http://localhost:5173
Administração: http://localhost:5173/admin/livros

2. FINALIDADE DA ENTIDADE

Representar os livros da loja, incluindo descrição, preço, páginas, estoque,
gênero e situação. O CRUD permite cadastrar, listar, consultar pelo ID,
editar e excluir. Os registros também aparecem no catálogo e nos favoritos.

A organização segue os conceitos do PetSchool: páginas e componentes Vue
com ref, onMounted, v-model e chamadas fetch. A interface, os estilos e as
regras de Livros ficam nos arquivos .vue. JavaScript separado contém apenas
pequenas funções compartilhadas e a configuração da aplicação.

3. CAMPOS E REGRAS

Coleção no db.json: livros.

Campo | Tipo | Obrigatório | Regra
id | Inteiro | Automático | PK gerada pelo JSON Server; não enviar ID no cadastro.
titulo | Texto | Sim | De 1 a 180 caracteres; não aceitar somente espaços.
autor | Texto | Sim | De 1 a 120 caracteres.
genero | Texto | Sim | De 1 a 60 caracteres; usado nos filtros.
descricao | Texto | Sim | De 1 a 10000 caracteres.
paginas | Inteiro | Sim | Maior que zero.
preco | Número | Sim | Maior que zero, até duas casas decimais; máximo 99999999.99.
estoque | Inteiro | Sim | Não negativo.
estoque_minimo | Inteiro | Sim | Não negativo; formulário inicia com 5.
capa_url | Texto | Não | Caminho de imagem ou URL HTTP(S), até 500 caracteres.
endereco | Texto | Gerado se omitido | Slug único com letras minúsculas, números e hífens; até 200 caracteres.
ativo | Booleano | Sim | true ou false; formulário inicia com true.
criado_em | Texto ISO de data/hora | Automático na tela | Preenchido pelo Vue no cadastro; preservado na edição.
atualizado_em | Texto ISO de data/hora | Automático na tela | Preenchido pelo Vue em cada alteração.

No JSON Server, a PK chama-se id. Ela corresponde a id_livro do documento
conceitual. endereco é o slug da página, não um endereço de entrega.
Autor e gênero são atributos, sem novas entidades.
As imagens do projeto são JPG/PNG; os ícones usam fontes do Vuetify com MDI,
sem arquivos SVG próprios.

As validações de campos estão em LivrosForm.vue. Cadastro e edição consultam
o slug antes de salvar. Essa verificação acontece no Vue; o JSON Server
padrão não cria restrições de campos, unicidade ou relacionamentos.

4. ENDPOINTS DA ENTIDADE LIVROS

Método | Endpoint | Funcionalidade | Retorno observado
GET | /livros | Listar os registros. | 200 OK
GET | /livros/:id | Consultar um registro pelo ID. | 200 OK
POST | /livros | Cadastrar e gerar ID. | 201 Created
PATCH | /livros/:id | Atualizar campos enviados. | 200 OK
DELETE | /livros/:id | Excluir o registro. | 200 OK

Consultas utilizadas:
GET /livros?ativo=true
GET /livros?endereco=sombra-e-ossos
GET /pedidos
GET /avaliacoes?id_livro=1

A lista de avaliações inclui o nome do leitor. A página do livro pode
consultá-la sem acessar os dados da conta.

A pesquisa por texto, os filtros administrativos e a paginação de oito
registros são aplicados na página Vue após o GET. Os filtros ficam na URL
e são preservados ao retornar dos detalhes.

Atualização escolhida: PATCH, pois altera os campos enviados preservando
os demais. PUT não é necessário para o fluxo implementado.

5. CORPO DAS REQUISIÇÕES

Usar Content-Type: application/json. GET e DELETE não precisam de corpo.

POST /livros — exemplo fictício enviado pela tela:

{
  "titulo": "Livro Fictício Vue",
  "autor": "Autor Exemplo",
  "genero": "Fantasia",
  "descricao": "Livro fictício para demonstração.",
  "paginas": 200,
  "preco": 29.90,
  "estoque": 7,
  "estoque_minimo": 2,
  "capa_url": "",
  "ativo": true,
  "endereco": "livro-ficticio-vue",
  "criado_em": "2026-11-16T12:00:00.000Z",
  "atualizado_em": "2026-11-16T12:00:00.000Z"
}

O ID é retornado pela API e utilizado nas próximas operações.

PATCH /livros/:id — exemplo:

{
  "preco": 39.90,
  "estoque": 4,
  "atualizado_em": "2026-11-16T13:00:00.000Z"
}

Inativação: PATCH /livros/:id com ativo=false e atualizado_em.
Os horários reais são definidos pela interface no momento da operação.

6. RELACIONAMENTOS

Livros 1:N Avaliações:
avaliacoes[].id_livro referencia livros[].id.

Livros N:N Pedidos:
pedidos[].itens[].id_livro referencia livros[].id. Cada item também guarda
quantidade, preco_unitario (texto decimal com duas casas) e titulo_livro.
Os itens pertencem ao pedido; não existe coleção separada de itens.

Fluxo de exclusão em ConfirmacaoExclusao.vue:
1. Consultar o livro, os pedidos e suas avaliações.
2. Se algum pedido mencionar o livro, bloquear a ação de excluir na tela
   e oferecer a inativação por PATCH.
3. Sem pedidos, pedir confirmação e conferir os vínculos novamente.
4. Excluir as avaliações e depois o livro, conferindo cada resposta.
5. Cancelar fecha o diálogo sem enviar DELETE.

As chamadas são sequenciais. A API padrão não fornece transação nem protege
requisições diretas. Uma falha pode deixar uma exclusão parcialmente feita;
a interface informa erro e permite tentar novamente. O bloqueio de livros
com pedidos é uma regra da interface, não uma garantia do servidor.

7. TELAS E COMPORTAMENTO

A02 /admin/livros: listagem, pesquisa, filtros, paginação e ações.
A03 /admin/livros/novo: formulário e POST.
A04 /admin/livros/:id/editar: GET por ID e PATCH.
A05 /admin/livros/:id: consulta e acesso à edição/exclusão.
A06 diálogo: confirmação e DELETE.
A07 diálogo: vínculo com pedidos e inativação.
Loja /: catálogo de livros ativos.
Gênero /:genero: livros ativos do gênero.
Favoritos /favoritos: IDs locais cruzados com livros da API.
Detalhes /livro/:endereco: livro, avaliações e ação de adicionar ao carrinho.

Estados:
- Carregamento: mensagem enquanto aguarda a API.
- Salvamento: bloquear envio repetido.
- Sucesso: avisar somente depois da resposta confirmada.
- Erro: apresentar mensagem, preservar formulário e permitir nova tentativa.
- Lista vazia: orientar a rever filtros ou cadastrar.
- Não encontrado: informar a ausência e oferecer retorno.
- Sem estoque ou inativo: impedir adicionar ao carrinho.
- Cancelar exclusão: não realizar a remoção.
- Após excluir: atualizar a listagem ou retornar a ela.
- Após salvar: consultar o ID retornado e mostrar os dados persistidos.

8. CÓDIGOS DE RESPOSTA

200: GET, PATCH e DELETE bem-sucedidos.
201: registro criado por POST.
404: ID inexistente ou consulta após exclusão.

Campos inválidos, slug repetido e vínculo com pedido são tratados pelo Vue
antes das gravações. Não documentar 409/422 como respostas automáticas desta
API padrão. Falhas de rede e outros erros HTTP são apresentados ao usuário.

9. REGISTRO DAS VERIFICAÇÕES

Data: 16/11/2026. Responsável pelo CRUD e demonstração: Igor Gabriel Decker.
Ambiente: Node.js 24.15.0, Windows, JSON Server 0.17.4.
Atualização: PATCH.

Foram executadas verificações automatizadas temporárias, fora do repositório,
usando as funções dos componentes Vue e uma cópia de db.json:
- Validação de livro válido, preço negativo, estoque negativo e páginas fracionadas.
- Cadastro pela função da página: POST e consulta do ID/datas retornados.
- Slug repetido: mensagem no formulário e ausência de segundo cadastro.
- Edição pela função da página: PATCH e preservação da data de criação.
- Cancelamento da confirmação sem requisição DELETE.
- Livro com pedido: bloqueio da exclusão e inativação.
- Livro sem pedido: remoção das avaliações, DELETE e GET posterior 404.
- Preservação das regras CSS originais ao transferi-las para os componentes.
- A base de dados da equipe permaneceu inalterada.

Resultado dessas verificações: aprovado.
Build e ESLint: aprovados.
Conferência visual e navegação manual no navegador: ainda pendentes.

npm run test:conta verifica o servidor de contas e a leitura pública das avaliações.

10. ORGANIZAÇÃO DA ENTREGA

Como executar:
1. Instalar Node.js compatível com o package.json.
2. Executar npm install.
3. Executar npm run api: JSON Server com as rotas de conta na porta 3000.
4. Em outro terminal, executar npm run dev: Vue na porta 5173.
5. Alternativa: npm run dev:all inicia os dois.
6. Abrir http://localhost:5173/admin/livros.
7. npm run build gera a aplicação; npm run lint verifica o código.

Estrutura:
src/views/*.vue — páginas e operações HTTP.
src/components/*.vue — formulários, confirmação, estados e catálogo.
src/components/layout/*.vue — cabeçalhos, rodapé e área administrativa.
Os estilos ficam em blocos style dentro dos componentes Vue.
src/utils/api.js — URL, leitura das respostas e mensagens.
src/utils/livrosUtils.js — gêneros, normalização de texto e slug.
src/utils/cartUtils.js — estado e pequenas alterações do carrinho local.
src/utils/favoritos.js — favoritos locais.
src/utils/produtosUtils.js — formatação de moeda.
src/main.js, src/router/index.js e src/plugins/vuetify.js — configuração.
db.json — usuarios, livros, pedidos e avaliacoes.
server.cjs e src/services/ — rotas e serviços de conta. Veja README-conta.md.

Dados fictícios atuais: 5 usuários, 16 livros, 4 pedidos e 5 avaliações.
Sombra e Ossos tem pedido; Divergente tem avaliação e não tem pedido;
Jogos Vorazes está sem estoque; Cidade dos ossos está inativo.

Divisão dos CRUDs completos:
Igor Gabriel Decker — Livros.
Vilmar Michels Filho — Usuários.
Davi Augusto Ramos — Pedidos e seus itens.
Vitor — Avaliações; confirmar o nome completo antes da entrega.
