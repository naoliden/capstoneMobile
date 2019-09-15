import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Spinner } from 'native-base';
import { withNavigation } from 'react-navigation';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { Rating, Button } from 'react-native-elements';
import i18n from 'i18n-js';
import { Ionicons } from '@expo/vector-icons';
import ShowReviews from './ShowReviews';
import { changeTutorModal } from '../actions';
import {
  BLUE,
  GRAY,
} from '../config/colors';

const styles = StyleSheet.create({
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 80,
  },
  bodyContent: {
    padding: 25,
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    color: GRAY,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#3067BA',
    height: 150,
  },
  body: {
    marginTop: 40,
  },
  subtitle: {
    color: GRAY,
    fontSize: 18,
    alignSelf: 'flex-start',
    paddingVertical: 15,
  },
  description: {
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  availability: {
    color: BLUE,
    fontSize: 18,
  },
});

class TutorProfileComponent extends React.Component {
  public static propTypes = {
    tutor: PropTypes.shape({
      id: PropTypes.string.isRequired,
      specialty: PropTypes.string.isRequired,
      user: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    dispatchChangeVisibility: PropTypes.func.isRequired,
    visibleModalTutor: PropTypes.bool.isRequired,
  };

  public constructor(props) {
    super(props);
    this.ratingHandler(false);
  }

  public ratingHandler(visible: boolean) {
    const { dispatchChangeVisibility } = this.props;
    dispatchChangeVisibility(visible);
  }

  private showRating() {
    const { tutor } = this.props;
    const { numberOfReviewsRecived, gradeAverage } = tutor;
    if (numberOfReviewsRecived > 0) {
      return (
        <TouchableWithoutFeedback
          style={{ flex: 1 }}
          onPress={() => {
            this.ratingHandler(true);
          }}
        >
          <View style={styles.ratingContainer}>
            <Rating
              imageSize={20}
              readonly
              startingValue={gradeAverage}
            />
            <Text style={{ fontSize: 20, color: BLUE }}>({numberOfReviewsRecived})</Text>
          </View>
        </TouchableWithoutFeedback>
      );
    }
    return (
      <View />
    );
  }

  public render() {
    const {
      tutor,
      navigation,
      visibleModalTutor,
    } = this.props;
    let sourcePicture;
    if (tutor.user.photo) {
      sourcePicture = tutor.user.photo;
    } else {
      sourcePicture = 'https://bootdey.com/img/Content/avatar/avatar2.png';
    }
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={visibleModalTutor}
        >
          <ShowReviews tutorId={parseInt(tutor.id, 10)} modalType="tutor" />
        </Modal>
        <View style={styles.header} />
        <Image style={styles.avatar} source={{ uri: sourcePicture }} />
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <Text selectable style={styles.name}>{tutor.user.firstName} {tutor.user.lastName}</Text>
            {this.showRating()}
            <Text selectable style={styles.subtitle}>{i18n.t('myProfile.educationalBackground')}</Text>
            <Text selectable style={styles.description}>{i18n.t('myProfile.description')}{tutor.description}</Text>
            <Text selectable style={styles.description}>{i18n.t('myProfile.education')}{tutor.education}</Text>
            <Text selectable style={styles.description}>{i18n.t('myProfile.specialty')}{tutor.specialty}</Text>
            <Text selectable style={styles.description}>{i18n.t('myProfile.teachingMethod')}{tutor.teachingMethod}</Text>
            <Button
              title="See availability    "
              type="clear"
              icon={(
                <Ionicons
                  name="md-calendar"
                  size={22}
                  color={BLUE}
                />
              )}
              iconRight
              titleStyle={styles.availability}
              onPress={() => navigation.navigate('ShowAvailability', {
                tutorId: tutor.id,
              })}
            />
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { visibleModalTutor } = state.reviews;
  return { visibleModalTutor };
};

const mapDispatchToProps = {
  dispatchChangeVisibility: changeTutorModal,
};

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(TutorProfileComponent),
);

const GET_TUTOR = gql`
  query tutor($id: Int!) {
    tutor(id: $id) {
      id
      description
      education
      teachingMethod
      specialty
      numberOfReviewsRecived
      gradeAverage
      user{
        id
        firstName
        lastName
        email
        photo
      }
    }
  }
`;

const ShowTutor = ({ id }) => (
  <Query query={GET_TUTOR} variables={{ id }}>
    {({ loading, error, data }) => {
      if (loading) return (<Spinner color="#3067BA" />);
      if (error) return (<Text> Oops, Error! {error.message} </Text>);
      return (
        <ComponentWithNavigation tutor={data.tutor} />
      );
    }}
  </Query>
);

ShowTutor.propTypes = {
  id: PropTypes.number.isRequired,
};

export default ShowTutor;
