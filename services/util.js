export function distanciaMetros(lat1, lon1, lat2, lon2) {
  const raio = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(raio * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function textoDistancia(metros) {
  if (metros < 1000) {
    return metros + " m";
  }
  return (metros / 1000).toFixed(1).replace(".", ",") + " km";
}

export function limparRua(rua) {
  const prefixos = ["avenida", "rua", "alameda", "travessa", "praça", "largo", "estrada", "viaduto"];
  const palavras = rua.split(" ");
  if (palavras.length > 1 && prefixos.includes(palavras[0].toLowerCase())) {
    palavras.shift();
  }
  return palavras.join(" ");
}

function paraMinutos(hora) {
  const partes = hora.split(":");
  return Number(partes[0]) * 60 + Number(partes[1]);
}

export function minutosAte(chegada, agora) {
  return (paraMinutos(chegada) - paraMinutos(agora) + 1440) % 1440;
}

export function textoMinutos(minutos) {
  if (minutos <= 1) {
    return "Chegando";
  }
  return minutos + " min";
}