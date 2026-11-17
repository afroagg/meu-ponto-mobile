const API = "https://meu-ponto-jet.vercel.app/api/olhovivo";

async function chamarApi(rota, parametro, valor) {
  const url = API + "?rota=" + rota + "&" + parametro + "=" + encodeURIComponent(valor);
  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || "Erro ao consultar a SPTrans.");
  }
  return dados;
}

export function buscarPontos(termo) {
  return chamarApi("Parada/Buscar", "termosBusca", termo);
}

export function buscarPrevisao(codigoParada) {
  return chamarApi("Previsao/Parada", "codigoParada", codigoParada);
}