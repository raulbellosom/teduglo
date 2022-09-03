import React, { useState, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Input } from "react-native-elements";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function AddComment(props) {
  const { navigation, route } = props;
  const { idForo } = route.params;
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  console.log(route);
  const addComment = () => {
    if (!title) {
      toastRef.current.show("El titulo del comentario no puede estar vacio");
    } else if (!comment) {
      toastRef.current.show("Escribir un comentario es obligatorio");
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser;
      const paylod = {
        idUser: user.uid,
        avatarUser: user.photoURL,
        idForo: idForo,
        title: title,
        comment: comment,
        createAt: new Date(),
      };
      db.collection("comments")
        .add(paylod)
        .then(() => {
          setIsLoading(false);
          navigation.goBack();
        })
        .catch(() => {
          toastRef.current.show("Error al enviar el comentario");
          setIsLoading(false);
        });
    }
  };

  return (
    <View style={styles.viewBody}>
      <View style={styles.formComment}>
        <Input
          placeholder="Titulo"
          containerStyle={styles.input}
          onChange={(e) => setTitle(e.nativeEvent.text)}
        />
        <Input
          placeholder="Comentario..."
          multiline={true}
          inputContainerStyle={styles.textArea}
          onChange={(e) => setComment(e.nativeEvent.text)}
        />
        <Button
          title="Enviar comentario"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={addComment}
        />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Enviando comentario" />
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
  },
  formComment: {
    flex: 1,
    alignItems: "center",
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
    marginTop: 20,
    marginBottom: 10,
    width: "95%",
  },
  btn: {
    backgroundColor: "#3498DB",
  },
});
