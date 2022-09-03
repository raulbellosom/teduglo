import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "react-native-elements";
import { size } from "lodash";
import { useNavigation } from "@react-navigation/native";

export default function TareaRoom(props) {
  const { tareas, handleLoadMore, isLoading } = props;
  const navigation = useNavigation();
  return (
    <View>
      {size(tareas) > 0 ? (
        <FlatList
          data={tareas}
          renderItem={(tareas) => (
            <Tarea tarea={tareas} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderForos}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text>Cargando más tareas</Text>
        </View>
      )}
    </View>
  );
}

function Tarea(props) {
  const { tarea, navigation } = props;
  const { id, images, tareaName, description, fechaEntrega } = tarea.item;
  const imageTarea = images[0];

  const goTarea = () => {
    navigation.navigate("tareas", {
      screen: "tarea",
      params: {
        id,
        tareaName,
      },
    });
  };
  return (
    <TouchableOpacity onPress={goTarea}>
      <View style={styles.viewForo}>
        <View style={styles.viewForoImage}>
          <Image
            resizeMode="cover"
            PlaceholderContent={<ActivityIndicator color="fff" />}
            source={
              imageTarea
                ? { uri: imageTarea }
                : require("../../../assets/img/no-image.png")
            }
            style={styles.imageForo}
          />
        </View>
        <View>
          <Text style={styles.foroName}>{tareaName}</Text>

          <Text style={styles.foroDescription}>
            {description.substr(0, 60)}...
          </Text>
          <Text style={styles.foroMateria}>
            Fecha de entrega: {fechaEntrega}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FooterList(props) {
  const { isLoading } = props;

  if (isLoading) {
    return (
      <View style={styles.loaderForos}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundForos}>
        <Text>No hay más tareas nuevas</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loaderForos: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  viewForo: {
    flexDirection: "row",
    margin: 10,
    marginBottom: 0,
    backgroundColor: "#fff",
    padding: 5,
  },
  viewForoImage: {
    marginRight: 15,
  },
  imageForo: {
    width: 80,
    height: 80,
  },
  foroName: {
    fontWeight: "bold",
  },
  foroMateria: {
    paddingTop: 2,
    color: "grey",
  },
  foroDescription: {
    paddingTop: 2,
    color: "grey",
    width: 300,
  },
  notFoundForos: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
});
