import * as React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import CourseViewComponent from '../components/CourseViewComponent';
import { showCourse } from '../actions';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  navButton: {
    marginTop: Platform.OS === 'ios' ? 10 : -10,
  },
});

const CourseViewScreen = (props) => {
  const { course } = props;
  return (
    <View>
      <CourseViewComponent id={course} />
    </View>
  );
};

CourseViewScreen.propTypes = {
  course: PropTypes.number.isRequired,
};

CourseViewScreen.navigationOptions = ({ navigation }) => ({
  headerTransparent: true,
  headerStyle: styles.navButton,
  headerLeft: (<BackButton navigation={navigation} />),
});

const mapStateToProps = (state: object) => {
  const { course } = state.courses;
  return { course };
};

const mapDispatchToProps = {
  dispatchShowCourse: showCourse,
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseViewScreen);
