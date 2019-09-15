import { Agenda } from 'react-native-calendars';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withNavigation } from 'react-navigation';
import { StyleSheet, View } from 'react-native';
import { Spinner } from 'native-base';
import { Text } from 'react-native-elements';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

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

function renderItem(item) {
  let color;
  let text;
  if (item.reserved === 'true') {
    color = 'red';
    text = 'Reserved';
  } else if (item.reserved === 'false') {
    color = 'green';
    text = 'Available';
  }
  return (
    <View style={[styles.itemContainer, { backgroundColor: color }]}>
      <Text style={styles.itemHour}>
        {String(item.hour).slice(0, 5)} -
        {' '.concat((parseInt(String(item.hour).slice(0, 2), 10) + 1).toString(10))}:00
      </Text>
      <Text style={styles.itemReserved}>{text}</Text>
    </View>
  );
}

class TutorAvailability extends React.Component {
  public constructor(props) {
    super(props);
    this.parseItems = this.parseItems.bind(this);
    this.loadItems = this.loadItems.bind(this);
    this.state = {
      items: {},
      today: false,
    };
  }

  public parseItems(day) {
    const { availability } = this.props;
    const availabilitiesLen = Object.keys(availability).length;
    const items = {};

    for (let i = -15; i < 85; i += 1) {
      const time = day.timestamp + i * 24 * 60 * 60 * 1000;
      const strTime = timeToString(time);
      if (!items[strTime]) {
        items[strTime] = [];
      }
    }
    for (let i = 0; i < availabilitiesLen; i += 1) {
      if (!items[availability[i].date]) {
        items[availability[i].date] = [];
      }
    }
    for (let i = 0; i < availabilitiesLen; i += 1) {
      items[availability[i].date].push({
        hour: availability[i].hour,
        reserved: availability[i].reserved,
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

  public render() {
    const { networkStatus, refetch } = this.props;
    const { items } = this.state;
    return (
      <Agenda
        items={items}
        loadItemsForMonth={this.loadItems}
        renderItem={renderItem}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}><Text>No available hours!</Text></View>
        )}
        rowHasChanged={(r1, r2) => (r1 !== r2)}
        refreshing={networkStatus === 4}
        onRefresh={() => this.handleRefresh(refetch)}
      />
    );
  }
}

TutorAvailability.propTypes = {
  availability: PropTypes.arrayOf(PropTypes.shape({
    hour: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    reserved: PropTypes.string.isRequired,
  })).isRequired,
  refetch: PropTypes.func.isRequired,
  networkStatus: PropTypes.number.isRequired,
};

// TutorAvailability.defaultProps = {
//   availability: Object(),
// };
const ComponentWithNavigation = withNavigation(TutorAvailability);


const GET_AVAILABILITIES = gql`
query tutorAvailabilities($tutorId : Int) {
    tutorAvailabilities(input: { tutorId : $tutorId }) {
      id
      hour
      date
      reserved
    }
  }
`;

const Availabilities = ({ tutorId }) => (
  <Query query={GET_AVAILABILITIES} notifyOnNetworkStatusChange variables={{ tutorId }}>
    {({
      loading, error, data, refetch, networkStatus,
    }) => {
      if (loading && networkStatus !== 4) return (<Spinner color="#3067BA" />);
      if (error) return (<Text> Error! {error.message} </Text>);
      return (
        <ComponentWithNavigation
          availability={data.tutorAvailabilities}
          refetch={refetch}
          networkStatus={networkStatus}
        />
      );
    }}
  </Query>
);

Availabilities.propTypes = {
  tutorId: PropTypes.number.isRequired,
};

export default Availabilities;
