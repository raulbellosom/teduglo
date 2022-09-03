import React from "react";
import { LogBox, YellowBox } from "react-native";
import { firebaseApp } from "./app/utils/firebase";
import Navigation from "./app/navigations/Navigation";
import { ListItem } from "react-native-elements";

//YellowBox.ignoreWarnings(["ListItem"], ["YellowBox"]);
LogBox.ignoreLogs(["Setting a time"], ["YellowBox"]);
LogBox.ignoreAllLogs();

export default function App() {
  return <Navigation />;
}
