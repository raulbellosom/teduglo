import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert, Text } from "react-native";
import { Icon, Avatar, Input, Button } from "react-native-elements";
import { map, size, filter } from "lodash";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import uuid from "random-uuid-v4";
import Modal from "../../components/Modal";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function CreateTareaForm(props) {
  const { toastRef, setIsLoading, navigation, route } = props;
  const { name, id } = route.params;
  const [tareaName, setTareaName] = useState("");
  const [tareaDescription, setTareaDescription] = useState("");
  const [imageSelected, setImageSelected] = useState([]);
  const [tareaRecursos, setTareaRecursos] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(null);
  const [fechaEntrega, setFechaEntrega] = useState("");
  const AddTarea = () => {
    if (!tareaName || !tareaDescription) {
      toastRef.current.show("Todos los campos del formulario son obligatorios");
    } else {
      setIsLoading(true);
      uploadImageStorage().then((response) => {
        db.collection("tareas")
          .add({
            idRoom: id,
            tareaName: tareaName,
            materia: name,
            fechaEntrega: fechaEntrega,
            description: tareaDescription,
            recursos: tareaRecursos,
            images: response,
            createAt: new Date(),
            createBy: firebaseApp.auth().currentUser.uid,
          })
          .then(() => {
            setIsLoading(false);
            navigation.navigate("rooms");
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
      <FormAdd
        setTareaName={setTareaName}
        setTareaDescription={setTareaDescription}
        setTareaRecursos={setTareaRecursos}
        route={route}
      />
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
      <Entrega setFechaEntrega={setFechaEntrega} />
      <Button
        title="Crear Tarea"
        onPress={AddTarea}
        buttonStyle={styles.btnAddTarea}
      />
    </ScrollView>
  );
}

function Entrega(props) {
  const { setFechaEntrega } = props;
  return (
    <View style={styles.viewForm}>
      <Input
        label="Fecha de entrega"
        labelStyle={{ fontSize: 15, color: "#000", paddingTop: 10 }}
        placeholder="dd/mm/yyyy"
        inputStyle={{ width: 75 }}
        containerStyle={{ paddingBottom: 10, width: 150 }}
        onChange={(e) => setFechaEntrega([e.nativeEvent.text])}
      />
    </View>
  );
}

function FormAdd(props) {
  const { setTareaName, setTareaRecursos, setTareaDescription, route } = props;
  const { name } = route.params;

  return (
    <View style={styles.viewForm}>
      <Input
        label="Titulo de la tarea"
        labelStyle={{ fontSize: 15, color: "#000", paddingTop: 10 }}
        placeholder="Nombre del la tarea"
        containerStyle={styles.input}
        onChange={(e) => setTareaName(e.nativeEvent.text)}
      />
      <Text
        style={{
          fontSize: 15,
          paddingLeft: 10,
          paddingBottom: 10,
          fontWeight: "bold",
        }}
      >
        Materia:
      </Text>
      <Text
        style={{
          fontSize: 20,
          paddingLeft: 10,
          paddingBottom: 10,
        }}
      >
        {name}
      </Text>
      <Input
        label="Descripcion de la tarea"
        labelStyle={{ fontSize: 15, color: "#000" }}
        placeholder="Descripcion del la tarea"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setTareaDescription(e.nativeEvent.text)}
      />

      <Input
        label="Recursos de apoyo"
        labelStyle={{ fontSize: 15, color: "#000", paddingTop: 10 }}
        placeholder="Links, bibliografias, libros"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setTareaRecursos(e.nativeEvent.text)}
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
      {size(imageSelected) < 4 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
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
  scrollView: {
    height: "100%",
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnAddTarea: {
    backgroundColor: "#3498DB",
    margin: 20,
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
