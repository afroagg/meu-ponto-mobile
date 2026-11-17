import {useState, useEffect} from "react";
import {
  View, Text, TouchableOpacity, FlatList, Alert, Vibration, Switch, StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";
import {buscarPrevisao} from "../services/api";
import {minutosAte, textoMinutos, textoDistancia} from "../services/util";
import Creditos from "../components/Creditos";
import cores from "../cores";

const MINUTOS_AVISO = 5;

export default function DetalheScreen({route}) {
  const {ponto} = route.params;
  const [linhas, setLinhas] = useState([]);
  const [hora, setHora] = useState("");
  const [mensagem, setMensagem] = useState("Carregando...");
  const [avisando, setAvisando] = useState(null);
  const [soAcessiveis, setSoAcessiveis] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (avisando === null) {
      return;
    }
    const linha = linhas.find((l) => l.letreiro === avisando);
    if (linha && linha.minutos <= MINUTOS_AVISO) {
      avisar(linha);
      setAvisando(null);
    }
  }, [linhas, avisando]);

  async function carregar() {
    try {
      const dados = await buscarPrevisao(ponto.cp);
      const lista = dados.p && dados.p.l ? dados.p.l : [];

      const resultado = lista
        .filter((linha) => linha.vs.length > 0)
        .map((linha) => {
          const tempos = linha.vs.map((v) => minutosAte(v.t, dados.hr));
          return {
            letreiro: linha.c,
            destino: linha.lt0,
            origem: linha.lt1,
            minutos: Math.min(...tempos),
            quantidade: linha.vs.length,
            acessivel: linha.vs.some((v) => v.a),
          };
        });
      resultado.sort((a, b) => a.minutos - b.minutos);

      setLinhas(resultado);
      setHora(dados.hr);
      setMensagem(resultado.length === 0 ? "Nenhum ônibus previsto para este ponto agora." : "");
    } catch (erro) {
      setMensagem("Erro: " + erro.message);
    }
  }

  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  async function ativarAviso(linha) {
    if (avisando === linha.letreiro) {
      setAvisando(null);
      return;
    }

    const permissao = await Notifications.requestPermissionsAsync();
    if (permissao.status !== "granted") {
      Alert.alert(
        "Notificações desativadas",
        "Você será avisado apenas com alerta e vibração enquanto o app estiver aberto."
      );
    }
    setAvisando(linha.letreiro);
  }

  async function avisar(linha) {
    const texto = "A linha " + linha.letreiro + " chega em " + textoMinutos(linha.minutos).toLowerCase() + " no ponto " + ponto.np + ".";
    Vibration.vibrate([0, 500, 200, 500]);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {title: "Seu ônibus está chegando", body: texto},
        trigger: null,
      });
    } catch (erro) {
      console.log(erro);
    }
    Alert.alert("Seu ônibus está chegando", texto);
  }

  function mostrarLinha({item}) {
    const ativo = avisando === item.letreiro;
    return (
      <View style={styles.linha}>
        <Text style={styles.letreiro}>{item.letreiro}</Text>
        <View style={styles.destino}>
          <Text style={styles.destinoNome}>{item.destino}</Text>
          <Text style={styles.origem}>saindo de {item.origem}</Text>
          {item.acessivel && <Text style={styles.acessivel}>♿ Acessível</Text>}
        </View>
        <View style={styles.tempo}>
          <Text style={[styles.minutos, item.minutos <= 1 && styles.chegando]}>
            {textoMinutos(item.minutos)}
          </Text>
          <TouchableOpacity
            style={[styles.botaoAviso, ativo && styles.botaoAvisoAtivo]}
            onPress={() => ativarAviso(item)}
          >
            <Text style={[styles.botaoAvisoTexto, ativo && styles.botaoAvisoTextoAtivo]}>
              {ativo ? "Avisando" : "Avisar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const lista = soAcessiveis ? linhas.filter((l) => l.acessivel) : linhas;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{ponto.np}</Text>
      <Text style={styles.endereco}>{ponto.ed}</Text>
      {ponto.distancia !== null && ponto.distancia !== undefined && (
        <Text style={styles.endereco}>Você está a {textoDistancia(ponto.distancia)} deste ponto</Text>
      )}
      {hora !== "" && <Text style={styles.endereco}>Atualizado às {hora} (a cada 30 segundos)</Text>}

      <Text style={styles.dica}>
        Toque em "Avisar" para receber uma notificação quando o ônibus estiver a {MINUTOS_AVISO} minutos do ponto.
      </Text>

      <View style={styles.filtro}>
        <Text style={styles.filtroTexto}>Só acessíveis</Text>
        <Switch value={soAcessiveis} onValueChange={setSoAcessiveis} />
      </View>

      {mensagem !== "" && <Text style={styles.mensagem}>{mensagem}</Text>}

      <FlatList
        data={lista}
        keyExtractor={(item) => item.letreiro}
        renderItem={mostrarLinha}
        refreshing={atualizando}
        onRefresh={atualizar}
        ListFooterComponent={<Creditos />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: "#fff"},
  titulo: {fontSize: 20, fontWeight: "bold", color: cores.texto},
  endereco: {fontSize: 13, color: cores.textoClaro},
  dica: {marginTop: 10, fontSize: 13, color: cores.textoClaro},
  filtro: {flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10},
  filtroTexto: {fontSize: 15, color: cores.texto},
  mensagem: {
    marginTop: 12,
    padding: 10,
    backgroundColor: cores.verdeClaro,
    borderRadius: 8,
    color: cores.texto,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  letreiro: {
    minWidth: 80,
    padding: 6,
    borderRadius: 8,
    backgroundColor: cores.verde,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  destino: {flex: 1},
  destinoNome: {fontWeight: "bold", color: cores.texto},
  origem: {fontSize: 12, color: cores.textoClaro},
  acessivel: {fontSize: 12, color: cores.verdeEscuro},
  tempo: {alignItems: "flex-end"},
  minutos: {fontSize: 18, fontWeight: "bold", color: cores.verdeEscuro},
  chegando: {color: cores.vermelho},
  botaoAviso: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.verde,
  },
  botaoAvisoAtivo: {backgroundColor: cores.verde},
  botaoAvisoTexto: {color: cores.verdeEscuro, fontWeight: "bold"},
  botaoAvisoTextoAtivo: {color: "#fff"},
});