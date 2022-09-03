import React, { useEffect, useState, useCallback, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";
import Carousel from "../../components/Carousel";
import ListComents from "../../components/Foros/ListComents";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);
const screenWidth = Dimensions.get("window").width;

export default function Foro(props) {
  const { navigation, route } = props;
  const { id, name } = route.params;
  const [foro, setForo] = useState(null);
  const [userLogged, setUserLogged] = useState(false);
  const toastRef = useRef();

  useEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useFocusEffect(
    useCallback(() => {
      db.collection("foros")
        .doc(id)
        .get()
        .then((response) => {
          const data = response.data();
          data.id = response.id;
          setForo(data);
        });
    }, [])
  );

  if (!foro) return <Loading isVisible={true} text="Cargando..." />;
  return (
    <ScrollView vertical style={styles.viewBody}>
      <Carousel arrayImages={foro.images} height={350} width={screenWidth} />
      <TitleForo
        name={foro.name}
        materia={foro.materia}
        description={foro.description}
      />
      <ListComents navigation={navigation} idForo={foro.id} />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

function TitleForo(props) {
  const { name, materia, description } = props;
  return (
    <View style={styles.viewForoTitle}>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.nameForo}>{name}</Text>
        <Text style={styles.materiaForo}>{materia}</Text>
      </View>
      <Text style={styles.descriptionForo}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  viewForoTitle: {
    padding: 15,
  },
  nameForo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  materiaForo: {
    position: "absolute",
    right: 0,
  },
  descriptionForo: {
    marginTop: 5,
    color: "grey",
  },
  viewForoInfo: {
    margin: 15,
    marginTop: 25,
  },
  foroInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1,
  },
});
