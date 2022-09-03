import React, { useEffect, useState, useCallback, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { Card, Avatar, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Loading from "../../components/Loading";
import Toast from "react-native-easy-toast";
import Modal from "../../components/Modal";
import JoinRoomForm from "../../components/Rooms/JoinRoomForm";
import DeleteRoom from "../../components/Rooms/DeleteRoom";
import TareaRoom from "../../components/Rooms/TareaRoom";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function Room(props) {
  const { navigation, route } = props;
  const { id, name } = route.params;
  const [userLogged, setUserLogged] = useState(false);
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [totalTareas, setTotalTareas] = useState(0);
  const [startTareas, setStartTareas] = useState(null);
  const [owner, setOwner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(null);
  const [join, setJoin] = useState(false);
  const limitTareas = 3;
  const toastRef = useRef();

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      db.collection("rooms")
        .doc(id)
        .get()
        .then((response) => {
          const data = response.data();
          data.id = response.id;
          setRooms(data);
        });
    }

    return () => (isMounted = false);
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (rooms.idUser == firebase.auth().currentUser.uid) {
        setOwner(true);
      }
    }
    return () => (isMounted = false);
  }, [rooms]);

  const addRoom = () => {
    setRenderComponent(
      <JoinRoomForm
        setShowModal={setShowModal}
        toastRef={toastRef}
        idRoom={id}
        setJoin={setJoin}
      />
    );
    setShowModal(true);
  };

  const removeRoom = () => {
    setRenderComponent(
      <DeleteRoom
        setShowModal={setShowModal}
        toastRef={toastRef}
        idRoom={id}
        setJoin={setJoin}
      />
    );
    setShowModal(true);
  };

  useEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userLogged && room) {
        db.collection("myRooms")
          .where("idRoom", "==", room.id)
          .where("idUser", "==", firebase.auth().currentUser.uid)
          .get()
          .then((response) => {
            if (response.docs.length === 1) {
              setJoin(true);
            }
          });
      }
    }, [userLogged, room])
  );

  useFocusEffect(
    useCallback(() => {
      db.collection("rooms")
        .doc(id)
        .get()
        .then((response) => {
          const data = response.data();
          data.id = response.id;
          setRoom(data);
        });
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      db.collection("tareas")
        .where("idRoom", "==", id)
        .get()
        .then((snap) => {
          setTotalTareas(snap.size);
        });

      const resultTareas = [];

      db.collection("tareas")
        .where("idRoom", "==", id)
        .limit(limitTareas)
        .get()
        .then((response) => {
          setStartTareas(response.docs[response.docs.length - 1]);

          response.forEach((doc) => {
            const tarea = doc.data();
            tarea.id = doc.id;
            resultTareas.push(tarea);
          });
          setTareas(resultTareas);
        });
    }, [id])
  );
  const handleLoadMore = () => {
    const resultTareas = [];
    tareas.length < totalTareas && setIsLoading(true);

    db.collection("tareas")
      .where("idRoom", "==", id)
      .orderBy("createAt", "desc")
      .startAfter(startTareas.data().createAt)
      .limit(limitTareas)
      .get()
      .then((response) => {
        if (response.docs.length > 0) {
          setStartTareas(response.docs[response.docs.length - 1]);
        } else {
          setIsLoading(false);
        }
        response.forEach((doc) => {
          const tarea = doc.data();
          tarea.id = doc.id;
          resultTareas.push(tarea);
        });
        setTareas([...tareas, ...resultTareas]);
      });
  };

  if (!room) return <Loading isVisible={true} text="Cargando..." />;
  return (
    <ScrollView style={{ flex: 1 }}>
      <RenderRoom room={room} />

      {owner && (
        <Button
          buttonStyle={{
            height: 50,
            width: "95%",
            backgroundColor: "#f00",
            alignSelf: "center",
            alignItems: "center",
          }}
          icon={{
            type: "material-community",
            name: "pencil-plus-outline",
            color: "#FFFF00",
          }}
          title={"Crear nueva tarea"}
          titleStyle={{ color: "#FFFF00" }}
          onPress={() =>
            navigation.navigate("add-tarea", { name: name, id: id })
          }
        />
      )}

      {join && (
        <View style={{ backgroundColor: "#fff", marginTop: 10 }}>
          <Text
            style={{
              alignSelf: "center",
              color: "#fff",
              fontSize: 20,
              backgroundColor: "#3498DB",
              padding: 5,
              margin: 10,
              borderRadius: 5,
            }}
          >
            Tareas
          </Text>
          <TareaRoom tareas={tareas} handleLoadMore={handleLoadMore} />
        </View>
      )}

      {!owner && (
        <Button
          buttonStyle={styles.btnAddDelete}
          icon={{
            type: "material-community",
            name: join ? "minus-circle-outline" : "plus-circle-outline",
            color: join ? "#f00" : "#3498DB",
          }}
          title={join ? "Abandonar este salón" : "Unirse a este salón"}
          titleStyle={{ color: join ? "#f00" : "#3498DB" }}
          onPress={join ? removeRoom : addRoom}
        />
      )}
      {renderComponent && (
        <Modal isVisible={showModal} setIsVisible={setShowModal}>
          {renderComponent}
        </Modal>
      )}

      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

function RenderRoom(props) {
  const { room } = props;

  return (
    <View style={styles.viewBody}>
      <Card containerStyle={styles.containerCard}>
        <Image
          style={styles.imageRoom}
          resizeMode="cover"
          source={
            room.images[0]
              ? { uri: room.images[0] }
              : require("../../../assets/img/no-image.png")
          }
        />
        <View style={styles.viewProfile}>
          <Avatar
            size="large"
            rounded
            containerStyle={styles.imageAvatarUser}
            source={
              room.avatarUser
                ? { uri: room.avatarUser }
                : require("../../../assets/img/avatar-default.jpg")
            }
          />
          <View style={styles.viewInfo}>
            <Text style={styles.nameRoom}>{room.name}</Text>
            <Text style={styles.materiaRoom}>Materia: {room.materia}</Text>
            <Text style={styles.createByRoom}>Maestro: {room.createBy}</Text>
            <Text style={styles.claveRoom}>Clave: {room.clave}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.descriptionRoom}>{room.description}</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  btnAddDelete: {
    backgroundColor: "transparent",
  },
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  viewProfile: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1,
  },
  viewInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  nameRoom: {
    fontSize: 20,
    fontWeight: "bold",
  },
  materiaRoom: {
    paddingTop: 2,
    color: "grey",
    marginBottom: 3,
  },
  createByRoom: {
    color: "grey",
    marginBottom: 3,
  },
  claveRoom: {
    color: "grey",
    marginBottom: 3,
  },
  descriptionRoom: {
    fontSize: 15,
    textAlign: "justify",
  },
  viewRoomInfo: {
    margin: 15,
    marginTop: 25,
  },
  imageRoom: {
    width: "100%",
    height: 200,
  },
  containerCard: {
    marginBottom: 30,
    borderWidth: 0,
  },
  imageAvatarUser: {
    margin: 10,
    marginLeft: 5,
    width: 80,
    height: 80,
  },
  btnTareas: {
    position: "absolute",
    bottom: 20,
    right: 10,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
  },
});
