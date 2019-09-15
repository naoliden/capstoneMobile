import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import MyProfileTutor from '../components/MyProfileTutor';
import MyProfileUser from '../components/MyProfileUser';
import { login } from '../actions';

const MyProfileScreen = (props) => {
  const { id, tutorId } = props;
  if (tutorId && tutorId !== 'null') {
    return (
      <View>
        <MyProfileTutor id={parseInt(tutorId, 10)} />
      </View>
    );
  }
  return (
    <View>
      <MyProfileUser id={parseInt(id, 10)} />
    </View>
  );
};

MyProfileScreen.propTypes = {
  id: PropTypes.number.isRequired,
  tutorId: PropTypes.number,
};

MyProfileScreen.defaultProps = {
  tutorId: null,
};

MyProfileScreen.navigationOptions = {
  header: null,
};

const mapStateToProps = (state: object) => {
  const { id, tutorId } = state.login.user;
  return { id, tutorId };
};

const mapDispatchToProps = {
  dispatchLogIn: login,
};

export default connect(mapStateToProps, mapDispatchToProps)(MyProfileScreen);
