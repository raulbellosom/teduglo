import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function Tareas(props) {
  const { navigation } = props;
  const [tareas, setTareas] = useState(null);
  const [userLogged, setUserLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const toastRef = useRef();

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useFocusEffect(
    useCallback(() => {
      if (userLogged) {
        const idUser = firebase.auth().currentUser.uid;
        db.collection("favorites")
          .where("idUser", "==", idUser)
          .get()
          .then((response) => {
            const idTareasArray = [];
            response.forEach((doc) => {
              idTareasArray.push(doc.data().idTarea);
            });
            getDataTarea(idTareasArray).then((response) => {
              const tareasArray = [];
              response.forEach((doc) => {
                const tarea = doc.data();
                tarea.id = doc.id;
                tareasArray.push(tarea);
              });
              setTareas(tareasArray);
            });
          });
      }
      setReloadData(false);
    }, [userLogged, reloadData])
  );

  const getDataTarea = (idTareasArray) => {
    const arrayTareas = [];
    idTareasArray.forEach((idTarea) => {
      const result = db.collection("tareas").doc(idTarea).get();
      arrayTareas.push(result);
    });
    return Promise.all(arrayTareas);
  };

  if (!userLogged) {
    return <UserNoLogged navigation={navigation} />;
  }

  if (tareas?.length === 0) {
    return <NotFoundTareas />;
  }

  return (
    <View style={styles.viewBody}>
      {tareas ? (
        <FlatList
          data={tareas}
          renderItem={(tarea) => (
            <Tarea
              tarea={tarea}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              setReloadData={setReloadData}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderRestaurants}>
          <ActivityIndicator size="large" />
          <Text style={{ textAlign: "center" }}>Cargando recordatorios</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text="Eliminando recordatorio" isVisible={isLoading} />
    </View>
  );
}

function NotFoundTareas() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Icon type="material-community" name="alert-circle-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        No tienes tareas agregadas a tus recordatorios
      </Text>
    </View>
  );
}

function UserNoLogged(props) {
  const { navigation } = props;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Necesitas estar logeado para ver esta sección
      </Text>
      <Button
        title="Ir al login"
        containerStyle={{ marginTop: 20, width: "80%" }}
        buttonStyle={{ backgroundColor: "#3498DB" }}
        onPress={() => navigation.navigate("account", { screen: "login" })}
      />
    </View>
  );
}

function Tarea(props) {
  const { tarea, setIsLoading, toastRef, setReloadData, navigation } = props;
  const {
    id,
    tareaName,
    images,
    fechaEntrega,
    description,
    materia,
  } = tarea.item;

  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Eliminar tarea de recordatorios",
      "¿Estas seguro de que quieres eliminar el recordatorio?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: removeFavorite,
        },
      ],
      { cancelable: false }
    );
  };

  const removeFavorite = () => {
    setIsLoading(true);
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
              setIsLoading(false);
              setReloadData(true);
              toastRef.current.show("Recordatorio eliminado correctamente");
            })
            .catch(() => {
              setIsLoading(false);
              toastRef.current.show("Error al eliminar el recordatorio");
            });
        });
      });
  };

  return (
    <View style={styles.restaurant}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("tareas", {
            screen: "tarea",
            params: { id, tareaName },
          })
        }
      >
        <Image
          resizeMode="cover"
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
          source={
            images[0]
              ? { uri: images[0] }
              : require("../../../assets/img/no-image.png")
          }
        />
        <View style={styles.info}>
          <Text style={styles.name}>{tareaName.substr(0, 25)}</Text>
          <Icon
            type="material-community"
            name="heart"
            color="#f00"
            containerStyle={styles.favorite}
            onPress={confirmRemoveFavorite}
            underlayColor="transparent"
          />
        </View>
        <View style={{ backgroundColor: "#fff" }}>
          <Text style={styles.infos}>Materia: {materia}</Text>
          <Text style={styles.infos}>
            Descripción: {description.substr(0, 40)}...
          </Text>
          <Text style={styles.infos}>Fecha de entrega: {fechaEntrega}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loaderRestaurants: {
    marginTop: 10,
    marginBottom: 10,
  },
  restaurant: {
    margin: 10,
  },
  infos: {
    color: "grey",
    marginBottom: 5,
    paddingLeft: 20,
  },
  image: {
    width: "100%",
    height: 150,
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    marginTop: -30,
    backgroundColor: "#fff",
  },
  name: {
    fontWeight: "bold",
    fontSize: 20,
  },
  favorite: {
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
  },
});
