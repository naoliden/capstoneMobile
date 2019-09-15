import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import EditTutorProfile from '../components/EditTutor';
import EditUserProfile from '../components/EditUser';
import { login } from '../actions';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const EditProfileScreen = (props) => {
  const { tutorId } = props;
  if (tutorId && tutorId !== 'null') {
    return (
      <View style={styles.container}>
        <EditTutorProfile />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <EditUserProfile />
    </View>
  );
};

EditProfileScreen.propTypes = {
  tutorId: PropTypes.number,
};

EditProfileScreen.defaultProps = {
  tutorId: null,
};

EditProfileScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('myProfile.editProfile'),
  headerLeft: (<BackButton navigation={navigation} />),
});

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  const { tutorId } = user;
  return { tutorId };
};

const mapDispatchToProps = {
  dispatchLogIn: login,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfileScreen);
