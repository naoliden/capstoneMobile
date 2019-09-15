import * as React from 'react';
import { View } from 'react-native';
import i18n from 'i18n-js';
import AddCoursePicture from '../components/AddCoursePicture';
import BackButton from '../components/BackButton';


const AddCoursePictureScreen = () => (
  <View>
    <AddCoursePicture />
  </View>
);

AddCoursePictureScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('editCourse.addImage'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default AddCoursePictureScreen;
