/* eslint-disable react/prefer-stateless-function */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import {
  Query, compose, graphql,
} from 'react-apollo';
import { Spinner } from 'native-base';
import {
  Image,
  Divider,
  Button,
  Avatar,
} from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import i18n from 'i18n-js';
import { parseDate } from './ProfileUtils';
import {
  BLUE,
  GRAY,
  LIGHT_GRAY,
  GREEN,
} from '../config/colors';

const { width } = Dimensions.get('window');

export const GET_RESERVATION = gql`
  query classReservation($id: Int!) {
    classReservation(id: $id) {
      id
      userId
      transactionId
      user{
        id
        firstName
        lastName
        photo
      }
      course{
        id
        name
        address
        city
        country
        price
        currency
        images{
          url
        }
        tutor{
          id
          user{
            id
            firstName
            lastName
            photo
          }
        }
      }
      tutorAvailability{
        id
        hour
        date
      }
      classDone
    }
  }
`;

const REVIEW_EXISTS = gql`
query existCourseUserReview($userId: ID!, $courseId: ID!) {
  existCourseUserReview(input: {userId: $userId, courseId: $courseId}) {
    status
  }
}
`;

const DISPUTE_EXISTS = gql`
query existReservationUserRequest($transactionId: Int!, $classReservationId: Int!) {
  existReservationUserRequest(input: {transactionId: $transactionId, classReservationId: $classReservationId}) {
    status
  }
}
`;

const DELETE_RESERVATION = gql`
mutation deleteReservation($id: Int!) {
  deleteReservation(input: {id: $id}){
    id
  }
}
`;

const SET_TO_PAYED = gql`
mutation classDone($id: Int!) {
  classDone(id: $id){
    id
    paymentMethod
    classDone
    tutorId
  }
}
`;

const styles = StyleSheet.create({
  titleDataLocation: {
    fontSize: 16,
    color: GRAY,
    fontWeight: '300',
    width: '80%',
    marginLeft: 5,
  },
  titleData: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
  },
  courseName: {
    fontSize: 25,
    color: GRAY,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 20,
    color: GRAY,
  },
  date: {
    fontWeight: '500',
    fontSize: 20,
    color: GREEN,
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    margin: 10,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    marginLeft: 25,
    marginRight: 25,
  },
  scrollContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyData: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    flex: 1,
    flexDirection: 'row',
  },
  avatarArea: {
    width: '25%',
  },
  tutorInfoArea: {
    width: '75%',
    marginLeft: 5,
  },
  iconLocation: {
    width: '20%',
  },
  wrapperLocation: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },
  cancelledText: {
    fontSize: 20,
    marginTop: 50,
    alignSelf: 'center',
  },
});

class Reservation extends React.Component {
  public static propTypes = {
    mode: PropTypes.bool,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    classReservation: PropTypes.shape({
      user: PropTypes.object.isRequired,
      course: PropTypes.object.isRequired,
    }).isRequired,
    deleteReservation: PropTypes.func.isRequired,
    classDone: PropTypes.func.isRequired,
  }

  public static defaultProps = {
    mode: false,
  }

