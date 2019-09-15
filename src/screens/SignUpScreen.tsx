import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import i18n from 'i18n-js';
import SignUp from '../components/SignUp';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const SignUpScreen = () => (
  <View style={styles.container}>
    <SignUp />
  </View>
);

SignUpScreen.navigationOptions = ({ navigation }) => ({
  // title: i18n.t('reservation.title'),
  title: i18n.t('signUp.welcome'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default SignUpScreen;
