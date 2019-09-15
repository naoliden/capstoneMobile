import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet, View, Alert, Platform,
} from 'react-native';
import {
  Text,
  Spinner,
} from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import t from 'tcomb-form-native';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-elements';
import { BLUE } from '../config/colors';

const Password = t.refinement(t.String, (password: string) => {
  const reg = /^(?=\S+$).{6,}$/;
  return reg.test(password);
});

function samePasswords(value: t.struct) {
  return value.password === value.confirmPassword;
}

const Type = t.subtype(t.struct({
  oldPassword: Password,
  password: Password,
  confirmPassword: t.String,
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
    oldPassword: {
      password: true,
      secureTextEntry: true,
      error: 'Insert a valid password',
    },
    password: {
      password: true,
      secureTextEntry: true,
      error: 'Insert a valid password',
    },
    confirmPassword: {
      password: true,
      secureTextEntry: true,
      error: 'Insert a valid password',
    },
  },
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    margin: 10,
  },
});

class ChangePassword extends React.Component {
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
    const { onSubmit, navigation } = this.props;
    const userId = navigation.getParam('id');
    if (value) {
      if (samePasswords(value)) {
        onSubmit(parseInt(userId, 10), value.password, value.oldPassword, navigation);
      }
    }
  }

  public render() {
    return (
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll={(Platform.OS === 'ios')}
      >
        <View style={styles.container}>
          <View style={{ height: 25 }} />
          <View style={{ paddingHorizontal: 20 }}>
            <Form ref="form" type={Type} options={options} />
            <Button
              onPress={this.handleSubmit}
              title="Change"
              buttonStyle={styles.button}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const ComponentWithNavigation = withNavigation(ChangePassword);

const CHANGE_PASSWORD = gql`
  mutation changeUserPassword($id: ID!, $password: String!, $oldPassword: String!) {
    changeUserPassword(input: {id: $id, password: $password, oldPassword: $oldPassword}){
    state
  }
}
`;

const ChangePasswordMutation = () => (
  <Mutation mutation={CHANGE_PASSWORD}>
    {(changeUserPassword, { loading, error }) => {
      const change = async (id: number, password: string, oldPassword: string, navigation) => {
        const obj = await changeUserPassword({
          variables: {
            id,
            password,
            oldPassword,
          },
        });
        const { state } = obj.data.changeUserPassword;
        if (parseInt(state, 10) === 0) {
          Alert.alert('Incorrect old password');
        } else {
          Alert.alert('Password succesfully changed');
          navigation.goBack();
        }
      };
      if (loading) {
        return <Spinner color="#3067BA" />;
      } if (error) {
        return (<Text> Error! {error.message} </Text>);
      }
      return (
        <ComponentWithNavigation onSubmit={change} />
      );
    }}
  </Mutation>
);


export default ChangePasswordMutation;
