import React, { useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";
import AddRoomForm from "../../components/Rooms/AddRoomForm";

export default function CreateRoom(props) {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  return (
    <View>
      <AddRoomForm
        toastRef={toastRef}
        setIsLoading={setIsLoading}
        navigation={navigation}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Creando salon" />
    </View>
  );
}
