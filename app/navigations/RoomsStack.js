import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Rooms from "../screens/Rooms/Rooms";
import AddRoom from "../screens/Rooms/AddRoom";
import CreateRoom from "../screens/Rooms/CreateRoom";
import Room from "../screens/Rooms/Room";
import JoinRoom from "../screens/Rooms/JoinRoom";
import AddTarea from "../screens/Rooms/AddTarea";
import UserRooms from "../screens/Rooms/UserRooms";

const Stack = createStackNavigator();

export default function RoomsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="rooms"
        component={Rooms}
        options={{ title: "Mis Salones" }}
      />
      <Stack.Screen
        name="add-room"
        component={AddRoom}
        options={{ title: "Unirse a un salon" }}
      />
      <Stack.Screen
        name="add-room-form"
        component={CreateRoom}
        options={{ title: "Crear un salon" }}
      />
      <Stack.Screen
        name="join-room"
        component={JoinRoom}
        options={{ title: "Unirse al salón" }}
      />
      <Stack.Screen
        name="add-tarea"
        component={AddTarea}
        options={{ title: "Crear nueva tarea" }}
      />
      <Stack.Screen
        name="user-rooms"
        component={UserRooms}
        options={{ title: "Administrar mis salones" }}
      />
      <Stack.Screen name="room" component={Room} />
    </Stack.Navigator>
  );
}
