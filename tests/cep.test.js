import { test } from "node:test";
import assert from "node:assert/strict";
import { buscarCep } from "../src/services/cepService.js";
const mock = (data) => async (url) => {
  assert.equal(url, "https://viacep.com.br/ws/01001000/json/");
  return { ok: true, json: async () => data };
};
test("preenche cidade, UF e endereço com bairro antes da rua", async () => {
  assert.deepEqual(
    await buscarCep("01001000", {
      fetcher: mock({
        bairro: "Sé",
        logradouro: "Praça da Sé",
        localidade: "São Paulo",
        uf: "SP",
      }),
    }),
    { cidade: "São Paulo", uf: "SP", endereco: "Sé, Praça da Sé" },
  );
});
test("sem rua mantém bairro seguido de vírgula", async () => {
  assert.equal(
    (
      await buscarCep("01001000", {
        fetcher: mock({
          bairro: "Centro",
          logradouro: "",
          localidade: "Joinville",
          uf: "SC",
        }),
      })
    ).endereco,
    "Centro,",
  );
});
test("sem bairro utiliza rua sem vírgula inicial", async () => {
  assert.equal(
    (
      await buscarCep("01001000", {
        fetcher: mock({
          logradouro: "Rua A",
          localidade: "Joinville",
          uf: "SC",
        }),
      })
    ).endereco,
    "Rua A",
  );
});
test("CEP inexistente retorna mensagem e formato inválido não consulta API", async () => {
  await assert.rejects(
    buscarCep("01001000", { fetcher: mock({ erro: true }) }),
    /CEP não encontrado/,
  );
  await assert.rejects(
    buscarCep("123", { fetcher: () => assert.fail("não deve consultar") }),
    /8 dígitos/,
  );
});
test("falha HTTP e resposta incompleta permitem preenchimento manual", async () => {
  await assert.rejects(
    buscarCep("01001000", { fetcher: async () => ({ ok: false }) }),
    /manualmente/,
  );
  await assert.rejects(
    buscarCep("01001000", { fetcher: mock({}) }),
    /manualmente/,
  );
});
