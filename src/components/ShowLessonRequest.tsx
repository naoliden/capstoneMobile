import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Header,
  Container,
  Title,
  Right,
  Left,
  Body,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Divider } from 'react-native-elements';
import {
  BLUE,
  GRAY,
  GREEN,
  LIGHT_GRAY,
  WHITE,
} from '../config/colors';
import { parseDate } from './ProfileUtils';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  accept: {
    backgroundColor: BLUE,
    width: 120,
    alignSelf: 'center',
    marginTop: 20,
  },
  details: {
    fontSize: 18,
    color: GRAY,
    fontWeight: '300',
    alignSelf: 'flex-start',
  },
  title: {
    fontWeight: '500',
    fontSize: 18,
    color: GRAY,
    marginBottom: 10,
  },
  date: {
    fontWeight: '500',
    fontSize: 16,
    color: GREEN,
  },
  divider: {
    backgroundColor: LIGHT_GRAY,
    width: '100%',
    marginVertical: 10,
  },
  input: {
    height: 100,
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 16,
    padding: 5,
    color: GRAY,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  reject: {
    backgroundColor: 'white',
    borderColor: BLUE,
    width: 120,
    alignSelf: 'center',
    marginTop: 20,
  },
});

const ANSWER_MUTATION = gql`
  mutation answerParticularClassRequest($id: ID!, $answer: String!, $requestState: String!) {
    answerParticularClassRequest(input: {id: $id, answer: $answer, requestState: $requestState}){
      status
      errorMessage
    }
  }
`;

const handleError = () => {
  Alert.alert('There was an error. Please try again!');
};

class ShowLessonRequest extends React.Component {
  public static propTypes = {
    tutor: PropTypes.bool,
    closeModal: PropTypes.func.isRequired,
    request: PropTypes.shape({
      subject: PropTypes.string.isRequired,
    }).isRequired,
    refetch: PropTypes.func.isRequired,
  }

  public static defaultProps = {
    tutor: false,
  }

  public constructor(props) {
    super(props);
    this.state = { answer: '' };
    this.handleAnswerChange = this.handleAnswerChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleAnswerChange(answer) {
    this.setState({ answer });
  }

  public handleSubmit(data) {
    const { status } = data.answerParticularClassRequest;
    const { closeModal, refetch } = this.props;
    if (status === 1) {
      closeModal();
      refetch();
    } else {
      Alert.alert('There was an error, please try again');
    }
  }

  private tutorAnswerForm() {
    const { request } = this.props;
    const { id } = request;
    const { answer } = this.state;
    return (
      <View style={{ marginTop: 30 }}>
        <Text style={styles.title}>Answer request</Text>
        <Text style={[styles.details, { fontWeight: '400' }]}>
          Write an explanation (optional):
        </Text>
        <TextInput
          onChangeText={this.handleAnswerChange}
          style={styles.input}
          multiline
          editable
        />
        <View style={styles.wrapper}>
          <Mutation
            mutation={ANSWER_MUTATION}
            variables={{ id, answer, requestState: 'REJECTED' }}
            onError={() => handleError()}
            onCompleted={data => this.handleSubmit(data)}
          >
            {mutation => (
              <Button
                title="Reject"
                type="outline"
                onPress={() => mutation()}
                buttonStyle={styles.reject}
                titleStyle={{ color: BLUE }}
                containerStyle={{ width: '50%' }}
              />
            )}
          </Mutation>
          <Mutation
            mutation={ANSWER_MUTATION}
            variables={{ id, answer, requestState: 'ACCEPTED' }}
            onError={() => handleError()}
            onCompleted={data => this.handleSubmit(data)}
          >
            {mutation => (
              <Button
                title="Accept"
                onPress={() => mutation()}
                buttonStyle={styles.accept}
                containerStyle={{ width: '50%' }}
              />
            )}
          </Mutation>
        </View>
      </View>
    );
  }

  public render() {
    const { request, closeModal, tutor } = this.props;
    const {
      subject,
      description,
      address,
      answer,
      requestState,
      tutorAvailability,
      user,
    } = request;
    const tutorItem = request.tutor.user;
    const { firstName, lastName } = user;
    const { date, hour } = tutorAvailability;
    return (
      <Container>
        <Header style={{ backgroundColor: BLUE }}>
          <Left>
            <Button
              icon={<MaterialIcons name="clear" size={32} color={WHITE} />}
              type="clear"
              onPress={() => {
                closeModal();
              }}
            />
          </Left>
          <Body>
            <Title style={{ color: WHITE, fontWeight: '500', fontSize: 18 }}>
              Request
            </Title>
          </Body>
          <Right />
        </Header>
        <KeyboardAwareScrollView
          enableOnAndroid
          enableAutomaticScroll={(Platform.OS === 'ios')}
        >
          <View style={styles.container}>
            <Text style={styles.date}>{parseDate(date)}, {hour}</Text>
            <Text style={styles.title}>{subject}</Text>
            {tutor && (
              <Text style={styles.details}>
                Student: {firstName} {lastName}
              </Text>
            )}
            {!tutor && (
              <Text style={styles.details}>
                Tutor: {tutorItem.firstName} {tutorItem.lastName}
              </Text>
            )}
            <Text style={styles.details}>Address: {address}</Text>
            <Text style={styles.details}>Description: {description}</Text>
            <Divider style={styles.divider} />
            <Text style={[styles.details, { fontWeight: '400' }]}>Total: USD $15 </Text>
            <Text style={[styles.details, { fontWeight: '400' }]}>Request state: {requestState}</Text>
            {answer !== '' && (
              <Text style={[styles.details, { fontWeight: '400' }]}>Answer: {answer}</Text>
            )}
            {requestState === 'WAITING' && !tutor && (
              <Text style={[styles.details, { marginTop: 20 }]}>
                The tutor has not answered your request yet! Check it again later
              </Text>
            )}
            {requestState === 'WAITING' && tutor && this.tutorAnswerForm()}
          </View>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { visibleModalTutor } = state.reviews;
  return { visibleModalTutor };
};

const ConnectedComponent = connect(mapStateToProps)(ShowLessonRequest);

export default ConnectedComponent;
