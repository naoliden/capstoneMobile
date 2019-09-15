import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import LoginForm from '../components/LoginForm';

const styles = StyleSheet.create({
  loginViewContainer: {
    margin: 'auto',
    borderColor: 'black',
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
});

class LoginScreen extends React.Component {
  public static navigationOptions = {
    header: null,
  }

  public render() {
    return (
      <View style={styles.loginViewContainer}>
        <LoginForm />
      </View>
    );
  }
}

export default LoginScreen;
