import * as React from 'react';
import * as PropTypes from 'prop-types';
import i18n from 'i18n-js';
import {
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import {
  Spinner,
} from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button } from 'react-native-elements';
import t from 'tcomb-form-native';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { login } from '../actions';


const Email = t.refinement(t.String, (email: string) => {
  const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return reg.test(email);
});

const Password = t.refinement(t.String, (password: string) => {
  const reg = /^(?=\S+$).{6,}$/;
  return reg.test(password);
});

function samePasswords(value: t.struct) {
  return value.password === value.confirmPassword;
}

const Names = t.refinement(t.String, (name: string) => name.length >= 2);
const Len6 = t.refinement(t.String, (name: string) => (name.length >= 6 && name.length <= 15));

const Type = t.subtype(t.struct({
  firstName: Names,
  lastName: Names,
  email: Email,
  password: Password,
  confirmPassword: t.String,
  phoneNumber: Len6,
  birthDate: t.Date,
}), samePasswords);

Type.getValidationErrorMessage = (value: {}) => {
  if (!samePasswords(value)) {
    return 'Passwords must match';
  }
  return null;
};

const { Form } = t.form;


const options = {
  fields: {
    firstName: {
      error: i18n.t('errors.nameLengthError'),
    },
    lastName: {
      error: i18n.t('errors.lastNameLengthError'),
    },
    email: {
      error: i18n.t('errors.invalidEmailError'),
    },
    password: {
      password: true,
      secureTextEntry: true,
      error: i18n.t('errors.passwordLengthError'),
    },
    confirmPassword: {
      password: true,
      secureTextEntry: true,
      error: i18n.t('errors.passwordMatchError'),
    },
    phoneNumber: {
      error: i18n.t('errors.invalidPhoneNumber'),
    },
    birthDate: {
      error: i18n.t('errors.invalidDateError'),
      mode: 'date',
    },
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  title: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  content: {
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#3067BA',
    alignSelf: 'center',
    marginBottom: 10,
    width: 200,
  },
  login: {
    fontSize: 18,
    color: '#3067BA',
    alignSelf: 'center',
    marginBottom: 15,
  },
});

class SignUp extends React.Component {
  public static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  public constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public handleSubmit() {
    const value = this.refs.form.getValue();
    const { navigation } = this.props;
    const { navigate } = navigation;
    const { onSubmit } = this.props;
    if (value) {
      if (samePasswords(value)) {
        onSubmit(
          value.firstName,
          value.lastName,
          value.email,
          value.password,
          value.phoneNumber,
          value.birthDate,
          navigate,
        );
      }
    }
  }

  public render() {
    const { navigation } = this.props;
    const { navigate } = navigation;
    return (
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll={(Platform.OS === 'ios')}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Form ref="form" type={Type} options={options} />
            <Button
              buttonStyle={styles.button}
              onPress={this.handleSubmit}
              title={i18n.t('buttons.signUp')}
            />
            <Text style={styles.login} onPress={() => navigate('Login')}> {i18n.t('signUp.toLogin')} </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const mapStateToProps = (state = { loggedInState: false }) => {
  const { loggedInState } = state.login;
  return { loggedInState };
};

const mapDispatchToProps = dispatch => ({
  loginRequest: (user, token, tutor) => {
    dispatch(login(user, token, tutor));
  },
});

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(SignUp),
);

const ADD_USER = gql`
  mutation createUser($firstName: String!, $lastName: String!, $email: String!, $password: String!, $phoneNumber: String!, $birthDate: Date!) {
  createUser(input: {firstName: $firstName, lastName: $lastName, email: $email, password: $password, phoneNumber: $phoneNumber, birthDate: $birthDate}){
    id
  }
}
`;

const NewUser = () => (
  <Mutation mutation={ADD_USER}>
    {(addUser, { loading, error }) => {
      const add = async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        phoneNumber: string,
        birthDate: string,
        navigate,
      ) => {
        const info = await addUser({
          variables: {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            birthDate,
          },
        });
        const { id } = info.data.createUser;
        navigate('ConfirmEmail', { id: parseInt(id, 10), tutor: null });
      };
      if (loading) return (<Spinner color="#3067BA" />);
      if (error) return (<Text> Error! {error.message} </Text>);
      return (
        <ComponentWithNavigation onSubmit={add} />
      );
    }}
  </Mutation>
);

export default NewUser;
