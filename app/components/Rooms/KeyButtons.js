import React, { Component } from "react";
import { Text, View, Dimensions } from "react-native";
import { ButtonGroup } from "react-native-elements";

const component1 = () => <Text>Salones Inscritos</Text>;
const component2 = () => <Text>Mis Salones</Text>;

class KeyButtons extends Component {
  constructor() {
    super();
    this.state = {
      selectedIndex: 2,
    };
    this.updateIndex = this.updateIndex.bind(this);
  }
  updateIndex(selectedIndex) {
    this.setState({ selectedIndex });
  }

  render() {
    const buttons = [{ element: component1 }, { element: component2 }];
    const { selectedIndex } = this.state;
    return (
      <ButtonGroup
        onPress={this.updateIndex}
        selectedIndex={selectedIndex}
        buttons={buttons}
        containerStyle={{ height: 50 }}
      />
    );
  }
}
export default KeyButtons;
