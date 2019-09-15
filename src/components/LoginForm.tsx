import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  Alert,
  TextInput,
  Text,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import i18n from 'i18n-js';
import { login, changeLanguage, updateNumber } from '../actions';
import {
  BLUE,
  GRAY,
} from '../config/colors';

const { width } = Dimensions.get('window');

const LOGIN_MUTATION = gql`
  mutation logInUser($email: String!, $password: String!) {
    logInUser(input: { email: $email, password: $password }) {
    user {
      id
      isVerified
      photo
      unreadNotifications
    }
    tutor {
      id
    }
    token
  }
}
`;

const handleError = () => {
  Alert.alert('There was an error. Please try again!');
};

const styles = StyleSheet.create({
  loginInput: {
    borderColor: GRAY,
    borderWidth: 1,
    borderRadius: 3,
    width: 225,
    marginBottom: 20,
    alignSelf: 'center',
    fontSize: 16,
    padding: 8,
  },
  container: {
    alignItems: 'center',
  },
  signUp: {
    fontSize: 18,
    marginBottom: 10,
    color: BLUE,
  },
  forgot: {
    fontSize: 16,
    color: BLUE,
  },
  terms: {
    fontSize: 14,
    color: GRAY,
    textDecorationLine: 'underline',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    marginBottom: 10,
    alignSelf: 'center',
  },
  liblu: {
    fontSize: 25,
    color: BLUE,
    alignSelf: 'center',
    marginBottom: 25,
  },
  button: {
    backgroundColor: BLUE,
    width: 225,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

class LoginForm extends React.Component {
  public static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    loginRequest: PropTypes.func.isRequired,
    dispatchLanguage: PropTypes.func.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    dispatchNotifications: PropTypes.func.isRequired,
  }

  private constructor(props) {
    super(props);
    this.state = {
      validEmail: false,
      email: '',
      password: '',
      validPassword: false,
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.toggleLoginButtonState = this.toggleLoginButtonState.bind(this);
    this.handleCompletion = this.handleCompletion.bind(this);
  }

  private componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    const { currentLanguage } = this.props;
    if (currentLanguage !== prevProps.currentLanguage) {
      this.forceUpdate();
    }
  }

  private languageToEs() {
    i18n.locale = 'es';
    const { dispatchLanguage } = this.props;
    dispatchLanguage(i18n.locale);
    // this.forceUpdate();
  }

  private languageToEn() {
    i18n.locale = 'en';
    const { dispatchLanguage } = this.props;
    dispatchLanguage(i18n.locale);
    // this.forceUpdate();
  }

  private handleEmailChange(email: string) {
    const emailCheckRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const { validEmail } = this.state;
    this.setState({ email });

    if (!validEmail) {
      if (emailCheckRegex.test(email)) {
        this.setState({ validEmail: true });
      }
    } else if (!emailCheckRegex.test(email)) {
      this.setState({ validEmail: false });
    }
  }

  private handlePasswordChange(password: string) {
    const { validPassword } = this.state;

    this.setState({ password });

    if (!validPassword) {
      if (password.length > 5) {
        this.setState({ validPassword: true });
      }
    } else if (password <= 5) {
      this.setState({ validPassword: false });
    }
  }

  private toggleLoginButtonState() {
    const { validEmail, validPassword } = this.state;
    if (validEmail && validPassword) {
      return false;
    }
    return true;
  }

  private handleCompletion(data: { logInUser: { user: null; token: string; tutor: null } }) {
    const { user, token, tutor } = data.logInUser;
    const { loginRequest, navigation, dispatchNotifications } = this.props;
    const { navigate } = navigation;
    if (token && token !== 'null' && token !== 'undefined') {
      const { isVerified } = user;
      if (isVerified) {
        loginRequest(user, token, tutor);
        dispatchNotifications(user.unreadNotifications);
        navigate('Main');
      } else {
        navigate('ConfirmEmail', { id: parseInt(user.id, 10), tutor });
      }
    } else {
      Alert.alert(i18n.t('errors.loginError'));
    }
  }

  public render() {
    const { email, password } = this.state;
    const { navigation } = this.props;
    const { navigate } = navigation;
    return (
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll={(Platform.OS === 'ios')}
        style={{ width }}
      >
        <View style={{ paddingTop: 50 }}>
          <Image style={styles.avatar} source={require('../assets/liblu-logo.jpg')} />
          <Text style={styles.liblu}>
            {i18n.t('login.welcome')}
          </Text>
          <TextInput
            onChangeText={this.handleEmailChange}
            id="email"
            inputType="email"
            style={styles.loginInput}
            placeholder={i18n.t('login.emailPlaceholder')}
          />
          <TextInput
            onChangeText={this.handlePasswordChange}
            id="password"
            secureTextEntry
            style={styles.loginInput}
            placeholder={i18n.t('login.passwordPlaceholder')}
          />
          <Mutation
            mutation={LOGIN_MUTATION}
            variables={{ email, password }}
            onError={() => handleError()}
            onCompleted={data => this.handleCompletion(data)}
          >
            {mutation => (
              <Button
                buttonStyle={styles.button}
                onPress={() => mutation()}
                title={i18n.t('buttons.login')}
                disabled={this.toggleLoginButtonState()}
              />
            )}
          </Mutation>
          <View style={styles.container}>
            <Text style={styles.signUp} onPress={() => navigate('SignUpScreen')}>{i18n.t('login.signUp')}</Text>
            <Button
              title={i18n.t('login.forgotPassword')}
              type="clear"
              titleStyle={styles.forgot}
              onPress={() => navigate('RestorePasswordScreen')}
              containerStyle={{ marginBottom: 40 }}
            />
            <Button
              title={i18n.t('login.termsOfUse')}
              type="clear"
              titleStyle={styles.terms}
              onPress={() => navigate('Terms')}
            />
            <Button
              title={i18n.t('login.privacyPolicy')}
              type="clear"
              titleStyle={styles.terms}
              onPress={() => navigate('Privacy')}
            />
            <View style={{ flexDirection: 'row' }}>
              <Button
                title="EN"
                type="clear"
                titleStyle={styles.terms}
                onPress={() => this.languageToEn()}
                containerStyle={{ marginRight: 10 }}
              />
              <Button
                title="ES"
                type="clear"
                titleStyle={styles.terms}
                onPress={() => this.languageToEs()}
                containerStyle={{ marginLeft: 10 }}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}


const mapStateToProps = (state = { loggedInState: false }) => {
  const { currentLanguage } = state.langs;
  const { loggedInState } = state.login;
  return { currentLanguage, loggedInState };
};

const mapDispatchToProps = dispatch => ({
  loginRequest: (user, token, tutor) => {
    dispatch(login(user, token, tutor));
  },
  dispatchLanguage: (language) => {
    dispatch(changeLanguage(language));
  },
  dispatchNotifications: (number) => {
    dispatch(updateNumber(number));
  },
});

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(LoginForm));
