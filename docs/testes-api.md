# Testes de infraestrutura da API

Executados em 09/11/2026, 18:36:56, horário de São Paulo. JSON Server 0.17.4.

## Ambiente e limites

O comando npm run api foi iniciado na raiz do projeto. Os quatro endpoints em http://127.0.0.1:3000 responderam 200 e apresentaram as quantidades do seed: quatro usuários, 16 livros, quatro pedidos e cinco itens.

As operações de escrita foram verificadas em uma cópia temporária de db.json usando o mesmo executável do JSON Server, em outra porta local. O db.json principal permaneceu idêntico ao original. Os testes não implementam nem comprovam os CRUDs das telas.

## Códigos realmente observados

| Coleção | GET lista | GET por ID | POST | PATCH | PUT | DELETE | GET após excluir |
| --- | --- | --- | --- | --- | --- | --- | --- |
| usuarios | 200 | 200 | 201 | 200 | 200 | 200 | 404 |
| livros | 200 | 200 | 201 | 200 | 200 | 200 | 404 |
| pedidos | 200 | 200 | 201 | 200 | 200 | 200 | 404 |
| itens_pedido | 200 | 200 | 201 | 200 | 200 | 200 | 404 |

POST gerou novos IDs sem identificador fixo no corpo. Depois de PATCH e PUT, uma nova consulta confirmou os valores persistidos. A exclusão foi feita na ordem itens, pedidos, livros e usuários; a consulta seguinte retornou 404.

POST com JSON sintaticamente malformado retornou 400. Isso testa a leitura do corpo JSON, não a validação de campos de negócio. Não foi provocado erro 500. Não houve resposta 204 nos fluxos verificados desta versão.

## Dados e filtros

Foram verificados IDs únicos, referências existentes entre as quatro coleções, ausência de livro duplicado no mesmo pedido e totais compatíveis com quantidade × preço unitário. Os filtros por id_usuario e id_pedido retornaram somente os registros vinculados.

## O que cada integrante ainda deve testar

Validar os próprios formulários; integrar os cinco métodos; verificar carregamento, lista vazia, sucesso, erro de conexão, 404 e cancelamento da exclusão; conferir regras de relacionamento, status e estoque. Registrar nome, data e commits reais no documento da entidade.

## Verificação da aplicação existente

O comando npm run build concluiu com sucesso. Os novos arquivos Vue e JavaScript permanecem apenas com comentários, sem imports ou rotas novas, conforme o escopo solicitado.

A compilação foi conferida novamente após atualizar as dependências, com Vite 8.1.6, usando uma pasta temporária para preservar os arquivos de publicação existentes.

## Dependências

JSON Server 0.17.4 e Axios estão instalados. Foram aplicadas atualizações compatíveis com as versões principais do projeto. A auditoria final apontou zero ocorrências altas ou críticas e quatro moderadas na cadeia ESLint / minimatch. A correção automática restante propõe trocar o ESLint 10 pelo 9; essa mudança de versão principal não foi aplicada nesta preparação.
