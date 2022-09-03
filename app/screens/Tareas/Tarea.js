import React, { useEffect, useState, useCallback, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";
import Carousel from "../../components/Carousel";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);
const screenWidth = Dimensions.get("window").width;

export default function Tarea(props) {
  const { navigation, route } = props;
  const { id, tareaName } = route.params;
  const [tarea, setTarea] = useState(null);
  const [userLogged, setUserLogged] = useState(false);
  const [tareaEnviada, setTareaEnviada] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const toastRef = useRef();

  useEffect(() => {
    navigation.setOptions({ title: tareaName });
  }, []);

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });
  useEffect(() => {
    if (userLogged && id) {
      db.collection("favorites")
        .where("idTareas", "==", id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then((response) => {
          if (response.docs.length === 1) {
            setIsFavorite(true);
          }
        });
    }
  }, [userLogged, id]);

  useFocusEffect(
    useCallback(() => {
      if (userLogged && id) {
        db.collection("tareasAlumno")
          .where("idRoom", "==", id)
          .where("idUser", "==", firebase.auth().currentUser.uid)
          .get()
          .then(() => {
            setTareaEnviada(true);
          });
      }
    }, [userLogged, id])
  );

  useFocusEffect(
    useCallback(() => {
      db.collection("tareas")
        .doc(id)
        .get()
        .then((response) => {
          const data = response.data();
          data.id = response.id;
          setTarea(data);
        });
    }, [])
  );

  const addFavorite = () => {
    if (!userLogged) {
      toastRef.current.show(
        "Para usar el sistema de favoritos tienes que estar logeado"
      );
    } else {
      const payload = {
        idUser: firebase.auth().currentUser.uid,
        idTarea: id,
      };
      db.collection("favorites")
        .add(payload)
        .then(() => {
          setIsFavorite(true);
          toastRef.current.show("Se ha añadido recordatorio");
        })
        .catch(() => {
          toastRef.current.show("Error al añadir la tarea a recordatorios");
        });
    }
  };
  const removeFavorite = () => {
    db.collection("favorites")
      .where("idTarea", "==", id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsFavorite(false);
              toastRef.current.show("Tarea eliminada de recordatorios");
            })
            .catch(() => {
              toastRef.current.show("Error al eliminar el recordatorio");
            });
        });
      });
  };

  if (!tarea) return <Loading isVisible={true} text="Cargando..." />;
  return (
    <ScrollView vertical style={styles.viewBody}>
      <Carousel arrayImages={tarea.images} height={350} width={screenWidth} />
      <TitleTarea
        tareaName={tarea.tareaName}
        materia={tarea.materia}
        description={tarea.description}
        fecha={tarea.fechaEntrega}
        recursos={tarea.recursos}
      />
      {!tareaEnviada && (
        <Button
          title="Añadir Entrega"
          buttonStyle={{
            backgroundColor: "#f00",
            height: 50,
            width: "95%",
            alignSelf: "center",
          }}
          onPress={() =>
            navigation.navigate("add-tarea", {
              id: id,
            })
          }
        />
      )}
      {tareaEnviada && (
        <Text
          style={{
            alignSelf: "center",
            color: "#fff",
            fontSize: 20,
            backgroundColor: "#3498DB",
            padding: 10,
            borderRadius: 5,
          }}
        >
          ¡Tarea enviada con exito!
        </Text>
      )}
      <Button
        title={isFavorite ? "Eliminar recordatorio" : "Añadir recordatorio"}
        buttonStyle={{
          backgroundColor: "#f00",
          height: 50,
          width: "95%",
          alignSelf: "center",
        }}
        containerStyle={{ paddingTop: 10, paddingBottom: 10 }}
        icon={{
          type: "material-community",
          name: "heart-outline",
          color: "#fff",
        }}
        onPress={isFavorite ? removeFavorite : addFavorite}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

function TitleTarea(props) {
  const { tareaName, materia, description, fecha, recursos } = props;
  return (
    <View style={styles.viewTareaTitle}>
      <Text style={styles.nameTarea}>{tareaName}</Text>

      <Text style={styles.propsTarea}>Materia: </Text>
      <Text style={styles.materiaTarea}>{materia}</Text>

      <Text style={styles.propsTarea}>Descripción: </Text>
      <Text style={styles.descriptionTarea}>{description}</Text>

      <Text style={styles.propsTarea}>Recursos: </Text>
      <Text style={styles.descriptionTarea}>{recursos}</Text>

      <View style={{ flexDirection: "row" }}>
        <Text style={styles.propsTarea}>Fecha de entrega: </Text>
        <Text style={styles.fechaTarea}>{fecha}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  nameTarea: {
    fontSize: 20,
    fontWeight: "bold",
  },
  materiaTarea: {
    fontSize: 15,
    marginTop: 5,
    color: "#000",
  },
  descriptionTarea: {
    fontSize: 15,
    marginTop: 5,
    color: "#000",
    textAlign: "justify",
  },
  fechaTarea: {
    fontSize: 15,
    marginTop: 5,
    color: "red",
  },
  propsTarea: {
    fontSize: 15,
    marginTop: 5,
    color: "grey",
  },
  viewTareaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 15,
  },
});
