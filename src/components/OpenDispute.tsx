import * as React from 'react';
import * as PropTypes from 'prop-types';
import { StyleSheet, TextInput, Alert } from 'react-native';
import {
  Container,
  Content,
  Text,
  Spinner,
} from 'native-base';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import i18n from 'i18n-js';
import { Button } from 'react-native-elements';
import { BLUE, GRAY, LIGHT_GRAY } from '../config/colors';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: BLUE,
    alignSelf: 'center',
    marginBottom: 30,
    width: 200,
  },
  rating: {
    marginTop: 20,
    fontSize: 15,
    marginBottom: 10,
  },
  textArea: {
    height: 250,
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 18,
    padding: 10,
    color: GRAY,
  },
  title: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '500',
    color: GRAY,
    alignSelf: 'center',
  },
});

class OpenDispute extends React.Component {
  public static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
  }

  public constructor(props) {
    super(props);
    this.state = {
      comment: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendDispute = this.sendDispute.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
  }


  public async handleSubmit() {
    Alert.alert(
      i18n.t('dispute.alert'),
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'OK', onPress: () => this.sendDispute() },
      ],
      { cancelable: false },
    );
  }

  public toggleButton() {
    const { comment } = this.state;
    if (comment.length > 0) {
      return false;
    }
    return true;
  }

  public sendDispute() {
    const { comment } = this.state;
    const { onSubmit, navigation } = this.props;
    const reservationId = navigation.getParam('id');
    const transactionId = navigation.getParam('transactionId');
    const refetch = navigation.getParam('refetch');
    onSubmit(
      parseInt(reservationId, 10),
      parseInt(transactionId, 10),
      comment,
      navigation,
      refetch,
    );
  }


  public render() {
    const { comment } = this.state;
    return (
      <Container style={styles.container}>
        <Content style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '500', color: GRAY }}>
            {i18n.t('dispute.question')}
          </Text>
          <TextInput
            editable
            style={styles.textArea}
            maxLength={40}
            multiline
            numberOfLines={8}
            placeholder={i18n.t('dispute.explain')}
            onChangeText={text => this.setState({ comment: text })}
            value={comment}
          />
          <Button
            buttonStyle={styles.button}
            onPress={this.handleSubmit}
            title={i18n.t('dispute.button')}
            disabled={this.toggleButton()}
          />
        </Content>
      </Container>
    );
  }
}


const ComponentWithNavigation = withNavigation(OpenDispute);


const OPEN_DISPUTE = gql`
  mutation createRefoundRequest($classReservationId: Int!, $transactionId: Int!, $comment: String!) {
    createRefoundRequest(input: {classReservationId: $classReservationId, transactionId: $transactionId, comment: $comment}){
    id
    transactionId
    classReservationId
  }
}
`;

const CreateDispute = () => (
  <Mutation mutation={OPEN_DISPUTE}>
    {(createRefoundRequest, { loading, error }) => {
      const add = async (
        classReservationId: number,
        transactionId: number,
        comment: string,
        navigation,
        refetch,
      ) => {
        await createRefoundRequest({
          variables: {
            classReservationId,
            transactionId,
            comment,
          },
        });
        refetch();
        navigation.goBack();
      };
      if (loading) {
        return (<Spinner color="#3067BA" />);
      } if (error) {
        return (<Text> Error! {error.message} </Text>);
      }
      return (
        <ComponentWithNavigation onSubmit={add} />
      );
    }}
  </Mutation>
);

export default CreateDispute;
