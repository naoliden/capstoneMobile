import * as React from 'react';
import { View } from 'react-native';
import TutorRequest from '../components/TutorRequest';
import BackButton from '../components/BackButton';

const TutorRequestScreen = () => (
  <View>
    <TutorRequest />
  </View>
);

TutorRequestScreen.navigationOptions = ({ navigation }) => ({
  title: 'Response',
  headerLeft: (<BackButton navigation={navigation} />),
});

export default TutorRequestScreen;
