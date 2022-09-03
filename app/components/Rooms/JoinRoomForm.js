import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Input, Button } from "react-native-elements";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function JoinRoom(props) {
  const { toastRef, idRoom, setShowModal, setJoin } = props;
  const [rooms, setRooms] = useState(null);
  const [formData, setFormData] = useState(defaultValue);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    db.collection("rooms")
      .doc(idRoom)
      .get()
      .then((response) => {
        const data = response.data();
        data.id = response.id;
        setRooms(data);
      });
  }, [idRoom]);

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  const onSubmit = () => {
    if (!formData.password) {
      toastRef.current.show("La contraseña no puede estar vacia");
    } else {
      if (formData.password === rooms.password) {
        setIsLoading(true);
        const payload = {
          idUser: firebase.auth().currentUser.uid,
          idRoom: idRoom,
        };
        db.collection("myRooms")
          .add(payload)
          .then(() => {
            toastRef.current.show("Te has unido al salón");
            setShowModal(false);
            setIsLoading(false);
            setJoin(true);
          })
          .catch(() => {
            setShowModal(false);
            setIsLoading(false);
            toastRef.current.show(
              "Error al intentar unisrse al salón, verifique la clave"
            );
          });
      } else {
        setShowModal(false);
        setIsLoading(false);
        toastRef.current.show("La contraseña es incorrecta");
      }
    }
  };

  return (
    <View style={styles.view}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#3498DB",
          paddingBottom: 10,
        }}
      >
        Unirse a este grupo
      </Text>
      <Text style={{ fontSize: 17, paddingBottom: 10, textAlign: "center" }}>
        Debes escribir la contraseña para poder acceder al contenido de este
        salón
      </Text>
      <Input
        placeholder="Contraseña del salón"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        leftIcon={{
          type: "material-community",
          name: "lock-outline",
          color: "#c2c2c2",
        }}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => onChange(e, "password")}
      />
      <Button
        title="Ingresar al salón"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        setIsLoading={setIsLoading}
      />
    </View>
  );
}

function defaultValue() {
  return {
    clave: "",
  };
}

const styles = StyleSheet.create({
  view: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: "95%",
  },
  btn: {
    backgroundColor: "#3498DB",
  },
});