  public constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.isTutorName = this.isTutorName.bind(this);
    this.showReviewButton = this.showReviewButton.bind(this);
    this.showDisputeButton = this.showDisputeButton.bind(this);
    this.showCancelButton = this.showCancelButton.bind(this);
    this.showClassDoneButton = this.showClassDoneButton.bind(this);
    this.delete = this.delete.bind(this);
    this.done = this.done.bind(this);
  }

  private isTutorName() {
    const { mode, classReservation } = this.props;
    if (mode) {
      const { user } = classReservation;
      const { firstName, lastName } = user;
      return (
        <Text style={styles.headerSubtitle}>{i18n.t('reservation.student')} {firstName} {lastName}</Text>
      );
    }
    const { course } = classReservation;
    const { tutor } = course;
    const { user } = tutor;
    const { firstName, lastName } = user;
    return (
      <Text style={styles.headerSubtitle}>{i18n.t('reservation.tutor')} {firstName} {lastName}</Text>
    );
  }

  private isTutorImage() {
    const { mode, classReservation } = this.props;
    if (mode) {
      const { user } = classReservation;
      const { photo } = user;
      if (photo !== null) {
        return photo;
      }
      return 'https://bootdey.com/img/Content/avatar/avatar2.png';
    }
    const { course } = classReservation;
    const { tutor } = course;
    const { user } = tutor;
    const { photo } = user;
    if (photo !== null) {
      return photo;
    }
    return 'https://bootdey.com/img/Content/avatar/avatar2.png';
  }

  private showReviewButton() {
    const { mode, classReservation, navigation } = this.props;
    const { course, userId, classDone } = classReservation;
    const { tutor } = course;
    const courseId = course.id;
    if (!mode && classDone) {
      return (
        <Query query={REVIEW_EXISTS} variables={{ userId, courseId }}>
          {({
            loading,
            error,
            data,
            refetch,
          }) => {
            if (loading) return (<View />);
            if (error) return (<Text> Oops, Error! {error.message} </Text>);
            if (data.existCourseUserReview.status === 'false') {
              return (
                <Button
                  title={i18n.t('reservation.writeReview')}
                  onPress={() => navigation.navigate('AddReview', {
                    userId,
                    courseId: course.id,
                    tutorId: tutor.id,
                    refetch,
                  })}
                  buttonStyle={styles.button}
                />
              );
            }
            return (
              <View />
            );
          }}
        </Query>
      );
    }
    return (
      <View />
    );
  }

  private showDisputeButton() {
    const { mode, classReservation, navigation } = this.props;
    const { id, classDone } = classReservation;
    const transactionId = parseInt(classReservation.transactionId, 10);
    const classReservationId = parseInt(id, 10);
    if (!mode && transactionId !== -1 && classDone) {
      return (
        <Query query={DISPUTE_EXISTS} variables={{ transactionId, classReservationId }}>
          {({
            loading,
            error,
            data,
            refetch,
          }) => {
            if (loading) return (<View />);
            if (error) return (<Text> Oops, Error! {error.message} </Text>);
            if (data.existReservationUserRequest.status === 'false') {
              return (
                <Button
                  title={i18n.t('reservation.openDispute')}
                  buttonStyle={styles.button}
                  onPress={() => navigation.navigate('Dispute', {
                    id,
                    transactionId,
                    refetch,
                  })}
                />
              );
            }
            return (
              <View />
            );
          }}
        </Query>
      );
    }
    return (
      <View />
    );
  }

  private showCancelButton() {
    const { classReservation, mode, navigation } = this.props;
    const { loading } = this.state;
    const { classDone } = classReservation;
    const past = navigation.getParam('past');
    if ((!classDone && !mode) || (mode && !past)) {
      return (
        <Button
          title={i18n.t('reservation.cancelReservation')}
          buttonStyle={styles.button}
          loading={loading}
          onPress={() => Alert.alert(
            i18n.t('reservation.alertConfirmation'),
            '',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              { text: 'OK', onPress: () => this.delete() },
            ],
            { cancelable: false },
          )}
        />
      );
    }
    return (
      <View />
    );
  }

  private showClassDoneButton() {
    const { classReservation, mode, navigation } = this.props;
    const { loading } = this.state;
    const { classDone } = classReservation;
    const past = navigation.getParam('past');
    if (mode && past && !classDone) {
      return (
        <Button
          title="Marcar clase como hecha"
          buttonStyle={styles.button}
          loading={loading}
          onPress={() => this.done()}
        />
      );
    }
    return (
      <View />
    );
  }

  private async done() {
    const { classReservation, navigation, classDone } = this.props;
    const { id } = classReservation;
    const intId = parseInt(id, 10);
    this.setState({ loading: true });
    classDone({ variables: { id: intId } }).then(() => {
      navigation.goBack();
    }).catch(() => {
      this.setState({ loading: false });
      Alert.alert(
        i18n.t('reservation.alertError'),
        '',
        [
          { text: 'OK' },
        ],
        { cancelable: false },
      );
    });
  }

  private async delete() {
    const { classReservation, navigation, deleteReservation } = this.props;
    const { id } = classReservation;
    const intId = parseInt(id, 10);
    this.setState({ loading: true });
    const refetch = navigation.getParam('refetch');
    deleteReservation({ variables: { id: intId } }).then(() => {
      navigation.goBack();
      refetch();
    }).catch(() => {
      this.setState({ loading: false });
      Alert.alert(
        i18n.t('reservation.alertError'),
        '',
        [
          { text: 'OK' },
        ],
        { cancelable: false },
      );
    });
  }

  public render() {
    const {
      classReservation,
    } = this.props;
    const {
      course,
      tutorAvailability,
    } = classReservation;
    const {
      name,
      address,
      city,
      country,
      price,
      currency,
      images,
    } = course;
    const {
      date,
      hour,
    } = tutorAvailability;
    return (
      <View>
        <ScrollView>
          {(images.length === 0) && (
            <Image
              source={{ uri: 'https://online-learning.harvard.edu/sites/default/files/styles/header/public/course/asset-v1_HarvardX%2BCalcAPL1x%2B2T2017%2Btype%40asset%2Bblock%40TITLE-Calculus-Applied-2120x1192-NO-SPOTLIGHT%202.png?itok=crWwjmVi' }}
              style={{ width: 400, height: 200 }}
              resizeMode="cover"
            />
          )}
          {(images && images.length === 1) && (
            <Image
              source={{ uri: images[0].url }}
              style={{ width: 400, height: 200 }}
              resizeMode="cover"
            />
          )}
          {(images && images.length > 1) && (
            <View
              style={styles.scrollContainer}
            >
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={(ref) => { this.scrollView = ref; }}
              >
                {images.map((item: object, key) => (
                  <Image
                    source={{ uri: item.url }}
                    style={{ width, height: 200 }}
                    key={String(key).concat(item.image)}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
          <View style={styles.titleData}>
            <Text style={styles.date}>{parseDate(date)}, {hour}</Text>
            <Text style={styles.courseName}>{name}</Text>
            <Text style={styles.headerSubtitle}>{currency} ${price}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.bodyData}>
            <View style={styles.avatarArea}>
              <Avatar
                rounded
                size="large"
                source={{ uri: this.isTutorImage() }}
              />
            </View>
            <View style={styles.tutorInfoArea}>
              {this.isTutorName()}
              <View style={styles.wrapperLocation}>
                <Ionicons
                  name="ios-pin"
                  size={18}
                  color={GRAY}
                  iconStyle={styles.iconLocation}
                />
                <Text style={styles.titleDataLocation}>{address}, {city}, {country}</Text>
              </View>
            </View>
          </View>
          <Divider style={styles.divider} />
          {this.showReviewButton()}
          {this.showDisputeButton()}
          {this.showCancelButton()}
          {this.showClassDoneButton()}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { user, mode } = state.login;
  const { tutorId } = user;
  return {
    tutorId,
    mode,
  };
};

const ComponentWithNavigation = withNavigation(
  compose(
    graphql(DELETE_RESERVATION, { name: 'deleteReservation' }),
    graphql(SET_TO_PAYED, { name: 'classDone' }),
    connect(mapStateToProps, null),
  )(Reservation),
);

const ShowReservation = ({ reservationId }) => {
  const id = parseInt(reservationId, 10);
  return (
    <Query query={GET_RESERVATION} variables={{ id }}>
      {({
        loading,
        error,
        data,
      }) => {
        if (loading) return (<Spinner color="#3067BA" />);
        if (error) {
          return (
            <Text style={styles.cancelledText}> This reservation has been cancelled </Text>
          );
        }
        if (data.classReservation === null) {
          return (<Text style={styles.cancelledText}> This reservation has been cancelled </Text>);
        }
        return (
          <ComponentWithNavigation classReservation={data.classReservation} />
        );
      }}
    </Query>
  );
};

ShowReservation.propTypes = {
  reservationId: PropTypes.number.isRequired,
};

export default ShowReservation;
