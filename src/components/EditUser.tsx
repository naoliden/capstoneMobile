import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import {
  Container,
  Content,
  Text,
  Spinner,
} from 'native-base';
import t from 'tcomb-form-native';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-elements';
import { BLUE } from '../config/colors';

const Len = t.refinement(t.String, (name: string) => name.length >= 2);
const Len6 = t.refinement(t.String, (name: string) => (name.length >= 6 && name.length <= 15));

const Type = t.struct({
  firstName: Len,
  lastName: Len,
  phoneNumber: Len6,
});

const { Form } = t.form;

const options = {
  fields: {
    firstName: {
      error: 'Name too short',
    },
    lastName: {
      error: 'Name too short',
    },
    phoneNumber: {
      error: 'Length of phone number has to be between 6 and 15 characters',
    },
  },
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    margin: 15,
  },
  title: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  navigate: {
    fontSize: 18,
    color: BLUE,
    alignSelf: 'center',
    marginBottom: 15,
  },
});

class EditUserProfile extends React.Component {
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
      onSubmit(
        parseInt(userId, 10),
        value.firstName,
        value.lastName,
        value.phoneNumber,
        navigation,
      );
    }
  }

  public render() {
    const { navigation } = this.props;
    return (
      <Container style={styles.container}>
        <Content style={{ paddingHorizontal: 20 }}>
          <View style={{ height: 25 }} />
          <Form
            ref="form"
            type={Type}
            options={options}
            value={{
              phoneNumber: navigation.getParam('phoneNumber', ''),
              firstName: navigation.getParam('firstName', ''),
              lastName: navigation.getParam('lastName', ''),
            }}
          />
          <Button
            onPress={this.handleSubmit}
            title="Edit"
            buttonStyle={styles.button}
          />
          <Text style={styles.navigate} onPress={() => navigation.navigate('ChangeProfilePicture')}>
            Change profile picture
          </Text>
          <Text
            style={styles.navigate}
            onPress={() => navigation.navigate('ChangePassword', {
              id: navigation.getParam('id', ''),
            })}
          >
            Change password
          </Text>
        </Content>
      </Container>
    );
  }
}

const ComponentWithNavigation = withNavigation(EditUserProfile);

const EDIT_USER = gql`
  mutation editUser($id: ID!, $firstName: String, $lastName: String, $phoneNumber: String) {
  editUser(input: {id: $id, firstName: $firstName, lastName: $lastName, phoneNumber: $phoneNumber}){
    id
    firstName
    lastName
    phoneNumber
  }
}
`;


const EditUser = () => (
  <Mutation mutation={EDIT_USER}>
    {(editUser, { loading, error }) => {
      const edit = async (
        id: number,
        firstName: string,
        lastName: string,
        phoneNumber: string,
        navigation) => {
        await editUser({
          variables: {
            id,
            firstName,
            lastName,
            phoneNumber,
          },
        });
        navigation.goBack();
      };
      if (loading) {
        return <Spinner color="#3067BA" />;
      } if (error) {
        return (<Text> Error! {error.message} </Text>);
      }
      return (
        <ComponentWithNavigation onSubmit={edit} />
      );
    }}
  </Mutation>
);

export default EditUser;
