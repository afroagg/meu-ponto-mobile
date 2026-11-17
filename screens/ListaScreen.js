import {useState, useEffect} from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import {buscarPontos} from "../services/api";
import {distanciaMetros, textoDistancia, limparRua} from "../services/util";
import Creditos from "../components/Creditos";
import cores from "../cores";

const DISTANCIA_MAXIMA = 2000;

export default function ListaScreen({navigation}) {
  const [pontos, setPontos] = useState([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    buscarPorGps();
  }, []);

  function organizar(lista, local) {
    lista.forEach((p) => {
      if (local) {
        p.distancia = distanciaMetros(local.latitude, local.longitude, p.py, p.px);
      } else {
        p.distancia = null;
      }
    });
    if (local) {
      lista.sort((a, b) => a.distancia - b.distancia);
    }
    return lista.slice(0, 15);
  }

  async function buscarPorGps() {
    setCarregando(true);
    setMensagem("");

    const permissao = await Location.requestForegroundPermissionsAsync();
    if (permissao.status !== "granted") {
      setMensagem("Sem permissão de localização. Libere o GPS nas configurações do celular ou busque pelo nome da rua.");
      setCarregando(false);
      return;
    }

    try {
      const posicao = await Location.getCurrentPositionAsync({});
      const local = {
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      };
      setUsuario(local);

      const enderecos = await Location.reverseGeocodeAsync(local);
      const rua = enderecos.length > 0 ? enderecos[0].street : null;
      if (!rua) {
        setMensagem("Não consegui descobrir em qual rua você está. Busque pelo nome da rua.");
        setCarregando(false);
        return;
      }

      const nome = limparRua(rua);
      let lista = await buscarPontos(nome);
      if (lista.length === 0) {
        const palavras = nome.split(" ");
        lista = await buscarPontos(palavras[palavras.length - 1]);
      }

      const ordenados = organizar(lista, local);
      if (ordenados.length === 0) {
        setMensagem("Nenhum ponto da SPTrans encontrado perto de " + rua + ". A API cobre só a cidade de São Paulo. Busque pelo nome de uma rua de lá.");
        setPontos([]);
      } else if (ordenados[0].distancia > DISTANCIA_MAXIMA) {
        setMensagem("Nenhum ponto da SPTrans perto de você (o mais próximo está a " + textoDistancia(ordenados[0].distancia) + "). A API cobre só a cidade de São Paulo.");
        setPontos([]);
      } else {
        setMensagem("Pontos perto de " + rua);
        setPontos(ordenados);
      }
    } catch (erro) {
      setMensagem("Erro: " + erro.message);
    }
    setCarregando(false);
  }

  async function buscarPorNome() {
    if (busca.trim().length < 3) {
      setMensagem("Digite pelo menos 3 letras.");
      return;
    }

    setCarregando(true);
    setMensagem("");
    try {
      const lista = await buscarPontos(busca.trim());
      if (lista.length === 0) {
        setMensagem("Nenhum ponto encontrado para \"" + busca.trim() + "\".");
      }
      setPontos(organizar(lista, usuario));
    } catch (erro) {
      setMensagem("Erro: " + erro.message);
    }
    setCarregando(false);
  }

  function mostrarPonto({item}) {
    return (
      <TouchableOpacity style={styles.ponto} onPress={() => navigation.navigate("Detalhe", {ponto: item})}>
        <View style={styles.pontoTexto}>
          <Text style={styles.nome}>{item.np}</Text>
          <Text style={styles.endereco}>{item.ed}</Text>
        </View>
        {item.distancia !== null && (
          <Text style={styles.distancia}>{textoDistancia(item.distancia)}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.busca}>
        <TextInput
          style={styles.campo}
          placeholder="Rua ou ponto (ex: Paulista)"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={buscarPorNome}
        />
        <TouchableOpacity style={styles.botao} onPress={buscarPorNome}>
          <Text style={styles.botaoTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoGps} onPress={buscarPorGps}>
        <Text style={styles.botaoGpsTexto}>Usar minha localização</Text>
      </TouchableOpacity>

      {mensagem !== "" && <Text style={styles.mensagem}>{mensagem}</Text>}
      {carregando && <ActivityIndicator size="large" color={cores.verde} style={styles.carregando} />}

      <FlatList
        data={pontos}
        keyExtractor={(item) => String(item.cp)}
        renderItem={mostrarPonto}
        ListFooterComponent={<Creditos />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: "#fff"},
  busca: {flexDirection: "row", gap: 8},
  campo: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
  },
  botao: {
    backgroundColor: cores.verde,
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  botaoTexto: {color: "#fff", fontWeight: "bold", fontSize: 16},
  botaoGps: {
    marginTop: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.verde,
    alignItems: "center",
  },
  botaoGpsTexto: {color: cores.verdeEscuro, fontWeight: "bold", fontSize: 16},
  mensagem: {
    marginTop: 12,
    padding: 10,
    backgroundColor: cores.verdeClaro,
    borderRadius: 8,
    color: cores.texto,
  },
  carregando: {marginVertical: 12},
  ponto: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  pontoTexto: {flex: 1},
  nome: {fontSize: 16, fontWeight: "bold", color: cores.texto},
  endereco: {fontSize: 13, color: cores.textoClaro},
  distancia: {fontSize: 16, fontWeight: "bold", color: cores.verdeEscuro, marginLeft: 8},
});