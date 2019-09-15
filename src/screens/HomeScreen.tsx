/* eslint-disable class-methods-use-this */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Permissions, Notifications } from 'expo';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import SearchBar from '../components/SearchBar';
import CoursesList from '../components/CoursesList';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});

const EDIT_USER = gql`
  mutation editUser($id: ID!, $notificationsToken: String) {
  editUser(input: {id: $id, notificationsToken: $notificationsToken}){
    id
    firstName
    lastName
    phoneNumber
  }
}
`;

class HomeScreen extends React.Component {
  public static navigationOptions = {
    header: (
      <View style={styles.container}>
        <SearchBar />
      </View>
    ),
  }

  public static propTypes = {
    switchValue: PropTypes.bool.isRequired,
    saveToken: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
  }

  public async componentDidMount() {
    await this.registerForPushNotificationsAsync();
  }

  public registerForPushNotificationsAsync = async () => {
    const { saveToken, user } = this.props;
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS,
    );
    let finalStatus = existingStatus;
    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
  
    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }
    // Get the token that uniquely identifies this device
    const token = await Notifications.getExpoPushTokenAsync();
    const id = parseInt(user.id, 10);
    await saveToken({ variables: { id, notificationsToken: token } });
  }

  public render() {
    const { switchValue } = this.props;
    if (!switchValue) {
      return (
        <SafeAreaView style={styles.container}>
          <CoursesList />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.container}>
        <CoursesList />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { switchValue } = state.searchBar;
  const { user } = state.login;
  return { switchValue, user };
};

export default compose(
  graphql(EDIT_USER, { name: 'saveToken' }),
  connect(mapStateToProps, null),
)(HomeScreen);
