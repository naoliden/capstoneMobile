import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet, ScrollView, View, Alert, TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CheckBox, Button } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { Text, Spinner } from 'native-base';
import gql from 'graphql-tag';
import { compose, graphql, Query } from 'react-apollo';
import {
  BLUE,
  RED,
  GRAY,
  LIGHT_GRAY,
} from '../config/colors';
import SelectedAvailabilities from './SelectedAvailabilities';

const styles = StyleSheet.create({
  bigContainer: {
    backgroundColor: 'white',
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
    height: 100,
  },
  container: {
    marginBottom: 10,
  },
  subtitle: {
    paddingVertical: 10,
    marginHorizontal: 20,
    fontWeight: '500',
    fontSize: 16,
    color: GRAY,
  },
  calendar: {
    alignItems: 'center',
  },
  totalFont: {
    color: RED,
    fontWeight: '500',
    paddingVertical: 10,
    marginLeft: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    marginBottom: 15,
  },
  input: {
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 20,
    fontSize: 16,
    padding: 8,
  },
});

const GET_AVAILABILITY = gql`
  query tutorAvailabilities($tutorId: Int!) {
    tutorAvailabilities(input: { tutorId:$tutorId, reserved:false }) {
      id
      date
      hour
    }
  }
`;

const CREATE_REQUEST = gql`
  mutation createParticularClassRequest($tutorId: ID!, $tutorAvailabilityId: ID!, $subject: String!, $description: String!, $address: String!) {
    createParticularClassRequest(input: {tutorId: $tutorId, tutorAvailabilityId: $tutorAvailabilityId, subject: $subject, description: $description, address: $address}){
      errorMessage
      status
      particularClassRequest{
        requestState
        answer
      }
    }
  }
`;

class RequestLessons extends React.Component {
  public static propTypes = {
    availabilities: PropTypes.objectOf(PropTypes.array).isRequired,
    tutorId: PropTypes.number.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    createRequest: PropTypes.func.isRequired,
  }

