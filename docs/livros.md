# Documentação da entidade livros

## 1 Identificação

| Informação | Preenchimento |
| --- | --- |
| Projeto | IFLibrary / Projeto-Livraria |
| Turma e equipe | [Preencher turma] / [Preencher equipe] |
| Repositório | https://github.com/vilmarmichelsfilho/Projeto-Livraria |
| Entidade | livros |
| Responsável pelo CRUD completo | Integrante 2: [Preencher nome completo] |
| Versão e data | 1.0 / 09/11/2026 |
| Situação | API de teste configurada; integração da aplicação a implementar |

## 2 Finalidade da entidade

Representar o catálogo da livraria e as informações de preço, disponibilidade e estoque. O integrante responsável deverá documentar, implementar e demonstrar cadastro, listagem, consulta por ID, edição e exclusão.

## 3 Campos e regras

| Campo | Tipo no JSON | Obrigatório | Descrição ou regra |
| --- | --- | --- | --- |
| id | Número inteiro | Automático | PK; gerado pelo JSON Server. |
| endereco | Texto | Sim | Slug único do livro, compatível com a rota atual /livro/:endereco. |
| titulo | Texto | Sim | Título sem espaços vazios. |
| autor | Texto | Sim | Autor como atributo; não cria uma quinta entidade. |
| resenha | Texto | Sim | Descrição do livro; preserva o nome usado nas telas atuais. |
| preco | Número | Sim | Valor maior que zero; exibir em reais e arredondar cálculos a centavos. |
| capa | Texto ou nulo | Não | Caminho da imagem em public; usar imagem padrão quando ausente. |
| genero | Texto | Sim | Gênero usado no filtro do catálogo. |
| paginas | Número inteiro | Sim | Quantidade maior que zero. |
| estoque | Número inteiro | Sim | Quantidade disponível não negativa. |
| estoque_minimo | Número inteiro | Sim | Limite não negativo para o alerta; exemplo: 5. |
| ativo | Booleano | Sim | Livro inativo não deve aparecer no catálogo público. |
| criado_em | Texto em data ISO 8601 | Sim | Preenchida pela aplicação. |
| atualizado_em | Texto em data ISO 8601 | Sim | Atualizada a cada edição. |

O campo id é a PK reconhecida pelo JSON Server 0.17.4. Os nomes das FKs permanecem explícitos. Nos registros de teste, os IDs são números inteiros; nos novos cadastros, a API deve gerar o ID.

As regras desta tabela ainda deverão ser implementadas pela equipe. O JSON Server não valida automaticamente obrigatoriedade, unicidade, perfis ou integridade dos relacionamentos.

## 4 Endpoints

URL base: http://localhost:3000. Coleção no db.json: livros. Substituir :id por um identificador real.

| Método | Endpoint | Funcionalidade | Resposta prevista |
| --- | --- | --- | --- |
| GET | /livros | Listar e apresentar lista vazia, carregamento e falha. | 200 |
| GET | /livros/:id | Consultar um registro e tratar ausência. | 200 ou 404 |
| POST | /livros | Cadastrar sem enviar um id fixo. | 201 |
| PATCH | /livros/:id | Atualizar somente os campos enviados. | 200; observado no teste da API |
| PUT | /livros/:id | Alternativa: substituir todos os campos editáveis. | 200; observado no teste da API |
| DELETE | /livros/:id | Excluir após confirmação e verificação dos vínculos. | 200; observado no teste da API |

A integração planejada usará PATCH, pois os formulários poderão enviar somente campos alterados. Cada responsável pode optar por PUT, registrando a justificativa e enviando os campos editáveis completos.

## 5 Corpo das requisições

Em POST, enviar um objeto JSON com os campos obrigatórios da tabela e sem id fixo. Usar Content-Type: application/json. Os registros do db.json são exemplos de conteúdo, mas seus IDs não devem ser copiados para um novo cadastro.

Em PATCH, enviar somente os campos alterados, por exemplo: preco e estoque. Não enviar o id como campo editável. Em PUT, enviar todos os campos editáveis que devem permanecer no registro; campos omitidos podem ser removidos. GET e DELETE não precisam de corpo neste CRUD.

## 6 Relacionamentos

Um livro aparece em vários itens de pedido. Consultar /itens_pedido?id_livro=:id antes de excluir. Com histórico vinculado, planejar inativação.

Os filtros por FK serão explícitos; não depender de _embed ou _expand, pois os nomes id_usuario, id_pedido e id_livro não seguem a convenção automática usuarioId/pedidoId/livroId. A existência de uma FK no JSON não cria restrição automática nem exclusão em cascata.

## 7 Telas e comportamento esperado

Home, filtro por gênero, detalhes do livro e administração de livros.

| Tela ou ação | O que implementar |
| --- | --- |
| Listagem | Buscar os registros, exibir carregamento, estado vazio e mensagem de erro. |
| Cadastro | Validar os campos, impedir envio duplicado e realizar POST. |
| Detalhes | Usar GET por ID e tratar 404. |
| Edição | Consultar por ID, preencher o formulário, validar e realizar PATCH ou PUT. |
| Exclusão | Pedir confirmação, verificar os vínculos e só então enviar DELETE. |

Após uma alteração, atualizar a listagem ou os dados exibidos. Mostrar sucesso somente depois de conferir a resposta da API. Cancelar a confirmação não pode enviar DELETE. Uma resposta 204 não deve ser interpretada como JSON.

## 8 Códigos de resposta

200 significa sucesso; 201 significa recurso criado; 404 significa recurso inexistente. Registrar 400 ou 500 apenas se observados. O mock pode aceitar campos inválidos com resposta de sucesso: essa aceitação não comprova que as validações do sistema estão prontas.

Os códigos realmente observados nos testes de infraestrutura estão registrados em [testes-api.md](testes-api.md). Os testes das telas continuam pendentes.

## 9 Registro dos testes do integrante

| Operação | Teste a realizar | Código observado pelo integrante | Resultado |
| --- | --- | --- | --- |
| Cadastrar | Enviar dados válidos e guardar o ID retornado. | A preencher | Pendente |
| Listar | Conferir que o registro criado está presente. | A preencher | Pendente |
| Consultar ID | Consultar o ID criado e um inexistente. | A preencher | Pendente |
| Atualizar | Alterar e consultar novamente para confirmar persistência. | A preencher | Pendente |
| Excluir | Confirmar a exclusão e consultar novamente para verificar ausência. | A preencher | Pendente |

Responsável pelos testes: [Preencher nome]. Data: [Preencher]. Atualização escolhida: PATCH / PUT. Commits: [Preencher referências reais].

## 10 Organização da entrega

O responsável deve entregar o fluxo completo da entidade, do formulário à atualização da tela, e registrar seus próprios commits. Não dividir o CRUD por verbo HTTP. Atualizar esta documentação com as decisões e resultados reais durante o desenvolvimento.
