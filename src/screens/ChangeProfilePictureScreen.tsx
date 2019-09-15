import * as React from 'react';
import { View } from 'react-native';
import i18n from 'i18n-js';
import ChangeProfilePicture from '../components/ChangeProfilePicture';
import BackButton from '../components/BackButton';

const ChangeProfilePictureScreen = () => (
  <View>
    <ChangeProfilePicture />
  </View>
);

ChangeProfilePictureScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('myProfile.changePicture'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default ChangeProfilePictureScreen;
