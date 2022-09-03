import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, FlatList, Image } from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import { FireSQL } from "firesql";
import firebase from "firebase/app";

const fireSQL = new FireSQL(firebase.firestore(), { includeId: "id" });

export default function AddRoomSearch(props) {
  const { navigation } = props;
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (search) {
      fireSQL
        .query(`SELECT * FROM rooms WHERE clave LIKE '${search}%'`)
        .then((response) => {
          setRooms(response);
        });
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      setSearch(null);
      setRooms([]);
    }, [])
  );

  return (
    <View>
      <SearchBar
        placeholder="Buscar salon"
        onChangeText={(e) => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {rooms.length === 0 ? (
        <NoFoundRooms />
      ) : (
        <FlatList
          data={rooms}
          renderItem={(room) => <Room room={room} navigation={navigation} />}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

function NoFoundRooms() {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={require("../../../assets/img/no-result-found.png")}
        resizeMode="cover"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}

function Room(props) {
  const { room, navigation } = props;
  const { id, name, clave, images } = room.item;
  return (
    <ListItem
      title={name}
      subtitle={clave}
      leftAvatar={{
        source: images[0]
          ? { uri: images[0] }
          : require("../../../assets/img/no-image.png"),
      }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() =>
        navigation.navigate("room", {
          id,
          name,
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
