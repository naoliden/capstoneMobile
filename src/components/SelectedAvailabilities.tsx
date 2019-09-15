import * as React from 'react';
import * as PropTypes from 'prop-types';
import i18n from 'i18n-js';
import {
  View, FlatList, StyleSheet, Text,
} from 'react-native';
import { RED, GRAY } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  titleHours: {
    paddingVertical: 10,
    fontWeight: '500',
    fontSize: 16,
    color: GRAY,
    marginLeft: 20,
  },
  chosenHours: {
    paddingHorizontal: 20,
    fontSize: 16,
    paddingVertical: 5,
    color: GRAY,
  },
  noHoursChosen: {
    paddingHorizontal: 20,
    fontSize: 16,
    color: RED,
    fontWeight: '300',
  },
});

class SelectedAvailabilities extends React.Component {
  public static propTypes = {
    selected: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  private renderItem = ({ item }) => {
    const { date, hour } = item;
    return (
      <Text style={styles.chosenHours}> {hour} / {date}</Text>
    );
  }

  public render() {
    const { selected } = this.props;
    return (
      <View>
        <Text style={styles.titleHours}>{i18n.t('selectedAvailabilities.shoppingCart')}</Text>
        <FlatList
          contentContainerStyle={styles.container}
          data={selected}
          renderItem={this.renderItem}
          ListEmptyComponent={<Text style={styles.noHoursChosen}>No hours selected yet</Text>}
          keyExtractor={(item, index) => index.toString()}
        />

      </View>
    );
  }
}

export default SelectedAvailabilities;
