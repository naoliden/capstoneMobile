import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet, View, FlatList,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { CourseCard } from './ProfileUtils';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  title: {
    margin: 12,
    fontSize: 20,
  },
});

class ListItems extends React.Component {
  public static propTypes = {
    dispatchShowItem: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    refetch: PropTypes.func.isRequired,
    networkStatus: PropTypes.number.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    tutor: PropTypes.bool,
    reservation: PropTypes.bool,
    past: PropTypes.bool,
  }

  public static defaultProps = {
    past: false,
    reservation: null,
    tutor: false,
  }

  private onPressItem = (id: string, reservationId: string) => {
    const {
      tutor,
      dispatchShowItem,
      navigation,
      refetch,
      reservation,
      past,
    } = this.props;
    const rID = parseInt(reservationId, 10);
    if (tutor && !reservation) {
      dispatchShowItem(parseInt(id, 10));
      navigation.navigate('Course');
    } else {
      navigation.navigate('Reservation', {
        reservationId: rID,
        refetch,
        past,
      });
    }
  }

  public async handleRefresh(refetch) {
    await refetch();
    this.forceUpdate();
  }

  private renderItem = ({ item }) => {
    const { reservation, tutor } = this.props;
    const { course } = item;
    const { id: reservationId } = item;
    let target;
    let user;
    if (course) {
      target = course;
    } else {
      target = item;
    }
    const { id } = target;
    if (tutor) {
      user = item.user;
    } else {
      user = item.course.tutor.user;
    }
    return (
      <CourseCard
        onPress={() => this.onPressItem(id, reservationId, item)}
        item={target}
        date={item.tutorAvailability}
        reservation={reservation}
        user={user}
        classDone={item.classDone}
        tutor={tutor}
      />

    );
  }

  public render() {
    const {
      networkStatus,
      refetch,
      items,
    } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={items}
          keyExtractor={(item, index) => String(index)}
          renderItem={this.renderItem}
          refreshing={networkStatus === 4}
          onRefresh={() => this.handleRefresh(refetch)}
        />
      </View>
    );
  }
}

export default withNavigation(ListItems);
