import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Button, Divider } from 'react-native-elements';
import i18n from 'i18n-js';
import { Spinner, Text } from 'native-base';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import {
  BLUE,
  GRAY,
  LIGHT_GRAY,
} from '../config/colors';
import { PersonalDataItem, MenuItem } from './ProfileUtils';
import { logout } from '../actions';

const { width } = Dimensions.get('window');

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
    backgroundColor: BLUE,
    height: 150,
  },
  body: {
    marginTop: 40,
  },
  button: {
    width,
  },
  description: {
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  editText: {
    color: BLUE,
    fontSize: 16,
  },
  subtitle: {
    color: GRAY,
    fontSize: 18,
    alignSelf: 'flex-start',
    paddingVertical: 15,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    width: '100%',
  },
});

class MyProfileTutor extends React.Component {
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
    const { tutor, navigation, userLogin } = this.props;
    const { user, balance } = tutor;
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
                  userId: user.id,
                  tutorId: tutor.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phoneNumber: user.phoneNumber,
                  specialty: tutor.specialty,
                  location: tutor.location,
                  description: tutor.description,
                  education: tutor.education,
                  teachingMethod: tutor.teachingMethod,
                  atHome: tutor.atHome,
                })}
              />

              <Text style={styles.subtitle}>{i18n.t('myProfile.educationalBackground')}</Text>
              <Text style={styles.description}>{i18n.t('myProfile.description')}{tutor.description}</Text>
              <Text style={styles.description}>{i18n.t('myProfile.education')}{tutor.education}</Text>
              <Text style={styles.description}>{i18n.t('myProfile.specialty')}{tutor.specialty}</Text>
              <Text style={styles.description}>{i18n.t('myProfile.teachingMethod')}{tutor.teachingMethod}</Text>

              <Text style={styles.subtitle}>{i18n.t('myProfile.personalData')}</Text>
              <PersonalDataItem data={user.email} iconName="ios-mail" />
              <PersonalDataItem data={user.phoneNumber} iconName="ios-call" />
              <PersonalDataItem data={tutor.location} iconName="ios-pin" />

              <Divider style={[styles.divider, { marginTop: 25 }]} />
              <MenuItem
                data={i18n.t('myProfile.settings')}
                iconName="md-settings"
                onPress={() => navigation.navigate('Settings')}
              />
              <Divider style={styles.divider} />
              <MenuItem
                data={i18n.t('myProfile.showAvailability')}
                iconName="md-calendar"
                onPress={() => navigation.navigate('ShowAvailability', {
                  tutorId: tutor.id,
                })}
              />
              <Divider style={styles.divider} />
              <MenuItem
                data={i18n.t('myProfile.availability')}
                iconName="md-time"
                onPress={() => navigation.navigate('Availability')}
              />
              <Divider style={styles.divider} />
              <MenuItem
                data={i18n.t('myProfile.transactions')}
                iconName="cash-multiple"
                onPress={() => navigation.navigate('Transactions', { balance })}
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

MyProfileTutor.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  tutor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    specialty: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string.isRequired,
    education: PropTypes.string.isRequired,
    teachingMethod: PropTypes.string,
    atHome: PropTypes.number,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  userLogin: PropTypes.shape({
    photo: PropTypes.string,
  }).isRequired,
  dispatchLogOut: PropTypes.func.isRequired,
};

const GET_TUTOR = gql`
  query tutor($id: Int!) {
    tutor(id: $id) {
      id
      specialty
      location
      description
      education
      teachingMethod
      atHome
      balance
      user{
        id
        firstName
        lastName
        email
        phoneNumber
        photo
      }
    }
  }
`;

const ShowMyself = ({ id }) => (
  <Query query={GET_TUTOR} variables={{ id }}>
    {({ loading, error, data }) => {
      if (loading) return (<Spinner color={BLUE} />);
      if (error) return (<Text> Oops, Error! {error.message} </Text>);
      return (
        <ComponentWithNavigation tutor={data.tutor} />
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
  connect(mapStateToProps, mapDispatchToProps)(MyProfileTutor),
);

ShowMyself.propTypes = {
  id: PropTypes.number.isRequired,
};

export default ShowMyself;
