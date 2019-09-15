import * as React from 'react';
import { View } from 'react-native';
import ApplyCourseComponent from '../components/ApplyCourseComponent';
import BackButton from '../components/BackButton';

const ApplyCourseScreen = () => (
  <View>
    <ApplyCourseComponent />
  </View>
);

ApplyCourseScreen.navigationOptions = ({ navigation }) => ({
  headerLeft: (<BackButton navigation={navigation} />),
});

export default ApplyCourseScreen;
