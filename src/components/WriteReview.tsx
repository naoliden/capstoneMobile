import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StyleSheet, TextInput } from 'react-native';
import {
  Container,
  Content,
  Text,
  Spinner,
} from 'native-base';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { Button, AirbnbRating } from 'react-native-elements';
import i18n from 'i18n-js';
import { showCourse } from '../actions';
import { BLUE, GRAY, LIGHT_GRAY } from '../config/colors';

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
    width: 200,
    marginTop: 10,
  },
  rating: {
    marginTop: 20,
    fontSize: 15,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 18,
    padding: 10,
    color: GRAY,
  },
  title: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '500',
    color: GRAY,
    alignSelf: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '500',
    color: GRAY,
  },
});

class WriteReview extends React.Component {
  public static propTypes = {
    onSubmitCourse: PropTypes.func.isRequired,
    onSubmitTutor: PropTypes.func.isRequired,
    navigation: PropTypes.shape(
      PropTypes.func.isRequired,
    ).isRequired,
  }

  public constructor(props) {
    super(props);
    this.state = {
      tutorRating: 5,
      classRating: 5,
      commentTutor: '',
      commentClass: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.ratingCompletedClass = this.ratingCompletedClass.bind(this);
    this.ratingCompletedTutor = this.ratingCompletedTutor.bind(this);
  }

  public ratingCompletedTutor(rating: number) {
    this.setState({
      tutorRating: rating,
    });
  }

  public ratingCompletedClass(rating: number) {
    this.setState({
      classRating: rating,
    });
  }

  public async handleSubmit() {
    const {
      tutorRating,
      classRating,
      commentTutor,
      commentClass,
    } = this.state;
    const {
      onSubmitTutor,
      onSubmitCourse,
      navigation,
    } = this.props;
    const userId = navigation.getParam('userId');
    const courseId = navigation.getParam('courseId');
    const tutorId = navigation.getParam('tutorId');
    const refetch = navigation.getParam('refetch');
    onSubmitTutor(
      userId,
      tutorId,
      commentTutor,
      tutorRating,
      navigation,
      refetch,
    );
    onSubmitCourse(
      userId,
      courseId,
      commentClass,
      classRating,
    );
  }


  public render() {
    const { commentTutor, commentClass } = this.state;
    return (
      <Container style={styles.container}>
        <Content style={{ paddingHorizontal: 20 }}>
          <Text style={styles.question}>{i18n.t('writeReview.tutorQuestion')}</Text>
          <AirbnbRating
            count={5}
            reviews={['Terrible', i18n.t('writeReview.bad'), 'OK', i18n.t('writeReview.good'), i18n.t('writeReview.amazing')]}
            defaultRating={5}
            size={30}
            style={styles.rating}
            onFinishRating={this.ratingCompletedTutor}
          />
          <TextInput
            editable
            style={styles.textArea}
            maxLength={400}
            multiline
            numberOfLines={4}
            placeholder={i18n.t('writeReview.comment')}
            onChangeText={text => this.setState({ commentTutor: text })}
            value={commentTutor}
          />
          <Text style={styles.question}>{i18n.t('writeReview.classQuestion')}</Text>
          <AirbnbRating
            count={5}
            reviews={['Terrible', i18n.t('writeReview.bad'), 'OK', i18n.t('writeReview.good'), i18n.t('writeReview.amazing')]}
            defaultRating={5}
            size={30}
            onFinishRating={this.ratingCompletedClass}
            style={styles.rating}
          />
          <TextInput
            editable
            maxLength={400}
            multiline
            style={styles.textArea}
            numberOfLines={4}
            placeholder={i18n.t('writeReview.comment')}
            onChangeText={text => this.setState({ commentClass: text })}
            value={commentClass}
          />
          <Button
            buttonStyle={styles.button}
            onPress={this.handleSubmit}
            title={i18n.t('writeReview.save')}
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


const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(WriteReview),
);

const CREATE_REVIEW_COURSE = gql`
  mutation createReview($userId: ID!, $courseId: ID!, $comment: String, $grade: Int!) {
    createReview(input: {userId: $userId, courseId: $courseId, comment: $comment, grade: $grade}){
    id
  }
}
`;

const CREATE_REVIEW_TUTOR = gql`
  mutation createTutorReview($userId: ID!, $tutorId: ID!, $comment: String, $grade: Int!) {
    createTutorReview(input: {userId: $userId, tutorId: $tutorId, comment: $comment, grade: $grade}){
    id
  }
}
`;

const CreateReview = () => (
  <Mutation mutation={CREATE_REVIEW_COURSE}>
    {(createReview, { loadingCourse, errorCourse }) => {
      const addCourseReview = async (
        userId: number,
        courseId: number,
        comment: string,
        grade: number,
      ) => {
        const reviewC = await createReview({
          variables: {
            userId,
            courseId,
            comment,
            grade,
          },
        });
        return reviewC.data;
      };
      if (errorCourse) {
        return (<Text> Error! {errorCourse.message} </Text>);
      }
      return (
        <Mutation mutation={CREATE_REVIEW_TUTOR}>
          {(createTutorReview, { loadingTutor, errorTutor }) => {
            const addTutorReview = async (
              userId: number,
              tutorId: number,
              comment: string,
              grade: number,
              navigation,
              refetch,
            ) => {
              await createTutorReview({
                variables: {
                  userId,
                  tutorId,
                  comment,
                  grade,
                },
              });
              refetch();
              navigation.goBack();
            };
            if (loadingTutor || loadingCourse) {
              return (<Spinner color="#3067BA" />);
            } if (errorTutor) {
              return (<Text> Error! {errorTutor.message} </Text>);
            }
            return (
              <ComponentWithNavigation
                onSubmitCourse={addCourseReview}
                onSubmitTutor={addTutorReview}
              />
            );
          }}
        </Mutation>
      );
    }}
  </Mutation>
);

export default CreateReview;
