import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { Button, Divider } from 'react-native-elements';
import i18n from 'i18n-js';
import { Spinner, Text } from 'native-base';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { PersonalDataItem, MenuItem } from './ProfileUtils';
import {
  BLUE,
  GRAY,
  LIGHT_GRAY,
} from '../config/colors';
import { logout } from '../actions';

const styles = StyleSheet.create({
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 80,
  },
  bodyContent: {
    padding: 25,
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    color: GRAY,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#3067BA',
    height: 150,
  },
  body: {
    marginTop: 40,
  },
  subtitle: {
    color: GRAY,
    fontSize: 18,
    alignSelf: 'flex-start',
    paddingVertical: 15,
  },
  description: {
    fontSize: 16,
    color: GRAY,
    marginTop: 10,
    textAlign: 'center',
  },
  editText: {
    color: BLUE,
    fontSize: 16,
  },
  settingsText: {
    color: BLUE,
    fontSize: 16,
    marginTop: 10,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    width: '100%',
  },
});

class MyProfileUser extends React.Component {
  private constructor(props) {
    super(props);
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  private componentDidUpdate = (prevProps) => {
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  };

  private handleLogOut() {
    const { dispatchLogOut, navigation } = this.props;
    const { navigate } = navigation;
    dispatchLogOut();
    navigate('Login');
  }

  public render() {
    const { user, navigation, userLogin } = this.props;
    let sourcePicture;
    if (userLogin.photo) {
      sourcePicture = userLogin.photo;
    } else {
      sourcePicture = 'https://bootdey.com/img/Content/avatar/avatar2.png';
    }
    return (
      <View>
        <ScrollView>
          <View style={styles.header} />
          <Image style={styles.avatar} source={{ uri: sourcePicture }} />
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Button
                title={i18n.t('myProfile.editProfile')}
                type="clear"
                titleStyle={styles.editText}
                onPress={() => navigation.navigate('EditProfile', {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phoneNumber: user.phoneNumber,
                })}
              />

              <Text style={styles.subtitle}>{i18n.t('myProfile.personalData')}</Text>
              <PersonalDataItem data={user.email} iconName="ios-mail" />
              <PersonalDataItem data={user.phoneNumber} iconName="ios-call" />

              <Divider style={[styles.divider, { marginTop: 25 }]} />
              <MenuItem
                data={i18n.t('myProfile.settings')}
                iconName="md-settings"
                onPress={() => navigation.navigate('Settings')}
              />
              <Divider style={styles.divider} />
              <MenuItem
                data={i18n.t('myProfile.transactions')}
                iconName="cash-multiple"
                onPress={() => navigation.navigate('Transactions')}
                iconType="MaterialCommunityIcons"
              />
              <Divider style={styles.divider} />
              <MenuItem
                data={i18n.t('myProfile.myDisputes')}
                iconName="cash-refund"
                onPress={() => navigation.navigate('Disputes')}
                iconType="MaterialCommunityIcons"
              />
              <Divider style={styles.divider} />
              <MenuItem
                data={i18n.t('myProfile.becomeTutor')}
                iconName="ios-briefcase"
                onPress={() => navigation.navigate('BecomeTutor', { userId: user.id })}
              />
              <Divider style={styles.divider} />
              <MenuItem
                data={i18n.t('buttons.logout')}
                iconName="md-exit"
                onPress={this.handleLogOut}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

MyProfileUser.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  userLogin: PropTypes.shape({
    photo: PropTypes.string,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  dispatchLogOut: PropTypes.func.isRequired,
};

const GET_USER = gql`
  query user($id: Int!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      phoneNumber
      photo
    }
}
`;


const ShowMyself = ({ id }) => (
  <Query query={GET_USER} variables={{ id }}>
    {({ loading, error, data }) => {
      if (loading) return (<Spinner color={BLUE} />);
      if (error) return (<Text> Oops, Error! {error.message} </Text>);
      return (
        <ComponentWithNavigation user={data.user} />
      );
    }}
  </Query>
);


const mapStateToProps = (state: object) => {
  const { currentLanguage } = state.langs;
  const { user } = state.login;
  return { currentLanguage, userLogin: user };
};

const mapDispatchToProps = dispatch => ({
  dispatchLogOut: () => { dispatch(logout()); },
});

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(MyProfileUser),
);

ShowMyself.propTypes = {
  id: PropTypes.number.isRequired,
};

export default ShowMyself;
