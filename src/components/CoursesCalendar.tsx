import { Agenda } from 'react-native-calendars';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withNavigation } from 'react-navigation';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Spinner } from 'native-base';
import { Text } from 'react-native-elements';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { BLUE } from '../config/colors';

const _ = require('lodash');

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemHour: {
    fontSize: 15,
    color: 'white',
    marginBottom: 15,
    fontWeight: '300',
  },
  itemReserved: {
    fontSize: 20,
    color: 'white',
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});

function timeToString(time) {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
}

class CoursesCalendar extends React.Component {
  public static propTypes = {
    refetch: PropTypes.func.isRequired,
    networkStatus: PropTypes.number.isRequired,
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  public constructor(props) {
    super(props);
    this.parseItems = this.parseItems.bind(this);
    this.loadItems = this.loadItems.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.state = {
      items: {},
      today: false,
    };
  }

  public parseItems(day) {
    const { courses } = this.props;
    const availabilitiesLen = Object.keys(courses).length;
    const items = {};

    for (let i = -15; i < 85; i += 1) {
      const time = day.timestamp + i * 24 * 60 * 60 * 1000;
      const strTime = timeToString(time);
      if (!items[strTime]) {
        items[strTime] = [];
      }
    }
    for (let i = 0; i < availabilitiesLen; i += 1) {
      if (!items[courses[i].tutorAvailability.date]) {
        items[courses[i].tutorAvailability.date] = [];
      }
    }
    for (let i = 0; i < availabilitiesLen; i += 1) {
      items[courses[i].tutorAvailability.date].push({
        reservationId: courses[i].id,
        name: courses[i].course.name,
        hour: courses[i].tutorAvailability.hour,
      });
    }
    const itemsLen = Object.keys(items).length;
    for (let i = 0; i < itemsLen; i += 1) {
      const arr = _.orderBy(items[Object.keys(items)[i]], 'hour', 'asc');
      items[Object.keys(items)[i]] = arr;
    }

    const newItems = {};
    Object.keys(items).forEach((key) => { newItems[key] = items[key]; });
    return newItems;
  }

  public loadItems(day) {
    const newItems = {};
    const items = this.parseItems(day);
    Object.keys(items).forEach((key) => { newItems[key] = items[key]; });
    this.setState({
      items: newItems,
      today: day,
    });
  }

  public async handleRefresh(refetch) {
    await refetch();
    const { today } = this.state;
    this.loadItems(today);
  }

  public renderItem(item) {
    const { navigation, refetch } = this.props;
    const { reservationId } = item;
    const rID = parseInt(reservationId, 10);
    return (
      <TouchableOpacity onPress={() => navigation.navigate('Reservation', {
        reservationId: rID,
        refetch,
      })}
      >
        <View style={[styles.itemContainer, { backgroundColor: BLUE }]}>
          <Text style={styles.itemHour}>
            {String(item.hour).slice(0, 5)} -
            {' '.concat((parseInt(String(item.hour).slice(0, 2), 10) + 1).toString(10))}:00
          </Text>
          <Text style={styles.itemReserved} numberOfLines={1}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  public render() {
    const { refetch, networkStatus } = this.props;
    const { items } = this.state;
    return (
      <Agenda
        items={items}
        loadItemsForMonth={this.loadItems}
        renderItem={this.renderItem}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text style={{ fontWeight: '300' }}>No classes this day</Text>
          </View>
        )}
        rowHasChanged={(r1, r2) => (r1 !== r2)}
        refreshing={networkStatus === 4}
        onRefresh={() => this.handleRefresh(refetch)}
      />
    );
  }
}

const ComponentWithNavigation = withNavigation(CoursesCalendar);

const GET_COURSES_TUTOR = gql`
query classReservationsFilterByTutor($tutorId : Int) {
  classReservationsFilterByTutor (input: { tutorId : $tutorId }) {
      id
      userId
      courseId
      course{
        id
        name
      }
      tutorAvailability{
        id
        date
        hour
        reserved
      }
    }
  }
`;

const GET_RESERVATIONS_BY_USER = gql`
  query classReservationsFilterByUser($id: Int!) {
    classReservationsFilterByUser(id: $id) {
      id
      course {
        id
        name
        description
      }
      tutorAvailability {
        id
        date
        hour
      }
    }
  }
`;

const CoursesQuery = ({ id, tutor }) => {
  if (tutor) {
    return (
      <Query
        query={GET_COURSES_TUTOR}
        notifyOnNetworkStatusChange
        variables={{ tutorId: id }}
      >
        {({
          loading,
          error,
          data,
          refetch,
          networkStatus,
        }) => {
          if (loading && networkStatus !== 4) return (<Spinner color="#3067BA" />);
          if (error) return (<Text> Error! {error.message} </Text>);
          return (
            <ComponentWithNavigation
              courses={data.classReservationsFilterByTutor}
              refetch={refetch}
              networkStatus={networkStatus}
            />
          );
        }}
      </Query>
    );
  }
  return (
    <Query
      query={GET_RESERVATIONS_BY_USER}
      variables={{ id }}
      notifyOnNetworkStatusChange
    >
      {({
        loading,
        error,
        data,
        refetch,
        networkStatus,
      }) => {
        if (loading && networkStatus !== 4) return (<Spinner color={BLUE} />);
        if (error) return (<Text>Error! {error.message}</Text>);
        return (
          <ComponentWithNavigation
            courses={data.classReservationsFilterByUser}
            refetch={refetch}
            networkStatus={networkStatus}
          />
        );
      }}
    </Query>
  );
};

CoursesQuery.propTypes = {
  id: PropTypes.number.isRequired,
  tutor: PropTypes.bool.isRequired,
};

export default CoursesQuery;
