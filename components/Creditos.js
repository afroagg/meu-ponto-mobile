import { Text, StyleSheet } from "react-native";
import cores from "../cores";

export default function Creditos() {
  return (
    <Text style={styles.creditos}>
      Dados de ônibus: SPTrans (API Olho Vivo). Localização do usuário via GPS do celular.
    </Text>
  );
}

const styles = StyleSheet.create({
  creditos: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    fontSize: 12,
    color: cores.textoClaro,
  },
});
