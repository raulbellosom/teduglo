import React, { useState, useRef } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import { Button, Input, Icon, Avatar } from "react-native-elements";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";
import { map, size, filter } from "lodash";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";

import uuid from "random-uuid-v4";
import Modal from "../../components/Modal";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function AddTarea(props) {
  const { navigation, route } = props;
  const { id } = route.params;
  const [title, setTitle] = useState("");
  const [imageSelected, setImageSelected] = useState([]);
  const [comment, setComment] = useState("");
  const [renderComponent, setRenderComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();

  const addComment = () => {
    if (!title) {
      toastRef.current.show("El titulo del comentario no puede estar vacio");
    } else {
      setIsLoading(true);
      uploadImageStorage().then((response) => {
        db.collection("tareasAlumno")
          .add({
            idRoom: id,
            materia: title,
            description: comment,
            images: response,
            createAt: new Date(),
            createBy: firebaseApp.auth().currentUser.uid,
          })
          .then(() => {
            setIsLoading(false);
            navigation.navigate("rooms");
            toastRef.current.show("Tarea enviada con exito");
          })
          .catch(() => {
            setIsLoading(false);
            toastRef.current.show(
              "Error al crear la tarea, intentelo mas tarde"
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
        const ref = firebase.storage().ref("tareas").child(uuid());
        await ref.put(blob).then(async (result) => {
          await firebase
            .storage()
            .ref(`tareas/${result.metadata.name}`)
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
    <ScrollView style={styles.viewBody}>
      <View style={styles.formComment}>
        <Input
          label={"Titulo de la entrega"}
          labelStyle={{ fontWeight: "bold", color: "#000" }}
          placeholder="Titulo"
          containerStyle={styles.input}
          onChange={(e) => setTitle(e.nativeEvent.text)}
        />
        <Input
          label={"Añadir comentarios adicionales"}
          labelStyle={{ fontWeight: "bold", color: "#000", paddingTop: 20 }}
          placeholder="Comentario..."
          multiline={true}
          inputContainerStyle={styles.textArea}
          onChange={(e) => setComment(e.nativeEvent.text)}
        />
        <Text style={{ fontSize: 15, fontWeight: "bold", marginTop: 15 }}>
          Añadir imagenes
        </Text>
        <UploadImage
          toastRef={toastRef}
          imageSelected={imageSelected}
          setImageSelected={setImageSelected}
        />
        {renderComponent && (
          <Modal isVisible={showModal} setIsVisible={setShowModal}>
            {renderComponent}
          </Modal>
        )}
        <Button
          title="Entregar Tarea"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={addComment}
        />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Enviando tarea" />
    </ScrollView>
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
      {size(imageSelected) < 4 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
          size={40}
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}
      {map(imageSelected, (imageTarea, index) => (
        <Avatar
          key={index}
          style={styles.miniaturaStyles}
          source={{ uri: imageTarea }}
          onPress={() => removeImage(imageTarea)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
  },
  formComment: {
    margin: 18,
    marginTop: 40,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 150,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
    width: "95%",
  },
  btn: {
    backgroundColor: "#3498DB",
  },
  viewImage: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 90,
    width: 90,
    backgroundColor: "#e3e3e3",
  },
  miniaturaStyles: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
});
