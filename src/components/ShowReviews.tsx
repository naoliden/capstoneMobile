import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  Spinner,
  Header,
  Container,
  Title,
  Right,
  Left,
  Body,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Button, Rating } from 'react-native-elements';
import { changeTutorModal, changeCourseModal } from '../actions';
import { BLUE, GRAY, WHITE } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    margin: 12,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontWeight: '400',
    fontSize: 20,
    padding: 10,
    color: GRAY,
  },
  comment: {
    fontSize: 15,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    color: GRAY,
    fontWeight: '300',
  },
});

class ShowReviews extends React.Component {
  public static propTypes = {
    dispatchChangeVisibilityCourse: PropTypes.func.isRequired,
    dispatchChangeVisibilityTutor: PropTypes.func.isRequired,
    modalType: PropTypes.string.isRequired,
    courseReviews: PropTypes.arrayOf(PropTypes.object),
    reviews: PropTypes.arrayOf(PropTypes.object),
  }

  public static defaultProps = {
    courseReviews: [],
    reviews: [],
  }

  private keyExtractor = (item: object) => String(item.id)

  private renderItem = ({ item }) => (
    <View style={styles.card}>
      <Rating
        imageSize={20}
        readonly
        startingValue={item.grade}
      />
      <Text style={styles.name}>{item.user.firstName} {item.user.lastName}</Text>
      <Text style={styles.comment}>&quot;{item.comment}&quot;</Text>
    </View>
  )

  public closeHandler(visible: boolean) {
    const {
      dispatchChangeVisibilityTutor,
      dispatchChangeVisibilityCourse,
      modalType,
    } = this.props;
    if (modalType === 'tutor') {
      dispatchChangeVisibilityTutor(visible);
    } else if (modalType === 'course') {
      dispatchChangeVisibilityCourse(visible);
    }
  }


  public render() {
    let reviewsList;
    const { reviews, courseReviews, modalType } = this.props;
    if (modalType === 'tutor') {
      reviewsList = reviews;
    } else if (modalType === 'course') {
      reviewsList = courseReviews;
    }
    return (
      <Container>
        <Header style={{ backgroundColor: BLUE }}>
          <Left>
            <Button
              icon={<MaterialIcons name="clear" size={32} color={WHITE} />}
              type="clear"
              onPress={() => {
                this.closeHandler(false);
              }}
            />
          </Left>
          <Body>
            <Title style={{ color: WHITE, fontWeight: '500' }}>Reviews</Title>
          </Body>
          <Right />
        </Header>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={reviewsList}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListEmptyComponent={<Text>No reviews yet!</Text>}
        />
      </Container>
    );
  }
}


const mapStateToProps = (state: object) => {
  const { visibleModalTutor, visibleModalCourse, courseReviews } = state.reviews;
  return { visibleModalTutor, visibleModalCourse, courseReviews };
};

const mapDispatchToProps = {
  dispatchChangeVisibilityTutor: changeTutorModal,
  dispatchChangeVisibilityCourse: changeCourseModal,
};

const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(ShowReviews);

const GET_REVIEWS = gql`
query tutorReviews($tutorId: Int!) {
  tutorReviews(tutorId: $tutorId) {
    id
    userId
    tutorId
    user{
      id
      firstName
      lastName
    }
    comment
    grade
  }
}
`;

const ShowReviewsQuery = ({ tutorId, modalType }) => (
  <Query query={GET_REVIEWS} variables={{ tutorId }}>
    {({ loading, error, data }) => {
      if (loading) return (<Spinner color="#3067BA" />);
      if (error) return (<Text> Error! {error.message} </Text>);
      return (
        <ConnectedComponent reviews={data.tutorReviews} modalType={modalType} />
      );
    }}
  </Query>
);

ShowReviewsQuery.propTypes = {
  tutorId: PropTypes.number,
  modalType: PropTypes.string.isRequired,
};

ShowReviewsQuery.defaultProps = {
  tutorId: 0,
};

export default ShowReviewsQuery;
