import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  Alert,
} from 'react-native';
import { Button } from 'react-native-elements';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { login } from '../actions';

const VERIFY_EMAIL = gql`
  mutation activateUser($userId: ID!, $token: String!) {
    activateUser(input: { userId: $userId, token: $token }) {
      user {
        id
        firstName
        photo
      }
      token
    }
  }
`;


const handleError = () => {
  Alert.alert('There was an error. Please try again!');
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    flex: 1,
  },
  contentContainer: {
    padding: 50,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    marginBottom: 10,
  },
  codeInput: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 3,
    width: 200,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'center',
    fontSize: 16,
    padding: 8,
  },
  button: {
    backgroundColor: '#3067BA',
    width: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  login: {
    fontSize: 18,
    marginBottom: 20,
    color: '#3067BA',
    alignSelf: 'center',
  },
});

class ConfirmEmail extends React.Component {
  public static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    loginRequest: PropTypes.func.isRequired,
  }

  private constructor(props) {
    super(props);
    this.state = {
      code: '',
    };

    this.handleCodeChange = this.handleCodeChange.bind(this);
  }

  private handleCodeChange(code: string) {
    this.setState({ code });
  }

  private handleCompletion(data: { activateUser: { user: null; token: string } }) {
    const { token, user } = data.activateUser;
    const { navigation, loginRequest } = this.props;
    const { navigate } = navigation;
    const tutor = navigation.getParam('tutor', null);
    if (token && token !== 'null' && token !== 'undefined') {
      loginRequest(user, token, tutor);
      navigate('Main');
    } else {
      Alert.alert('The code is invalid, please try again');
    }
  }

  private toggleButtonState() {
    const { code } = this.state;
    if (code) {
      return false;
    }
    return true;
  }

  public render() {
    const { navigation } = this.props;
    const { navigate } = navigation;
    const { code } = this.state;
    const id = navigation.getParam('id', '');
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Thank you for joining the LiBLu community!</Text>
          <Text style={styles.description}>
            A confirmation email with a code has been sent to your account.
             Please enter that code to verify your account.
          </Text>
          <TextInput
            onChangeText={this.handleCodeChange}
            style={styles.codeInput}
            placeholder="Enter code"
            id="token"
          />
          <Mutation
            mutation={VERIFY_EMAIL}
            variables={{ userId: parseInt(id, 10), token: code }}
            onError={() => handleError()}
            onCompleted={data => this.handleCompletion(data)}
          >
            {mutation => (
              <Button
                buttonStyle={styles.button}
                onPress={() => mutation()}
                title="Verify code"
                disabled={this.toggleButtonState()}
              />
            )}
          </Mutation>
          <Text style={styles.login} onPress={() => navigate('Login')}>Go back to login</Text>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  return { user };
};

const mapDispatchToProps = dispatch => ({
  loginRequest: (user, token, tutor) => {
    dispatch(login(user, token, tutor));
  },
});

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(ConfirmEmail));
