import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import i18n from 'i18n-js';
import CreateCourse from '../components/NewCourse';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const NewCourseScreen = () => (
  <View style={styles.container}>
    <CreateCourse />
  </View>
);

NewCourseScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('newCourse.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

export default NewCourseScreen;
