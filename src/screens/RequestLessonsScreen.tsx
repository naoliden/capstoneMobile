import * as React from 'react';
import { View } from 'react-native';
import RequestLessons from '../components/RequestLessons';
import BackButton from '../components/BackButton';

const RequestLessonsScreen = () => (
  <View>
    <RequestLessons />
  </View>
);

RequestLessonsScreen.navigationOptions = ({ navigation }) => ({
  title: 'Request Private Lessons',
  headerTitleStyle: {
    fontSize: 18,
    alignSelf: 'center',
    fontWeight: '500',
    color: 'white',
  },
  headerLeft: (<BackButton navigation={navigation} />),
});

export default RequestLessonsScreen;
