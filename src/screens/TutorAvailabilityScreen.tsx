import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import * as PropTypes from 'prop-types';
import TutorAvailability from '../components/TutorAvailability';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const TutorAvailabilityScreen = (props) => {
  const { navigation } = props;
  const tutorId = navigation.getParam('tutorId');
  return (
    <View style={styles.container}>
      <TutorAvailability tutorId={parseInt(tutorId, 10)} />
    </View>
  );
};

TutorAvailabilityScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

TutorAvailabilityScreen.navigationOptions = ({ navigation }) => ({
  headerLeft: (<BackButton navigation={navigation} />),
});

export default withNavigation(TutorAvailabilityScreen);
