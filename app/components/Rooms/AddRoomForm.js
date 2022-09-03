import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Dimensions,
  Text,
} from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import { map, size, filter } from "lodash";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import uuid from "random-uuid-v4";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);
const widthScreen = Dimensions.get("window").width;

export default function AddRoomForm(props) {
  const { toastRef, setIsLoading, navigation } = props;
  const [roomClave, setRoomClave] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomMateria, setRoomMateria] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [imageSelected, setImageSelected] = useState([]);

  const AddRoom = () => {
    if (
      !roomPassword ||
      !roomClave ||
      !roomName ||
      !roomMateria ||
      !roomDescription
    ) {
      toastRef.current.show("Todos los campos del formulario son obligatorios");
    } else {
      setIsLoading(true);
      uploadImageStorage().then((response) => {
        db.collection("rooms")
          .add({
            clave: roomClave.toUpperCase(),
            password: roomPassword,
            name: roomName,
            materia: roomMateria,
            description: roomDescription,
            images: response,
            createAt: new Date(),
            createBy: firebaseApp.auth().currentUser.displayName,
            idUser: firebaseApp.auth().currentUser.uid,
            avatarUser: firebaseApp.auth().currentUser.photoURL,
          })
          .then(() => {
            setIsLoading(false);
            navigation.navigate("rooms");
          })
          .catch(() => {
            setIsLoading(false);
            toastRef.current.show(
              "Error al crear el salón, intentelo mas tarde"
            );
          });
      });
    }
  };

  const uploadImageStorage = async () => {
    const imageBlob = [];

    await Promise.all(
      map(imageSelected, async (image) => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = firebase.storage().ref("rooms").child(uuid());
        await ref.put(blob).then(async (result) => {
          await firebase
            .storage()
            .ref(`rooms/${result.metadata.name}`)
            .getDownloadURL()
            .then((photoUrl) => {
              imageBlob.push(photoUrl);
            });
        });
      })
    );
    return imageBlob;
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ImageRoom imagenRoom={imageSelected[0]} />
      <FormAdd
        setRoomPassword={setRoomPassword}
        setRoomClave={setRoomClave}
        setRoomName={setRoomName}
        setRoomMateria={setRoomMateria}
        setRoomDescription={setRoomDescription}
      />
      <UploadImage
        toastRef={toastRef}
        imageSelected={imageSelected}
        setImageSelected={setImageSelected}
      />
      <Button
        title="Crear Salón"
        onPress={AddRoom}
        buttonStyle={styles.btnAddRoom}
      />
    </ScrollView>
  );
}

function ImageRoom(props) {
  const { imagenRoom } = props;

  return (
    <View style={styles.viewPhoto}>
      <Image
        source={
          imagenRoom
            ? { uri: imagenRoom }
            : require("../../../assets/img/no-image.png")
        }
        style={{ width: widthScreen, height: 200 }}
      />
    </View>
  );
}

function FormAdd(props) {
  const {
    setRoomClave,
    setRoomPassword,
    setRoomName,
    setRoomMateria,
    setRoomDescription,
  } = props;
  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Clave del Salón"
        containerStyle={styles.input}
        leftIcon={<Icon type="material-community" name="at" color="#7a7a7a" />}
        onChange={(e) => setRoomClave(e.nativeEvent.text)}
      />
      <Input
        placeholder="Contraseña del Salón"
        containerStyle={styles.input}
        leftIcon={
          <Icon type="material-community" name="lock-outline" color="#7a7a7a" />
        }
        onChange={(e) => setRoomPassword(e.nativeEvent.text)}
      />
      <Input
        placeholder="Nombre del Salón"
        containerStyle={styles.input}
        leftIcon={
          <Icon type="material-community" name="format-title" color="#7a7a7a" />
        }
        onChange={(e) => setRoomName(e.nativeEvent.text)}
      />
      <Input
        placeholder="Materia"
        containerStyle={styles.input}
        leftIcon={
          <Icon type="material-community" name="book-outline" color="#7a7a7a" />
        }
        onChange={(e) => setRoomMateria(e.nativeEvent.text)}
      />
      <Input
        placeholder="Descripcion del Salón"
        leftIcon={
          <Icon
            type="material-community"
            name="comment-outline"
            color="#7a7a7a"
          />
        }
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setRoomDescription(e.nativeEvent.text)}
      />
    </View>
  );
}

function UploadImage(props) {
  const { toastRef, imageSelected, setImageSelected } = props;
  const imageSelect = async () => {
    const resultPermissions = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    if (resultPermissions === "denied") {
      toastRef.current.show(
        "Es necesario aceptar los permisos de la galeria para acceder a las fotos, habilitalos desde la configuracion del telefono",
        3000
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
      });
      if (result.cancelled) {
        toastRef.current.show(
          "Has cerrado la galeria sin seleccionar una imagen",
          2000
        );
      } else {
        setImageSelected([...imageSelected, result.uri]);
      }
    }
  };

  const removeImage = (image) => {
    Alert.alert(
      "Eliminar Imagen",
      "¿Estas seguro de que quieres eliminar esta imagen?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => {
            setImageSelected(
              filter(imageSelected, (imageUrl) => imageUrl !== image)
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.viewImage}>
      {size(imageSelected) < 1 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}
      {size(imageSelected) < 1 && (
        <Text style={{ textAlignVertical: "center" }}>
          Añade una foto de portada para el Salón
        </Text>
      )}
      {map(imageSelected, (imageRoom, index) => (
        <Avatar
          key={index}
          style={styles.miniaturaStyles}
          source={{ uri: imageRoom }}
          onPress={() => removeImage(imageRoom)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: "100%",
    backgroundColor: "#fff",
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnAddRoom: {
    backgroundColor: "#3498DB",
    margin: 20,
  },
  viewImage: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: "#e3e3e3",
  },
  miniaturaStyles: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  viewPhoto: {
    alignItems: "center",
    height: 200,
    marginBottom: 20,
  },
});
