import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";

import AccountStack from "./AccountStack";
import ForoStack from "./ForoStack";
import RoomsStack from "./RoomsStack";
import TareasStack from "./TareasStack";
import SearchStack from "./SearchStack";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="account"
        tabBarOptions={{
          inactiveTintColor: "#646464",
          activeTintColor: "#3498DB",
        }}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color }) => screenOptions(route, color),
        })}
      >
        <Tab.Screen
          name="foros"
          component={ForoStack}
          options={{ title: "Foros" }}
        />
        <Tab.Screen
          name="rooms"
          component={RoomsStack}
          options={{ title: "Mis Salones" }}
        />
        <Tab.Screen
          name="tareas"
          component={TareasStack}
          options={{ title: "Mis Tareas" }}
        />
        <Tab.Screen
          name="search"
          component={SearchStack}
          options={{ title: "Buscar" }}
        />
        <Tab.Screen
          name="account"
          component={AccountStack}
          options={{ title: "Mi Cuenta" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function screenOptions(route, color) {
  let iconName;

  switch (route.name) {
    case "foros":
      iconName = "forum-outline";
      break;
    case "rooms":
      iconName = "book-outline";
      break;
    case "tareas":
      iconName = "lead-pencil";
      break;
    case "search":
      iconName = "magnify";
      break;
    case "account":
      iconName = "account-circle-outline";
      break;
    default:
      break;
  }
  return (
    <Icon type="material-community" name={iconName} size={22} color={color} />
  );
}
