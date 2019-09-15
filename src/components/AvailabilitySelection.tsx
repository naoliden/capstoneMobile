import { Calendar } from 'react-native-calendars';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withNavigation } from 'react-navigation';
import {
  StyleSheet, View, ScrollView, Alert,
} from 'react-native';
import { Spinner } from 'native-base';
import { CheckBox, Text, Button } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { connect } from 'react-redux';
import { logout } from '../actions';
import { BLUE } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  containerCalendar: {
    justifyContent: 'center',
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  titleDates: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    fontWeight: 'bold',
    fontSize: 15,
  },
  titleHours: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: BLUE,
    width: 300,
    alignSelf: 'center',
    margin: 15,
  },
});

const listHours = ['07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00'];
const hours = {
  '07:00': false,
  '08:00': false,
  '09:00': false,
  '10:00': false,
  '11:00': false,
  '12:00': false,
  '13:00': false,
  '14:00': false,
  '15:00': false,
  '16:00': false,
  '17:00': false,
  '18:00': false,
  '19:00': false,
  '20:00': false,
  '21:00': false,
};

class AvailabilitySelection extends React.Component {
  public constructor(props) {
    super(props);
    this.state = {
      marked: Object(),
      selectedDate: false,
      selectedHour: false,
      checked: {
        '07:00': hours['07:00'],
        '08:00': hours['08:00'],
        '09:00': hours['09:00'],
        '10:00': hours['10:00'],
        '11:00': hours['11:00'],
        '12:00': hours['12:00'],
        '13:00': hours['13:00'],
        '14:00': hours['14:00'],
        '15:00': hours['15:00'],
        '16:00': hours['16:00'],
        '17:00': hours['17:00'],
        '18:00': hours['18:00'],
        '19:00': hours['19:00'],
        '20:00': hours['20:00'],
        '21:00': hours['21:00'],
      },
    };
    this.onDayPressHandler = this.onDayPressHandler.bind(this);
    this.checkboxPressHandler = this.checkboxPressHandler.bind(this);
    this.saveHandler = this.saveHandler.bind(this);
    this.toggleSaveButtonState = this.toggleSaveButtonState.bind(this);
  }

  public onDayPressHandler(day) {
    const { marked } = this.state;
    const markedDates = Object.keys(marked);
    if (!markedDates.includes(day.dateString)) {
      markedDates.push(day.dateString);
    } else {
      for (let i = 0; i < markedDates.length; i += 1) {
        if (markedDates[i] === day.dateString) {
          markedDates.splice(i, 1);
        }
      }
    }
    const obj = markedDates.reduce(
      (c, v) => Object.assign(c, { [v]: { selected: true, marked: true } }), {},
    );
    this.setState({ marked: obj });
    if (markedDates.length > 0) {
      this.setState({ selectedDate: true });
    } else if (markedDates.length <= 0) {
      this.setState({ selectedDate: false });
    }
  }

  public checkboxPressHandler(hour: string) {
    const { checked } = this.state;
    const newChecked = checked;
    newChecked[hour] = !checked[hour];
    this.setState({ checked: newChecked });
    const checkedHours = Object.values(checked);
    if (checkedHours.includes(true)) {
      this.setState({ selectedHour: true });
    } else {
      this.setState({ selectedHour: false });
    }
  }

  public saveHandler() {
    const {
      onSubmit, navigation, user,
    } = this.props;
    const { marked, checked } = this.state;
    const { tutorId } = user;
    const markedLen = Object.keys(marked).length;
    const checkedLen = Object.keys(checked).length;
    for (let h = 0; h < markedLen; h += 1) {
      for (let k = 0; k < checkedLen; k += 1) {
        if (checked[Object.keys(checked)[k]]) {
          const date = Object.keys(marked)[h];
          const hour = Object.keys(checked)[k];
          onSubmit(
            tutorId,
            date,
            hour,
            navigation,
          );
        }
      }
    }
  }

  private toggleSaveButtonState() {
    const { selectedDate, selectedHour } = this.state;
    if (selectedDate && selectedHour) {
      return false;
    }
    return true;
  }

  public render() {
    const { marked, checked } = this.state;
    return (
      <ScrollView>
        <View style={styles.containerCalendar}>
          <Text style={styles.titleDates}>Select the dates:</Text>
          <Calendar
            ref={(ref) => { this.calendar = ref; }}
            minDate={Date()}
            maxDate="2020-10-30"
            onDayPress={day => this.onDayPressHandler(day)}
            // onDayLongPress={(day) => {console.log('selected day', day)}}
            // onMonthChange={(month) => {console.log('month changed', month)}}
            hideExtraDays
            firstDay={1}
            onPressArrowRight={addMonth => addMonth()}
            markedDates={marked}
          />
          <View style={styles.container}>
            <Text style={styles.titleHours}>Select the hours:</Text>
            {listHours.map(hour => (
              <CheckBox
                key={hour}
                checkedIcon={<MaterialIcons name="check-box" size={32} color={BLUE} />}
                uncheckedIcon={<MaterialIcons name="check-box-outline-blank" size={32} color={BLUE} />}
                title={hour}
                checked={checked[hour]}
                onPress={() => this.checkboxPressHandler(hour)}
              />
            ))}
          </View>
          <Button
            title="Save"
            onPress={() => this.saveHandler()}
            disabled={this.toggleSaveButtonState()}
            buttonStyle={styles.button}
          />
        </View>
      </ScrollView>
    );
  }
}

AvailabilitySelection.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape({
    tutorId: PropTypes.number.isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  return { user };
};

const mapDispatchToProps = dispatch => ({
  dispatchLogOut: () => {
    dispatch(logout());
  },
});

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps, mapDispatchToProps)(AvailabilitySelection),
);


const ADD_AVAILABILITY = gql`
  mutation createAvailability($tutorId: Int!, $date: Date!, $hour: String!) {
  createAvailability(input: {tutorId: $tutorId, date: $date, hour: $hour}){
    id
    date
    hour
  }
}
`;

const NewAvailability = () => (
  <Mutation mutation={ADD_AVAILABILITY}>
    {(addAvailability, { loading, error }) => {
      const add = async (
        tutorId: number,
        date: string,
        hour: string,
        navigation,
      ) => {
        try {
          await addAvailability({
            variables: {
              tutorId,
              date,
              hour,
            },
          });
          navigation.goBack();
        } catch (e) {
          Alert.alert('There was an error, please try again.');
        }
      };
      if (loading) return (<Spinner color="#3067BA" />);
      if (error) {
        Alert.alert("The date(s) and time(s) you've selected are already in your availabilities");
      }
      return (
        <ComponentWithNavigation onSubmit={add} />
      );
    }}
  </Mutation>
);

export default NewAvailability;
