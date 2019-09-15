import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import i18n from 'i18n-js';
import MyDisputes from '../components/MyDisputes';
import BackButton from '../components/BackButton';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

const MyDisputesScreen = (props: {}) => {
  const { tutorId, mode, user } = props;
  const userId = user.id;
  if (mode) {
    return (
      <View style={styles.container}>
        <MyDisputes mode={mode} id={tutorId} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <MyDisputes mode={mode} id={userId} />
    </View>
  );
};

MyDisputesScreen.navigationOptions = ({ navigation }) => ({
  title: i18n.t('myDisputes.title'),
  headerLeft: (<BackButton navigation={navigation} />),
});

const mapStateToProps = (state: object) => {
  const { user, mode } = state.login;
  const { tutorId } = user;
  return {
    tutorId,
    mode,
    user,
  };
};

export default connect(mapStateToProps, null)(MyDisputesScreen);