  public constructor(props) {
    super(props);
    const availableDates = Object.keys(props.availabilities);
    const markedDates = availableDates.reduce(
      (c, v) => Object.assign(
        c, { [v]: { selected: false, marked: true } },
      ), {},
    );
    this.state = {
      marked: markedDates,
      hourList: [],
      selectedHours: [],
      selectedDate: '',
      selectedHoursDetail: [],
      subject: '',
      description: '',
      address: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubjectChange = this.handleSubjectChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.onDayPressHandler = this.onDayPressHandler.bind(this);
    this.checkboxPressHandler = this.checkboxPressHandler.bind(this);
  }

  public onDayPressHandler(day) {
    const { marked } = this.state;
    const { availabilities } = this.props;
    const markedDates = Object.keys(marked);
    if (markedDates.includes(day.dateString)) {
      const obj = markedDates.reduce(
        (c, v) => Object.assign(
          c, { [v]: { selected: false, marked: true } },
        ), {},
      );
      obj[day.dateString] = { selected: true, marked: false };
      const hourList = availabilities[day.dateString];
      this.setState({
        marked: obj,
        selectedDate: day.dateString,
        hourList,
      });
    } else {
      Alert.alert('This date is not available');
    }
  }

  public checkboxPressHandler(id: number, hour: string) {
    const { selectedHours, selectedDate, selectedHoursDetail } = this.state;
    let newSelected;
    let newSelectedDetails;
    if (selectedHours.includes(id)) {
      newSelected = selectedHours.filter(value => value !== id);
      newSelectedDetails = selectedHoursDetail.filter(value => value.id !== id);
    } else {
      newSelected = selectedHours.concat([id]);
      newSelectedDetails = selectedHoursDetail.concat([{ id, date: selectedDate, hour }]);
    }
    this.setState({ selectedHours: newSelected, selectedHoursDetail: newSelectedDetails });
  }

  public async handleSubmit() {
    const {
      selectedHours,
      subject,
      description,
      address,
    } = this.state;
    const { navigation } = this.props;
    if (selectedHours.length === 0) {
      Alert.alert('You must select at least one hour');
    } else if (subject === '' || description === '' || address === '') {
      Alert.alert('You must fill in the information required');
    } else {
      const { tutorId, createRequest } = this.props;
      const results = [];
      selectedHours.forEach((tutorAvailabilityId) => {
        results.push(createRequest({
          variables: {
            tutorId,
            tutorAvailabilityId,
            subject,
            description,
            address,
          },
        }));
      });
      const requests = await Promise.all(results);
      requests.forEach(({ data }) => {
        if (data.createParticularClassRequest.status !== 1) {
          Alert.alert(data.createParticularClassRequest.errorMessage);
        }
      });
      Alert.alert('Request sent! Select "Private Lessons Requests" in My Courses to check their state');
      navigation.goBack();
      navigation.navigate('My Courses');
    }
  }

  private handleSubjectChange(subject) {
    this.setState({ subject });
  }

  private handleDescriptionChange(description) {
    this.setState({ description });
  }

  private handleAddressChange(address) {
    this.setState({ address });
  }

  public render() {
    // const { navigation } = this.props;
    // const price = navigation.getParam('price', '');
    // a futuro el tutor deberia poder cambiar el precio por clase particular
    // por ahora por default todos cobran 15 USD por clase particular 1 hr
    const price = 15;
    const {
      hourList,
      marked,
      selectedHours,
      selectedHoursDetail,
    } = this.state;
    const total = price * selectedHours.length;
    return (
      <ScrollView>
        <Text style={styles.subtitle}>What is the subject?</Text>
        <TextInput
          onChangeText={this.handleSubjectChange}
          style={styles.input}
          placeholder="e.g., Math"
        />
        <Text style={styles.subtitle}>Add a description</Text>
        <TextInput
          onChangeText={this.handleDescriptionChange}
          style={styles.input}
        />
        <Text style={styles.subtitle}>What is the address for this lesson?</Text>
        <TextInput
          onChangeText={this.handleAddressChange}
          style={styles.input}
        />
        <Text style={styles.subtitle}>Select the date:</Text>
        <View style={styles.calendar}>
          <Calendar
            minDate={Date()}
            maxDate="2020-10-30"
            onDayPress={day => this.onDayPressHandler(day)}
            monthFormat="yyyy MM"
            hideExtraDays
            firstDay={1}
            onPressArrowLeft={substractMonth => substractMonth()}
            onPressArrowRight={addMonth => addMonth()}
            markedDates={marked}
          />
        </View>
        {hourList.length !== 0 && (
          <Text style={styles.subtitle}>Select the hours:</Text>
        )}
        {hourList.map((item) => {
          const id = item[0];
          const hour = item[1];
          return (
            <View style={{ paddingHorizontal: 30 }} key={id}>
              <CheckBox
                key={id}
                checkedIcon={<MaterialIcons name="check-box" size={25} color={BLUE} />}
                uncheckedIcon={<MaterialIcons name="check-box-outline-blank" size={25} color={BLUE} />}
                title={hour}
                checked={selectedHours.includes(id)}
                onPress={() => this.checkboxPressHandler(id, hour)}
              />
            </View>
          );
        })}

        <SelectedAvailabilities
          selected={selectedHoursDetail}
        />
        <Text style={styles.totalFont}>Total: USD ${total}</Text>
        <Text style={[styles.subtitle, { fontWeight: '300', marginBottom: 10 }]}>
          You will have to pay this amonut to the tutor in cash after
           they accept your request and the class is done.
        </Text>

        <Button
          title="Send request"
          onPress={this.handleSubmit}
          buttonStyle={styles.button}
        />
      </ScrollView>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  const { tutor } = state.courses;
  const { id } = user;
  return { userId: id, tutorId: tutor };
};

const ComponentWithNavigation = withNavigation(
  compose(
    graphql(CREATE_REQUEST, { name: 'createRequest' }),
    connect(mapStateToProps),
  )(RequestLessons),
);

const GetAvailabilitiesComponent = ({ tutorId }) => (
  <Query query={GET_AVAILABILITY} variables={{ tutorId }}>
    {({ loading, error, data }) => {
      if (loading) return (<Spinner color="#3067BA" />);
      if (error) return (<Text> Oops, Error! {error.message} </Text>);
      const availabilities = {};
      data.tutorAvailabilities.forEach((availability) => {
        const { id } = availability;
        const { date } = availability;
        const { hour } = availability;
        const hourList = availabilities[date] || [];
        hourList.push([id, hour]);
        availabilities[date] = hourList;
      });
      return (
        <ComponentWithNavigation availabilities={availabilities} />
      );
    }}
  </Query>
);

GetAvailabilitiesComponent.propTypes = {
  tutorId: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(GetAvailabilitiesComponent);
