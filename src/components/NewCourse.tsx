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
import { connect } from 'react-redux';
import { Button } from 'react-native-elements';
import { showCourse } from '../actions';
import { BLUE } from '../config/colors';

const Names = t.refinement(t.String, (name: string) => name.length >= 2);

const Positives = t.refinement(t.Number, (price: number) => price >= 0);

const Url = t.refinement(t.String, (url: string) => {
  const reg = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return reg.test(url);
});

const { Form } = t.form;

const options = {
  fields: {
    name: {
      error: 'The name of your course is not long enough',
    },
    price: {
      error: 'Insert a valid price',
      label: 'Price (US Dollars)',
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
    address: {
      error: 'Insert a valid address',
    },
    country: {
      error: 'Insert a valid country',
    },
    city: {
      error: 'Insert a valid city',
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
    backgroundColor: BLUE,
    alignSelf: 'center',
    marginBottom: 30,
    width: 315,
  },
  title: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
  },
});

class CreateCourse extends React.Component {
  public static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    dispatchShowCourse: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    getLabels: PropTypes.shape({
      showLabels: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    addLabel: PropTypes.func.isRequired,
  }

  public constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
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
      onSubmit, dispatchShowCourse, navigation, user, addLabel,
    } = this.props;
    const { tutorId } = user;
    if (value) {
      const {
        name,
        price,
        description,
        address,
        country,
        city,
        availableSeats,
        youtubeLink,
        labels,
      } = value;
      const id = await onSubmit(
        name,
        price,
        description,
        address,
        country,
        city,
        parseInt(availableSeats, 10),
        tutorId,
        youtubeLink,
      );
      const results = [];
      if (labels !== null) {
        for (let i = 0; i < labels.length; i += 1) {
          results.push(addLabel({
            variables: {
              labelIndexId: labels[i],
              courseId: id,
            },
          }));
        }
        await Promise.all(results);
      }
      dispatchShowCourse(parseInt(id, 10));
      navigation.navigate('Course');
    }
  }

  public render() {
    const { getLabels } = this.props;
    const { showLabels } = getLabels;
    if (!showLabels) {
      return (<Spinner color="#3067BA" />);
    }
    const formType = this.createFormType();
    return (
      <Container style={styles.container}>
        <Content style={{ paddingHorizontal: 30 }}>
          <View style={{ height: 25 }} />
          <Form ref="form" type={formType} options={options} />
          <Button
            buttonStyle={styles.button}
            onPress={this.handleSubmit}
            title="Create course"
          />
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  return { user };
};

const mapDispatchToProps = {
  dispatchShowCourse: showCourse,
};

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

const CoursesWithNavigation = withNavigation(
  compose(
    graphql(GET_LABELS, { name: 'getLabels' }),
    graphql(ADD_LABEL, { name: 'addLabel' }),
    connect(mapStateToProps, mapDispatchToProps),
  )(CreateCourse),
);

const ADD_COURSE = gql`
  mutation createCourse($name: String!, $price: Float!, $description: String!, $address: String!, $country: String!, $city: String!, $availableSeats: Int!, $tutorId: ID!, $youtubeLink: String) {
  createCourse(input: {name: $name, price: $price, description: $description, address: $address, country: $country, city: $city, availableSeats: $availableSeats, tutorId: $tutorId, youtubeLink: $youtubeLink}){
    id
  }
}
`;

const NewCourse = () => (
  <Mutation mutation={ADD_COURSE}>
    {(addCourse, { loading, error }) => {
      const add = async (
        name: string,
        price: number,
        description: string,
        address: string,
        country: string,
        city: string,
        availableSeats: number,
        tutorId: number,
        youtubeLink: string,
      ) => {
        const info = await addCourse({
          variables: {
            name,
            price,
            description,
            address,
            city,
            country,
            availableSeats,
            tutorId,
            youtubeLink,
          },
        });
        const { id } = info.data.createCourse;
        return id;
      };
      if (loading) {
        return (<Spinner color="#3067BA" />);
      } if (error) {
        return (<Text> Error! {error.message} </Text>);
      }
      return (
        <CoursesWithNavigation onSubmit={add} />
      );
    }}
  </Mutation>
);

export default NewCourse;
