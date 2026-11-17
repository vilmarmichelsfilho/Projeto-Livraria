export async function buscarCep(cep, { signal, fetcher = fetch } = {}) {
  if (!/^[0-9]{8}$/.test(cep)) {
    throw new Error('Informe um CEP com 8 dígitos.');
  }
  const response = await fetcher('https://viacep.com.br/ws/' + cep + '/json/', {
    signal,
  });
  if (!response.ok) {
    throw new Error(
      'Não foi possível consultar o CEP. Preencha o endereço manualmente.',
    );
  }
  const data = await response.json();
  if (data.erro) {
    throw new Error(
      'CEP não encontrado. Confira o número ou preencha o endereço manualmente.',
    );
  }
  if (!data.localidade || !data.uf) {
    throw new Error(
      'O serviço não retornou cidade e UF. Preencha os dados manualmente.',
    );
  }
  const bairro = (data.bairro || '').trim();
  const rua = (data.logradouro || '').trim();
  return {
    cidade: data.localidade,
    uf: data.uf,
    endereco: bairro ? bairro + ',' + (rua ? ' ' + rua : '') : rua,
  };
}
