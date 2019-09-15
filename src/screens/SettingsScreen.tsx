import * as React from 'react';
import { View } from 'react-native';
import i18n from 'i18n-js';
import SettingsComponent from '../components/SettingsComponent';
import BackButton from '../components/BackButton';

const SettingsScreen = () => (
  <View>
    <SettingsComponent />
  </View>
);

SettingsScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('settings.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default SettingsScreen;
