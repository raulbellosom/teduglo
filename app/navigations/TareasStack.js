import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Tareas from "../screens/Tareas/Tareas";
import CreateTarea from "../screens/Tareas/CreateTarea";
import Tarea from "../screens/Tareas/Tarea";
import AddTarea from "../screens/Tareas/AddTarea";

const Stack = createStackNavigator();

export default function TareasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="tareas"
        component={Tareas}
        options={{ title: "Mis Tareas" }}
      />
      <Stack.Screen
        name="create-tarea"
        component={CreateTarea}
        options={{ title: "Crear nueva tarea" }}
      />
      <Stack.Screen name="tarea" component={Tarea} />
      <Stack.Screen
        name="add-tarea"
        component={AddTarea}
        options={{ title: "Añadir entrega de tarea" }}
      />
    </Stack.Navigator>
  );
}
