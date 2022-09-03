import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Avatar } from "react-native-elements";
import { map } from "lodash";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function ListComents(props) {
  const { navigation, idForo } = props;
  const [userLogged, setUserLogged] = useState(false);
  const [comments, setComments] = useState([]);

  firebase.auth().onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useFocusEffect(
    useCallback(() => {
      db.collection("comments")
        .where("idForo", "==", idForo)
        .get()
        .then((response) => {
          const resultComment = [];
          response.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            resultComment.push(data);
          });
          setComments(resultComment);
        });
    }, [])
  );

  return (
    <View>
      {userLogged ? (
        <Button
          title="Escribe una comentario"
          buttonStyle={styles.btnAddReview}
          titleStyle={styles.btnTitleAddReview}
          icon={{
            type: "material-community",
            name: "square-edit-outline",
            color: "#3498DB",
          }}
          onPress={() =>
            navigation.navigate("add-coment", {
              idForo: idForo,
            })
          }
        />
      ) : (
        <View>
          <Text
            style={{ textAlign: "center", color: "#00a680", padding: 20 }}
            onPress={() => navigation.navigate("account", { screen: "login" })}
          >
            Para escribir un comentario es necesario estar logeado{" "}
            <Text style={{ fontWeight: "bold" }}>
              Pulsa aqui para iniciar sesión
            </Text>
          </Text>
        </View>
      )}

      {map(comments, (comment, index) => (
        <Comment key={index} comment={comment} />
      ))}
    </View>
  );
}

function Comment(props) {
  const { title, comment, createAt, avatarUser } = props.comment;
  const createReview = new Date(createAt.seconds * 1000);
  return (
    <View style={styles.viewReview}>
      <View style={styles.viewImageAvatar}>
        <Avatar
          size="large"
          rounded
          containerStyle={styles.imageAvatarUser}
          source={
            avatarUser
              ? { uri: avatarUser }
              : require("../../../assets/img/avatar-default.jpg")
          }
        />
      </View>
      <View style={styles.viewInfo}>
        <Text style={styles.viewTitle}>{title}</Text>
        <Text style={styles.reviewText}>{comment}</Text>
        <Text style={styles.reviewData}>
          {createReview.getDate()}/{createReview.getMonth() + 1}/
          {createReview.getFullYear()} - {createReview.getHours()}:
          {createReview.getMinutes() < 10 ? "0" : ""}
          {createReview.getMinutes()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnAddReview: {
    backgroundColor: "transparent",
  },
  btnTitleAddReview: {
    color: "#3498DB",
  },
  viewReview: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1,
  },
  viewImageAvatar: {
    marginRight: 15,
  },
  imageAvatarUser: {
    width: 50,
    height: 50,
  },
  viewInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  viewTitle: {
    fontWeight: "bold",
  },
  reviewText: {
    paddingTop: 2,
    color: "grey",
    marginBottom: 5,
  },
  reviewData: {
    marginTop: 5,
    color: "grey",
    fontSize: 12,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});
