import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image, Icon } from "react-native-elements";
import { size } from "lodash";
import { useNavigation } from "@react-navigation/native";

export default function ListRooms(props) {
  const { rooms, handleLoadMore, isLoading } = props;
  const navigation = useNavigation();

  return (
    <ScrollView>
      {size(rooms) > 0 ? (
        <FlatList
          data={rooms}
          renderItem={(rooms) => <Room room={rooms} navigation={navigation} />}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderRooms}>
          <NotFoundRooms />
        </View>
      )}
    </ScrollView>
  );
}

function Room(props) {
  const { room, navigation } = props;
  const { id, images, name, materia, clave, createBy } = room.item;
  const imageRoom = images[0];

  const goRoom = () => {
    navigation.navigate("room", {
      id,
      name,
    });
  };

  return (
    <TouchableOpacity onPress={goRoom}>
      <View style={styles.viewRoom}>
        <View style={styles.viewRoomImage}>
          <Image
            resizeMode="cover"
            PlaceholderContent={<ActivityIndicator color="fff" />}
            source={
              imageRoom
                ? { uri: imageRoom }
                : require("../../../assets/img/no-image.png")
            }
            style={styles.imageRoom}
          />
        </View>
        <View>
          <Text style={styles.roomName}>{name}</Text>
          <Text style={styles.roomMateria}>{materia}</Text>
          <Text style={styles.roomClave}>{clave}</Text>
          <Text style={styles.roomClave}>{createBy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function NotFoundRooms() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Icon
        type="material-community"
        name="alert-circle-outline"
        size={50}
        color="#f00"
      />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        ¡No veo salones por aqui!
      </Text>
      <Text style={{ fontSize: 17, fontWeight: "bold", textAlign: "center" }}>
        Parece que no te has inscrito a algun salón
      </Text>
    </View>
  );
}

function FooterList(props) {
  const { isLoading } = props;

  if (isLoading) {
    return (
      <View style={styles.loaderRooms}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundRooms}>
        <Text>No hay más salones agregados a tu lista</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loaderRooms: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  viewRoom: {
    flexDirection: "row",
    margin: 10,
  },
  viewRoomImage: {
    marginRight: 15,
  },
  imageRoom: {
    width: 80,
    height: 80,
  },
  roomName: {
    fontWeight: "bold",
  },
  roomMateria: {
    paddingTop: 2,
    color: "grey",
  },
  roomClave: {
    paddingTop: 2,
    color: "grey",
  },
  notFoundRooms: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
});
