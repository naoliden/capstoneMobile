import * as React from 'react';
import { View } from 'react-native';
import i18n from 'i18n-js';
import ChangePassword from '../components/ChangePassword';
import BackButton from '../components/BackButton';

const ChangePasswordScreen = () => (
  <View>
    <ChangePassword />
  </View>
);

ChangePasswordScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('myProfile.changePassword'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default ChangePasswordScreen;
