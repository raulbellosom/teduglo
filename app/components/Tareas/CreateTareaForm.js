import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { Icon, Avatar, Input, Button } from "react-native-elements";
import { map, size, filter } from "lodash";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import uuid from "random-uuid-v4";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function CreateTareaForm(props) {
  const { toastRef, setIsLoading, navigation } = props;
  const [tareaName, setTareaName] = useState("");
  const [foroMateria, setForoMateria] = useState("");
  const [foroDescription, setForoDescription] = useState("");
  const [imageSelected, setImageSelected] = useState([]);
  const AddForo = () => {
    if (!tareaName || !foroMateria || !foroDescription) {
      toastRef.current.show("Todos los campos del formulario son obligatorios");
    } else if (size(imageSelected) === 0) {
      toastRef.current.show("Debe subir por lo menos una foto");
    } else {
      setIsLoading(true);
      uploadImageStorage().then((response) => {
        db.collection("foros")
          .add({
            name: tareaName,
            materia: foroMateria,
            description: foroDescription,
            images: response,
            createAt: new Date(),
            createBy: firebaseApp.auth().currentUser.uid,
          })
          .then(() => {
            setIsLoading(false);
            navigation.navigate("foros");
          })
          .catch(() => {
            setIsLoading(false);
            toastRef.current.show(
              "Error al crear el foro, intentelo mas tarde"
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
        const ref = firebase.storage().ref("foros").child(uuid());
        await ref.put(blob).then(async (result) => {
          await firebase
            .storage()
            .ref(`foros/${result.metadata.name}`)
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
        setForoMateria={setForoMateria}
        setForoDescription={setForoDescription}
      />
      <UploadImage
        toastRef={toastRef}
        imageSelected={imageSelected}
        setImageSelected={setImageSelected}
      />
      <Button
        title="Crear Foro"
        onPress={AddForo}
        buttonStyle={styles.btnAddForo}
      />
    </ScrollView>
  );
}

function FormAdd(props) {
  const { setTareaName, setForoMateria, setForoDescription } = props;
  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Nombre del tarea"
        containerStyle={styles.input}
        onChange={(e) => setTareaName(e.nativeEvent.text)}
      />
      <Input
        placeholder="Materia"
        containerStyle={styles.input}
        onChange={(e) => setForoMateria(e.nativeEvent.text)}
      />
      <Input
        placeholder="Descripcion del tarea"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setForoDescription(e.nativeEvent.text)}
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
      {map(imageSelected, (imageForo, index) => (
        <Avatar
          key={index}
          style={styles.miniaturaStyles}
          source={{ uri: imageForo }}
          onPress={() => removeImage(imageForo)}
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
  btnAddForo: {
    backgroundColor: "#00a680",
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
