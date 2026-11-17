import {useEffect} from "react";
import {Platform} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import ListaScreen from "./screens/ListaScreen";
import DetalheScreen from "./screens/DetalheScreen";
import cores from "./cores";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Avisos de ônibus",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: cores.verde},
          headerTintColor: "#fff",
          headerTitleStyle: {fontWeight: "bold"},
        }}
      >
        <Stack.Screen name="Lista" component={ListaScreen} options={{title: "Meu ponto"}} />
        <Stack.Screen name="Detalhe" component={DetalheScreen} options={{title: "Próximos ônibus"}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}