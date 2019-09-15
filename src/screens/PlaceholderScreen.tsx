import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

class Placeholder extends React.Component {
  public static navigationOptions = {
    title: 'Placeholder',
  }

  public render() {
    return (
      <View style={styles.container}>
        <Text>
          Placeholder component
        </Text>
      </View>
    );
  }
}

export default Placeholder;
