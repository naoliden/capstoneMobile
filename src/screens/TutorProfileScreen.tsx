import * as React from 'react';
import * as PropTypes from 'prop-types';
import { View, StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux';
import TutorCoursesListComponent from '../components/TutorCoursesList';
import { showTutor } from '../actions';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  navButton: {
    marginTop: Platform.OS === 'ios' ? 10 : -10,
  },
});

const TutorProfileScreen = (props) => {
  const { tutor } = props;
  return (
    <View>
      <TutorCoursesListComponent id={tutor} />
    </View>
  );
};

TutorProfileScreen.propTypes = {
  tutor: PropTypes.number.isRequired,
};

TutorProfileScreen.navigationOptions = ({ navigation }) => ({
  headerTransparent: true,
  headerStyle: styles.navButton,
  headerLeft: (<BackButton navigation={navigation} />),
});

const mapStateToProps = (state: object) => {
  const { tutor } = state.courses;
  return { tutor };
};

const mapDispatchToProps = {
  dispatchShowCourse: showTutor,
};

export default connect(mapStateToProps, mapDispatchToProps)(TutorProfileScreen);
