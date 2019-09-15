import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import i18n from 'i18n-js';
import EditCourseMutation from '../components/EditCourse';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const EditCourseScreen = () => (
  <View style={styles.container}>
    <EditCourseMutation />
  </View>
);

EditCourseScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('editCourse.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default EditCourseScreen;
