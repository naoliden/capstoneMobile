import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StyleSheet, Alert, View } from 'react-native';
import {
  Container,
  Content,
  Text,
} from 'native-base';
import t from 'tcomb-form-native';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import { Button } from 'react-native-elements';
import { BLUE } from '../config/colors';

const BECOME_TUTOR = gql`
  mutation createTutorRequest($specialty: String, $userId: Int, $location: String, $description: String, $education: String, $teachingMethod: String, $atHome: Int){
    createTutorRequest(input: {specialty: $specialty, userId: $userId, location: $location, description: $description, education: $education, teachingMethod: $teachingMethod, atHome: $atHome}){
      id
      status
    }
  }
`;

const Len2 = t.refinement(t.String, (name: string) => name.length >= 2);

const YesNo = t.enums({
  Yes: 'Yes',
  No: 'No',
});

const Type = t.struct({
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
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontWeight: '300',
    fontSize: 16,
    marginBottom: 20,
  },
  navigate: {
    fontSize: 18,
    color: BLUE,
    alignSelf: 'center',
    marginBottom: 15,
  },
});

class BecomeTutor extends React.Component {
  public static propTypes = {
    becomeTutor: PropTypes.func.isRequired,
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
    const { navigation, becomeTutor } = this.props;
    const userId = navigation.getParam('userId');
    let atHome;
    if (value) {
      if (value.atHome === 'Yes') {
        atHome = 1;
      } else {
        atHome = 0;
      }
      becomeTutor({
        variables: {
          userId: parseInt(userId, 10),
          specialty: value.specialty,
          location: value.location,
          education: value.education,
          description: value.description,
          teachingMethod: value.teachingMethod,
          atHome,
        },
      }).then((result) => {
        if (result.data.createTutorRequest.id) {
          Alert.alert('Your request has been recieved! An admin will check it out soon');
          navigation.goBack();
        } else {
          Alert.alert('There was an error, please try again');
        }
      });
    }
  }

  public render() {
    return (
      <Container style={styles.container}>
        <Content style={{ paddingHorizontal: 20 }}>
          <View style={{ height: 25 }} />
          <Text style={styles.subtitle}>
            We would like to know your teaching background before accepting you as a tutor,
            please fill in the following fields with your information:
          </Text>
          <Form
            ref="form"
            type={Type}
            options={options}
          />
          <Button
            onPress={this.handleSubmit}
            title="Send tutor request"
            buttonStyle={styles.button}
          />
        </Content>
      </Container>
    );
  }
}

const ComponentWithNavigation = withNavigation(
  compose(
    graphql(BECOME_TUTOR, { name: 'becomeTutor' }),
  )(BecomeTutor),
);

export default ComponentWithNavigation;
