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

export default function ListForos(props) {
  const { foros, handleLoadMore, isLoading } = props;
  const navigation = useNavigation();
  return (
    <View>
      {size(foros) > 0 ? (
        <FlatList
          data={foros}
          renderItem={(foros) => <Foro foro={foros} navigation={navigation} />}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderForos}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text>Cargando más foros</Text>
        </View>
      )}
    </View>
  );
}

function Foro(props) {
  const { foro, navigation } = props;
  const { id, images, name, materia, description } = foro.item;
  const imageForo = images[0];

  const goForo = () => {
    navigation.navigate("foro", {
      id,
      name,
    });
  };

  return (
    <TouchableOpacity onPress={goForo}>
      <View style={styles.viewForo}>
        <View style={styles.viewForoImage}>
          <Image
            resizeMode="cover"
            PlaceholderContent={<ActivityIndicator color="fff" />}
            source={
              imageForo
                ? { uri: imageForo }
                : require("../../../assets/img/no-image.png")
            }
            style={styles.imageForo}
          />
        </View>
        <View>
          <Text style={styles.foroName}>{name}</Text>
          <Text style={styles.foroMateria}>{materia}</Text>
          <Text style={styles.foroDescription}>
            {description.substr(0, 60)}...
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
        <Text>No hay más foros nuevos por ver</Text>
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
