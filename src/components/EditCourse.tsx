import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StyleSheet, Alert, View } from 'react-native';
import {
  Container,
  Content,
  Text,
  Spinner,
} from 'native-base';
import { Button } from 'react-native-elements';
import t from 'tcomb-form-native';
import gql from 'graphql-tag';
import { Mutation, compose, graphql } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import { BLUE } from '../config/colors';

const Names = t.refinement(t.String, (name: string) => name.length >= 3);

const Positives = t.refinement(t.Number, (price: number) => price >= 0);

const Url = t.refinement(t.String, (url: string) => {
  const reg = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return reg.test(url);
});

const { Form } = t.form;

const options = {
  fields: {
    name: {
      error: 'The name is not long enough',
    },
    price: {
      error: 'Insert a valid price',
      label: 'Pice (US Dollars)',
    },
    description: {
      error: 'Insert a valid description',
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
    city: {
      error: 'Insert a valid city',
    },
    country: {
      error: 'Insert a valid country',
    },
    availableSeats: {
      error: 'Insert a valid number',
    },
    youtubeLink: {
      error: 'Insert a valid link',
    },
    labels: {
      auto: 'none',
      label: 'Add category',
      item: {
        error: 'Choose a category',
      },
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
    backgroundColor: '#3067BA',
    alignSelf: 'center',
    marginBottom: 15,
    width: 335,
  },
  navigate: {
    fontSize: 18,
    color: BLUE,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
  },
});

class EditCourse extends React.Component {
  public static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    getLabels: PropTypes.shape({
      showLabels: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    addLabel: PropTypes.func.isRequired,
    deleteLabel: PropTypes.func.isRequired,
    cancelCourse: PropTypes.func.isRequired,
  }

  public constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  private handleCancel(courseId: number) {
    Alert.alert(
      'Are you sure you want to cancel this course?',
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'OK', onPress: () => this.cancel(courseId) },
      ],
      { cancelable: false },
    );
  }

  private async cancel(courseId: number) {
    const { cancelCourse, navigation } = this.props;
    cancelCourse({
      variables: {
        id: courseId,
      },
    }).then(() => {
      navigation.goBack();
    }).catch(() => {
      Alert.alert(
        'Something went wrong',
        '',
        [
          { text: 'OK' },
        ],
        { cancelable: false },
      );
    });
  }

  private createFormType() {
    const { getLabels } = this.props;
    const { showLabels } = getLabels;
    const objCategories = {};
    for (let i = 0; i < showLabels.length; i += 1) {
      objCategories[showLabels[i].id] = showLabels[i].category;
    }
    const Label = t.enums(objCategories);
    const Tags = t.list(Label);
    const Course = t.struct({
      name: Names,
      price: Positives,
      description: t.String,
      address: t.String,
      country: t.String,
      city: t.String,
      availableSeats: Positives,
      youtubeLink: t.maybe(Url),
      labels: t.maybe(Tags),
    });
    return Course;
  }

  public async handleSubmit() {
    const value = this.refs.form.getValue();
    const {
      onSubmit,
      navigation,
      addLabel,
      deleteLabel,
    } = this.props;
    const courseId = navigation.getParam('id');
    if (value) {
      onSubmit(
        parseInt(courseId, 10),
        value.name,
        value.price,
        value.description,
        value.address,
        value.city,
        value.country,
        value.availableSeats,
        value.youtubeLink,
      );
      let labelsForm = [];
      if (value.labels !== null) {
        labelsForm = value.labels;
      }
      const categoriesId = navigation.getParam('idList', '');
      let labelsToAdd = [];
      if (labelsForm.length !== 0) {
        labelsToAdd = labelsForm.filter((label: object) => (!categoriesId.includes(label)));
      }
      const labelsToDelete = categoriesId.filter((label: object) => (!labelsForm.includes(label)));
      const results = [];
      labelsToAdd.forEach((label: object) => {
        results.push(addLabel({
          variables: {
            labelIndexId: label,
            courseId,
          },
        }));
      });
      labelsToDelete.forEach((label: object) => {
        results.push(deleteLabel({
          variables: {
            labelIndexId: label,
            courseId,
          },
        }));
      });
      await Promise.all(results);
      const refetchCourse = navigation.getParam('refetch', () => null);
      await refetchCourse();
      navigation.goBack();
    }
  }

  public render() {
    const { navigation, getLabels } = this.props;
    const { showLabels } = getLabels;
    if (!showLabels) {
      return (<Spinner color="#3067BA" />);
    }
    const formType = this.createFormType();
    const courseId = navigation.getParam('id', '');
    const images = navigation.getParam('images', '');
    const refetch = navigation.getParam('refetch', () => null);
    return (
      <Container style={styles.container}>
        <Content style={{ paddingHorizontal: 20 }}>
          <View style={{ height: 25 }} />
          <Form
            ref="form"
            type={formType}
            options={options}
            value={{
              name: navigation.getParam('name', ''),
              price: navigation.getParam('price', ''),
              description: navigation.getParam('description', ''),
              address: navigation.getParam('address', ''),
              city: navigation.getParam('city', ''),
              country: navigation.getParam('country', ''),
              availableSeats: navigation.getParam('availableSeats', ''),
              youtubeLink: navigation.getParam('youtubeLink', ''),
              labels: navigation.getParam('idList', ''),
            }}
          />
          <Button
            buttonStyle={styles.button}
            onPress={this.handleSubmit}
            title="Edit"
          />
          <Text
            style={styles.navigate}
            onPress={
              () => navigation.navigate('AddCoursePicture', {
                courseId,
                images,
                refetch,
              })
            }
          >
            Add image to course
          </Text>
          <Text
            style={styles.navigate}
            onPress={
              () => this.handleCancel(courseId)
            }
          >
            Cancel Course
          </Text>
        </Content>
      </Container>
    );
  }
}

