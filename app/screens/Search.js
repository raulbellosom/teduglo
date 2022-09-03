import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, FlatList, Image } from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import { FireSQL } from "firesql";
import firebase from "firebase/app";

const fireSQL = new FireSQL(firebase.firestore(), { includeId: "id" });

export default function Search(props) {
  const { navigation } = props;
  const [search, setSearch] = useState("");
  const [foros, setForos] = useState([]);

  useEffect(() => {
    if (search) {
      fireSQL
        .query(`SELECT * FROM foros WHERE name LIKE '${search}%'`)
        .then((response) => {
          setForos(response);
        });
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      setSearch(null);
      setForos([]);
    }, [])
  );

  return (
    <View>
      <SearchBar
        placeholder="Buscar algo interesante.."
        onChangeText={(e) => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {foros.length === 0 ? (
        <NoFoundForos />
      ) : (
        <FlatList
          data={foros}
          renderItem={(foro) => <Foro foro={foro} navigation={navigation} />}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

function NoFoundForos() {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={require("../../assets/img/no-result-found.png")}
        resizeMode="cover"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}

function Foro(props) {
  const { foro, navigation } = props;
  const { id, name, images } = foro.item;
  return (
    <ListItem
      title={name}
      leftAvatar={{
        source: images[0]
          ? { uri: images[0] }
          : require("../../assets/img/no-image.png"),
      }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() =>
        navigation.navigate("foros", {
          screen: "foro",
          params: { id, name },
        })
      }
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,
  },
});
