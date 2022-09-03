import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Foros from "../screens/Foros/Foros";
import AddForo from "../screens/Foros/AddForo";
import Foro from "../screens/Foros/Foro";
import AddComent from "../screens/Foros/AddComent";

const Stack = createStackNavigator();

export default function ForoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="foros"
        component={Foros}
        options={{ title: "El Muro" }}
      />
      <Stack.Screen
        name="add-foro"
        component={AddForo}
        options={{ title: "Crear nuevo foro" }}
      />
      <Stack.Screen name="foro" component={Foro} />
      <Stack.Screen
        name="add-coment"
        component={AddComent}
        options={{ title: "Nuevo comentario" }}
      />
    </Stack.Navigator>
  );
}
