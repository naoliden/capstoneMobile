import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { Button } from 'react-native-elements';
import { Mutation, Query } from 'react-apollo';
import { Spinner } from 'native-base';
import { withNavigation } from 'react-navigation';
import { BLUE, GRAY } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 20,
    marginVertical: 8,
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
  button: {
    backgroundColor: BLUE,
    width: 150,
    alignSelf: 'center',
    marginTop: 20,
  },
  details: {
    fontSize: 16,
    color: GRAY,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  title: {
    fontWeight: '500',
    fontSize: 16,
    color: GRAY,
    marginBottom: 10,
  },
});

export const GET_PENDING_PAYMENTS = gql`
query classReservations($pastReservation: Boolean, $tutorId: Int!){
  classReservations(input: {pastReservation: $pastReservation, tutorId: $tutorId, classDone: false}){
    id
    course{
      id
      name
      price
      currency
      description
      images {
        courseId
        url
      }
    }
    tutorAvailability{
      id
      date
      hour
    }
    user{
      id
      firstName
      lastName
    }
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

const handleError = () => {
  Alert.alert('There was an error.');
};

const handleRefresh = async (refetch) => {
  await refetch();
};

class PendingPayment extends Component {
  public static propTypes = {
    networkStatus: PropTypes.number.isRequired,
    refetch: PropTypes.func.isRequired,
    pendingCourses: PropTypes.arrayOf(PropTypes.object),
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  public static defaultProps = {
    pendingCourses: [],
  }

  private keyExtractor = (item: object) => String(item.id);

  private handleCompletion() {
    const { refetch } = this.props;
    Alert.alert('You have set this course status as done');
    refetch();
  }

  private renderItem = ({ item }) => {
    const {
      course, tutorAvailability, user, id,
    } = item;
    const parsedId = parseInt(id, 10);
    let target;
    if (course) {
      target = course;
    } else {
      target = item;
    }
    const { name, price } = target;
    const { date, hour } = tutorAvailability;
    const { firstName, lastName } = user;
    return (
      <TouchableWithoutFeedback>
        <View style={styles.card}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.details}>Student: {firstName} {lastName}</Text>
          <Text style={styles.details}>Course was dictated at {hour}, {date} </Text>
          <Text style={styles.details}>Total to pay: ${price} </Text>
          <Mutation
            mutation={SET_TO_PAYED}
            variables={{ id: parsedId }}
            onError={handleError}
            onCompleted={() => this.handleCompletion()}
          >
            {setToPayedMutation => (
              <Button
                onPress={() => setToPayedMutation()}
                title="Mark as Done"
                buttonStyle={styles.button}
              />
            )}
          </Mutation>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  public render() {
    const {
      refetch,
      networkStatus,
      pendingCourses,
    } = this.props;

    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={pendingCourses}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          refreshing={networkStatus === 4}
          onRefresh={() => handleRefresh(refetch)}
          ListEmptyComponent={<Text>You have no pending payments!</Text>}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  const { tutorId } = user;
  return {
    tutorId,
    user,
  };
};

const ConnectedComponent = withNavigation(connect(mapStateToProps, null)(PendingPayment));

const PendingPaymentQuery = ({ id }) => {
  const tutorId = id;
  const pastReservation = true;
  return (
    <Query
      query={GET_PENDING_PAYMENTS}
      variables={{ pastReservation, tutorId }}
      notifyOnNetworkStatusChange
    >
      {({
        loading, error, data, refetch, networkStatus,
      }) => {
        if (loading && networkStatus !== 4) return (<Spinner color={BLUE} />);
        if (error) return (<Text> Error! {error.message} </Text>);
        return (
          <ConnectedComponent
            pendingCourses={data.classReservations}
            refetch={refetch}
            networkStatus={networkStatus}
          />
        );
      }}
    </Query>
  );
};

PendingPaymentQuery.propTypes = {
  id: PropTypes.number.isRequired,
};

export default PendingPaymentQuery;