const GET_LABELS = gql`
  {
    showLabels {
      id
      category
    }
  }
`;

const ADD_LABEL = gql`
  mutation addLabelToCourse($labelIndexId: ID!, $courseId: ID!) {
  addLabelToCourse(input: {labelIndexId: $labelIndexId, courseId: $courseId}){
    courseId
    labelIndexId
  }
}
`;

const DELETE_LABEL = gql`
  mutation deleteLabelFromCourse($labelIndexId: ID!, $courseId: ID!) {
  deleteLabelFromCourse(input: {labelIndexId: $labelIndexId, courseId: $courseId}){
    courseId
    labelIndexId
  }
}
`;

const CANCEL_COURSE = gql`
mutation desactivateCourse($id: ID!) {
  desactivateCourse(input: {id: $id}){
    id
  }
}
`;

const ComponentWithNavigation = withNavigation(
  compose(
    graphql(GET_LABELS, { name: 'getLabels' }),
    graphql(ADD_LABEL, { name: 'addLabel' }),
    graphql(DELETE_LABEL, { name: 'deleteLabel' }),
    graphql(CANCEL_COURSE, { name: 'cancelCourse' }),
  )(EditCourse),
);

const EDIT_COURSE = gql`
  mutation editCourse($id: ID!, $name: String, $price: Float, $description: String!, $address: String!, $city: String!, $country: String, $availableSeats: Int, $youtubeLink: String) {
  editCourse(input: {id: $id, name: $name, price: $price, description: $description, address: $address, city: $city, country: $country, availableSeats: $availableSeats, youtubeLink: $youtubeLink}){
    id
    name
    price
    description
    address
    city
    country
    availableSeats
    youtubeLink
  }
}
`;

const EditCourseMutation = () => (
  <Mutation mutation={EDIT_COURSE}>
    {(editCourse, { loading, error }) => {
      const edit = async (
        id: number,
        name: string,
        price: number,
        description: string,
        address: string,
        city: string,
        country: string,
        availableSeats: number,
        youtubeLink: string,
      ) => {
        await editCourse({
          variables: {
            id,
            name,
            price,
            description,
            address,
            city,
            country,
            availableSeats,
            youtubeLink,
          },
        });
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


export default EditCourseMutation;
