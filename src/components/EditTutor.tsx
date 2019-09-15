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
import { Mutation, compose, graphql } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-elements';
import { BLUE } from '../config/colors';

const Len2 = t.refinement(t.String, (name: string) => name.length >= 2);
const Len6 = t.refinement(t.String, (name: string) => (name.length >= 6 && name.length <= 15));

const YesNo = t.enums({
  Yes: 'Yes',
  No: 'No',
});

const Type = t.struct({
  firstName: Len2,
  lastName: Len2,
  phoneNumber: Len6,
  specialty: Len2,
  location: Len2,
  education: t.maybe(t.String),
  description: t.maybe(t.String),
  teachingMethod: Len2,
  atHome: t.maybe(YesNo),
});


const { Form } = t.form;

const options = {
  fields: {
    description: {
      multiline: true,
      stylesheet: {
        ...Form.stylesheet,
        textbox: {
          ...Form.stylesheet.textbox,
          normal: {
            ...Form.stylesheet.textbox.normal,
            height: 100,
          },
          error: {
            ...Form.stylesheet.textbox.error,
            height: 100,
          },
        },
      },
    },
    firstName: {
      error: 'Name too short',
    },
    lastName: {
      error: 'Name too short',
    },
    phoneNumber: {
      error: 'Length of phone number has to be between 6 and 15 characters',
    },
    specialty: {
      error: 'Specialty too short',
    },
    location: {
      error: 'Location too short',
    },
    teachingMethod: {
      error: 'Teaching method too short',
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
    margin: 10,
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

class EditTutorProfile extends React.Component {
  public static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    changeUser: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  public constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public async handleSubmit() {
    const value = this.refs.form.getValue();
    const { navigation, onSubmit, changeUser } = this.props;
    const tutorId = navigation.getParam('tutorId');
    const userId = navigation.getParam('userId');
    let atHome;
    if (value) {
      if (value.atHome === 'Yes') {
        atHome = 1;
      } else {
        atHome = 0;
      }
      onSubmit(parseInt(tutorId, 10),
        value.specialty,
        value.location,
        value.description,
        value.education,
        value.teachingMethod,
        atHome);
      changeUser({
        variables: {
          id: parseInt(userId, 10),
          firstName: value.firstName,
          lastName: value.lastName,
          phoneNumber: value.phoneNumber,
        },
      }).then(() => navigation.goBack());
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
              specialty: navigation.getParam('specialty', ''),
              location: navigation.getParam('location', ''),
              description: navigation.getParam('description', ''),
              education: navigation.getParam('education', ''),
              teachingMethod: navigation.getParam('teachingMethod', ''),
              // atHome: navigation.getParam('atHome', ''),
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
              id: navigation.getParam('userId', ''),
            })}
          >
            Change password
          </Text>
        </Content>
      </Container>
    );
  }
}

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

const ComponentWithNavigation = withNavigation(
  compose(
    graphql(EDIT_USER, { name: 'changeUser' }),
  )(EditTutorProfile),
);

const EDIT_TUTOR = gql`
  mutation editTutor($id: ID!, $specialty: String, $location: String, $description: String, $education: String, $teachingMethod: String, $atHome: Int) {
  editTutor(input: {id: $id, specialty: $specialty, location: $location, description: $description, education: $education, teachingMethod: $teachingMethod, atHome: $atHome}){
    id
    specialty
    location
    description
    education
    teachingMethod
    atHome
  }
}
`;

const EditTutor = () => (
  <Mutation mutation={EDIT_TUTOR}>
    {(editTutor, { loading, error }) => {
      const edit = async (id: number,
        specialty: string,
        location: string,
        description: string,
        education: string,
        teachingMethod: string,
        atHome: number,
      ) => {
        await editTutor({
          variables: {
            id,
            specialty,
            location,
            description,
            education,
            teachingMethod,
            atHome,
          },
        });
      };
      if (loading) {
        return <Spinner color="#3067BA" />;
      } if (error) {
        return (<Text> Error! {error.message} </Text>);
      }
      return (<ComponentWithNavigation onSubmit={edit} />);
    }}
  </Mutation>
);

export default EditTutor;
