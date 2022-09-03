import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
import ListForos from "../../components/Foros/ListForos";

const db = firebase.firestore(firebaseApp);

export default function Foros(props) {
  const { navigation } = props;
  const [user, setUser] = useState(null);
  const [foros, setForos] = useState([]);
  const [totalForos, setTotalForos] = useState(0);
  const [startForos, setStartForos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const limitForos = 10;

  useEffect(() => {
    firebase.auth().onAuthStateChanged((userInfo) => {
      setUser(userInfo);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      db.collection("foros")
        .get()
        .then((snap) => {
          setTotalForos(snap.size);
        });

      const resultForos = [];

      db.collection("foros")
        .orderBy("createAt", "desc")
        .limit(limitForos)
        .get()
        .then((response) => {
          setStartForos(response.docs[response.docs.length - 1]);

          response.forEach((doc) => {
            const foro = doc.data();
            foro.id = doc.id;
            resultForos.push(foro);
          });
          setForos(resultForos);
        });
    }, [])
  );

  const handleLoadMore = () => {
    const resultForos = [];
    foros.length < totalForos && setIsLoading(true);

    db.collection("foros")
      .orderBy("createAt", "desc")
      .startAfter(startForos.data().createAt)
      .limit(limitForos)
      .get()
      .then((response) => {
        if (response.docs.length > 0) {
          setStartForos(response.docs[response.docs.length - 1]);
        } else {
          setIsLoading(false);
        }
        response.forEach((doc) => {
          const foro = doc.data();
          foro.id = doc.id;
          resultForos.push(foro);
        });
        setForos([...foros, ...resultForos]);
      });
  };

  return (
    <View style={Styles.viewBody}>
      <ListForos
        foros={foros}
        handleLoadMore={handleLoadMore}
        isLoading={isLoading}
      />

      {user && (
        <Icon
          reverse
          type="material-community"
          name="plus"
          color="#3498DB"
          containerStyle={Styles.btnContainer}
          onPress={() => navigation.navigate("add-foro")}
        />
      )}
    </View>
  );
}

const Styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  btnContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
  },
});
