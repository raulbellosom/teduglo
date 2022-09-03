import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function ListTareas(props) {
  const { navigation } = props;
  const [rooms, setRooms] = useState(null);
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
        db.collection("myRooms")
          .where("idUser", "==", idUser)
          .get()
          .then((response) => {
            const idRoomsArray = [];
            response.forEach((doc) => {
              idRoomsArray.push(doc.data().idRoom);
            });
            getDataRoom(idRoomsArray).then((response) => {
              const rooms = [];
              response.forEach((doc) => {
                const room = doc.data();
                room.id = doc.id;
                rooms.push(room);
              });
              setRooms(rooms);
            });
          });
      }
      setReloadData(false);
    }, [userLogged, reloadData])
  );

  const getDataRoom = (idRoomsArray) => {
    const arrayRooms = [];
    idRoomsArray.forEach((idRoom) => {
      const result = db.collection("rooms").doc(idRoom).get();
      arrayRooms.push(result);
    });
    return Promise.all(arrayRooms);
  };

  if (!userLogged) {
    return <UserNoLogged navigation={navigation} />;
  }

  if (rooms?.length === 0) {
    return (
      <View>
        <Menu navigation={navigation} />
        <NotFoundRooms />
      </View>
    );
  }
  return (
    <View style={styles.viewBody}>
      <Menu navigation={navigation} />
      {rooms ? (
        <FlatList
          data={rooms}
          renderItem={(room) => (
            <Room
              room={room}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              setReloadData={setReloadData}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderRooms}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={{ textAlign: "center" }}>Cargando salones</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
}

function Menu(props) {
  const { navigation } = props;

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        flexDirection: "row",
        width: "100%",
      }}
    >
      <Button
        buttonStyle={{
          height: 50,
          backgroundColor: "#3498DB",
          alignSelf: "center",
          marginTop: 7,
        }}
        icon={{
          type: "material-community",
          name: "plus",
          color: "#fff",
          size: 35,
        }}
        title={"Crear un nuevo salón"}
        titleStyle={{ color: "#fff" }}
        onPress={() => navigation.navigate("add-room-form")}
      />
      <Button
        buttonStyle={{
          height: 50,
          backgroundColor: "#3498DB",
          alignSelf: "center",
          marginBottom: 7,
          marginTop: 7,
        }}
        icon={{
          type: "material-community",
          name: "book-plus",
          color: "#fff",
          size: 35,
        }}
        title={"Unirse a un salón"}
        titleStyle={{ color: "#fff" }}
        onPress={() => navigation.navigate("add-room")}
      />
    </View>
  );
}

function NotFoundRooms() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
      }}
    >
      <Icon
        type="material-community"
        name="alert-circle-outline"
        size={50}
        color="#f00"
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#f00",
          paddingTop: 30,
        }}
      >
        No tienes salones en tu lista
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

function Room(props) {
  const { room, setIsLoading, toastRef, setReloadData, navigation } = props;
  const { id, name, images, materia, clave, createBy } = room.item;

  const goRoom = () => {
    navigation.navigate("room", {
      id,
      name,
    });
  };

  return (
    <TouchableOpacity onPress={goRoom}>
      <View style={styles.viewRoom}>
        <View style={styles.viewRoomImage}>
          <Image
            resizeMode="cover"
            PlaceholderContent={<ActivityIndicator color="#fff" />}
            source={
              images[0]
                ? { uri: images[0] }
                : require("../../../assets/img/no-image.png")
            }
            style={styles.imageRoom}
          />
        </View>
        <View>
          <Text style={styles.roomName}>{name}</Text>
          <Text style={styles.roomMateria}>{materia}</Text>
          <Text style={styles.roomClave}>{clave}</Text>
          <Text style={styles.roomClave}>{createBy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  loaderRooms: {
    marginTop: 10,
    marginBottom: 10,
  },
  viewRoom: {
    height: 90,
    flexDirection: "row",
    margin: 10,
    marginBottom: 0,
    backgroundColor: "#fff",
  },
  viewRoomImage: {
    marginRight: 15,
    marginBottom: 5,
  },
  imageRoom: {
    width: 90,
    height: 90,
  },
  roomName: {
    paddingTop: 2,
    fontWeight: "bold",
  },
  roomMateria: {
    paddingTop: 2,
    color: "grey",
  },
  roomClave: {
    paddingTop: 2,
    color: "grey",
  },
});
