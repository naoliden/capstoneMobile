import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet, ScrollView, View, Alert, Modal, WebView, Picker,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CheckBox, Button } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { Text, Spinner } from 'native-base';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import jsPaypal from '../resources/paypalJS';
import { BLUE, RED, GRAY } from '../config/colors';
import SelectedAvailabilities from './SelectedAvailabilities';


const payPalHTML = require('../resources/paypal.html');

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
  titleDates: {
    paddingVertical: 10,
    marginLeft: 20,
    fontWeight: '500',
    fontSize: 16,
    color: GRAY,
  },
  titleHours: {
    paddingVertical: 10,
    marginLeft: 20,
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
    width: 150,
    alignSelf: 'center',
    marginLeft: 15,
  },
  picker: {
    width: 150,
    marginLeft: 20,
    alignSelf: 'center',
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

const CREATE_RESERVATION = gql`
  mutation createReservation($userId: Int!, $courseId: Int!, $tutorAvailabilityId: Int!, $paymentMethod: String!) {
    createReservation(input: { userId: $userId, courseId: $courseId, tutorAvailabilityId: $tutorAvailabilityId, paymentMethod: $paymentMethod }) {
      id
    }
  }
`;

const DELETE_RESERVATION = gql`
  mutation deleteReservation($reservationId: Int!) {
    deleteReservation(input: { id: $reservationId }) {
      id
    }
  }
`;

const CREATE_ORDER = gql`
  mutation createOrder2($reservationIds: [Int]) {
    createOrder2(reservationIds: $reservationIds) {
      status
      orderId
      redirectLink
    }
  }
`;

const COMPLETE_TRANSACTION = gql`
  mutation completeTransaction($orderId: String!) {
    completeTransaction(orderID: $orderId) {
      id
      status
      money
      currencyCode
      createdAt
    }
  }
`;

class ApplyCourseComponent extends React.Component {
  public static propTypes = {
    availabilities: PropTypes.objectOf(PropTypes.array).isRequired,
    userId: PropTypes.number.isRequired,
    courseId: PropTypes.number.isRequired,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
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
      showModal: false,
      injectedJS: '',
      selectedHours: [],
      selectedDate: '',
      selectedHoursDetail: [],
      paymentMethod: 'PAYPAL',
      reservationIds: [],
      orderId: '',
    };

    this.onDayPressHandler = this.onDayPressHandler.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.handleSubmitReservations = this.handleSubmitReservations.bind(this);
    this.checkboxPressHandler = this.checkboxPressHandler.bind(this);
    this.requestHandler = this.requestHandler.bind(this);
  }

  public requestHandler() {
    return true;
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

  public async onMessage(message, completeMutation, deleteReservation) {
    const jsonMessage = JSON.parse(message.nativeEvent.data);
    if (jsonMessage.cancel) {
      this.setState({ showModal: false });
      const { reservationIds } = this.state;
      const deletions = [];
      reservationIds.forEach((id) => {
        deletions.push(deleteReservation(id));
      });
      await Promise.all(deletions);
      Alert.alert('Payment was cancelled, please try again.');
    } else {
      const { orderId } = this.state;
      const { navigation } = this.props;
      this.setState({ showModal: false });
      await completeMutation(orderId);
      Alert.alert('Payment was succesfully received.');
      navigation.goBack();
    }
  }
  

  public async handleSubmitReservations(createReservation, createOrder) {
    const { selectedHours, paymentMethod } = this.state;
    const { navigation } = this.props;
    if (selectedHours.length === 0) {
      Alert.alert('You must select at least one hour');
      return;
    }
    const { userId, courseId } = this.props;
    const results = [];
    selectedHours.forEach((tutorAvailabilityId) => {
      results.push(
        createReservation(userId, courseId, parseInt(tutorAvailabilityId, 10), paymentMethod),
      );
    });
    const reservations = await Promise.all(results);
    // Paypal
    if (paymentMethod === 'PAYPAL') {
      const reservationIds = reservations.map(
        reservation => parseInt(reservation.createReservation.id, 10),
      );
      const orderInfo = await createOrder(reservationIds);
      const { orderId } = orderInfo.createOrder2;
      this.setState({
        injectedJS: jsPaypal(orderId),
        orderId,
        reservationIds,
      });
      this.setState({ showModal: true });
    } else {
      Alert.alert('Your class has been reserved!');
      navigation.goBack();
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



  public render() {
    const { navigation } = this.props;
    const price = navigation.getParam('price', '');
    const {
      hourList,
      marked,
      injectedJS,
      showModal,
      selectedHours,
      selectedHoursDetail,
      paymentMethod,
    } = this.state;
    const total = price * selectedHours.length;
    return (


      <Mutation mutation={DELETE_RESERVATION}>
        {(deleteMutation, { errorDelete }) => {
          const deleteReservation = async (reservationId) => {
            const info = await deleteMutation({
              variables: {
                reservationId,
              },
            });
            return info.data;
          };
          if (errorDelete) return (<Text> Oops, Error! {errorDelete.message} </Text>);
          return (
            <Mutation mutation={COMPLETE_TRANSACTION}>
              {(completeMutation, { error }) => {
                const completeTransaction = async (orderId) => {
                  const info = await completeMutation({
                    variables: {
                      orderId,
                    },
                  });
                  return info.data;
                };
                if (error) return (<Text> Oops, Error! {error.message} </Text>);
                return (
                  <ScrollView>
                    <Modal
                      visible={showModal}
                    >
                      <WebView
                        ref="webview"
                        source={payPalHTML}
                        onMessage={
                          message => this.onMessage(
                            message,
                            completeTransaction,
                            deleteReservation,
                          )
                        }
                        injectedJavaScript={injectedJS}
                        useWebKit
                      />
                    </Modal>
                    <Text style={styles.titleDates}>Select the date:</Text>
                    <View style={styles.calendar}>
                      <Calendar
                        // Initially visible month. Default = Date()
                        // Minimum date that can be selected, dates before minDate will be
                        // grayed out. Default = undefined
                        minDate={Date()}
                        // Maximum date that can be selected, dates after maxDate will be
                        // grayed out. Default = undefined
                        maxDate="2020-10-30"
                        // Handler which gets executed on day press. Default = undefined
                        onDayPress={day => this.onDayPressHandler(day)}
                        // Month format in calendar title. Formatting values:
                        // http://arshaw.com/xdate/#Formatting
                        monthFormat="yyyy MM"
                        // Do not show days of other months in month page. Default = false
                        hideExtraDays
                        // If hideArrows=false and hideExtraDays=false do not switch month
                        // when tapping on greyed out
                        // day from another month that is visible in calendar page.
                        // Default = false
                        // If firstDay=1 week starts from Monday. Note that dayNames and
                        // dayNamesShort should still start from Sunday.
                        firstDay={1}
                        // Hide day names. Default = false
                        // Show week numbers to the left. Default = false
                        // Handler which gets executed when press arrow icon left.
                        // It receive a callback can go back month
                        onPressArrowLeft={substractMonth => substractMonth()}
                        // Handler which gets executed when press arrow icon left.
                        // It receive a callback can go next month
                        onPressArrowRight={addMonth => addMonth()}
                        markedDates={marked}
                      />
                    </View>
                    <Text style={styles.titleHours}>Select the hours:</Text>

                    {hourList.map((item) => {
                      const id = item[0];
                      const hour = item[1];
                      return (
                        <CheckBox
                          key={id}
                          checkedIcon={<MaterialIcons name="check-box" size={25} color={BLUE} />}
                          uncheckedIcon={<MaterialIcons name="check-box-outline-blank" size={25} color={BLUE} />}
                          title={hour}
                          checked={selectedHours.includes(id)}
                          onPress={() => this.checkboxPressHandler(id, hour)}
                        />
                      );
                    })}

                    <SelectedAvailabilities
                      selected={selectedHoursDetail}
                    />
                    <View>
                      <Text style={styles.totalFont}>Total: ${total}</Text>
                    </View>

                    <Text style={styles.titleHours}>Select payment method:</Text>
                    <View style={styles.bigContainer}>
                      <Picker
                        selectedValue={paymentMethod}
                        mode="dropdown"
                        style={styles.picker}
                        onValueChange={(value) => {
                          this.setState({ paymentMethod: value });
                        }}
                      >
                        <Picker.Item
                          label="PayPal"
                          value="PAYPAL"
                          key="PAYPAL"
                        />
                        <Picker.Item
                          label="Cash"
                          value="CASH"
                          key="CASH"
                        />
                      </Picker>

                      <Mutation
                        mutation={CREATE_ORDER}
                      >
                        {(orderMutation, { error2 }) => {
                          if (error2) return (<Text> Oops, Error! {error2.message} </Text>);
                          const createOrder = async (reservationIds) => {
                            const info = await orderMutation({
                              variables: {
                                reservationIds,
                              },
                            });
                            return info.data;
                          };
                          return (
                            <Mutation
                              mutation={CREATE_RESERVATION}
                            >
                              {(reservationMutation) => {
                                const createReservation = async (
                                  userId,
                                  courseId,
                                  tutorAvailabilityId,
                                ) => {
                                  const info = await reservationMutation({
                                    variables: {
                                      userId,
                                      courseId,
                                      tutorAvailabilityId,
                                      paymentMethod,
                                    },
                                  });
                                  return info.data;
                                };
                                return (
                                  <View>
                                  <Button
                                    title="Enviar Request"
                                    buttonStyle={styles.button}
                                    disabled={!this.requestHandler()}
                                    />

                                  <Button
                                    onPress={() => this.handleSubmitReservations(
                                      createReservation, createOrder,
                                      )}
                                      title="Go to Payment"
                                      disabled={this.requestHandler()}
                                      buttonStyle={styles.button}
                                    />
                                  </View>
                                );
                              }}
                            </Mutation>
                          );
                        }}
                      </Mutation>
                    </View>
                  </ScrollView>
                );
              }}
            </Mutation>
          );
        }}
      </Mutation>
    );
  }
}


const mapStateToProps = (state: object) => {
  const { user } = state.login;
  const { tutor, course } = state.courses;
  const { id } = user;
  return { userId: id, tutorId: tutor, courseId: course };
};

const ComponentWithNavigation = withNavigation(
  connect(mapStateToProps)(ApplyCourseComponent),
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
