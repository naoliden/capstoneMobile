import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  StyleSheet,
  Image,
  Alert,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { withNavigation } from 'react-navigation';
import {
  ImagePicker,
  Permissions,
} from 'expo';
import { ReactNativeFile } from 'apollo-upload-client';
import { connect } from 'react-redux';
import { Button } from 'react-native-elements';
import { BLUE } from '../config/colors';
import { changeUserPhoto } from '../actions';

const CHANGE_PROFILE_PIC = gql`
  mutation uploadFile($upload: Upload!) {
    uploadFile(input: $upload){
      fileName
      url
    }
  }
`;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: BLUE,
    width: 200,
    alignSelf: 'center',
    margin: 10,
  },
  title: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 15,
    marginTop: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 15,
    alignSelf: 'center',
  },
  navigate: {
    fontSize: 18,
    color: BLUE,
    alignSelf: 'center',
    marginBottom: 15,
  },
});

class ChangeProfilePicture extends React.Component {
  public static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    changePicture: PropTypes.func.isRequired,
    dispatchChangeProfilePicture: PropTypes.func.isRequired,
    photo: PropTypes.string,
  }

  public static defaultProps = {
    photo: null,
  }

  public constructor(props) {
    super(props);
    this.state = {
      image: props.photo,
      imageType: null,
      granted: false,
      changed: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.pickImage = this.pickImage.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  public async componentDidMount() {
    const { navigation } = this.props;
    const permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    if (permission.status !== 'granted') {
      const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (newPermission.status === 'granted') {
        this.setState({ granted: true });
      } else {
        navigation.goBack();
      }
    } else {
      this.setState({ granted: true });
    }
  }

  private async pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.cancelled) {
      this.setState({ image: result.uri });
      this.setState({ imageType: result.type });
      this.setState({ changed: true });
    }
  }

  public async handleSubmit() {
    const { image, imageType } = this.state;
    const { changePicture, navigation, dispatchChangeProfilePicture } = this.props;
    const mimeTypes = {
      jpe: 'image/jpeg',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      svg: 'image/svg+xml',
      png: 'image/png',
    };
    let finalType;
    if (imageType === 'image') {
      const splitedImage = image.split('.');
      const extension = splitedImage.slice(-1).pop();
      finalType = mimeTypes[extension];
    } else {
      finalType = imageType;
    }
    if (image) {
      const file = new ReactNativeFile({
        uri: image,
        type: finalType,
        name: 'profilePicture',
      });
      const result = await changePicture({ variables: { upload: file } });
      if (result.data.uploadFile.url) {
        dispatchChangeProfilePicture(result.data.uploadFile.url);
        navigation.pop(2);
      } else {
        Alert.alert('There was an error, please try again');
      }
    }
  }

  public render() {
    const { image, granted, changed } = this.state;
    const noPicture = 'https://bootdey.com/img/Content/avatar/avatar2.png';
    return (
      <View style={styles.container}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        {image === null && <Image source={{ uri: noPicture }} style={styles.image} />}
        <Button
          onPress={this.pickImage}
          title="Choose picture"
          buttonStyle={styles.button}
          disabled={!granted}
        />
        <Button
          onPress={this.handleSubmit}
          title="Upload"
          buttonStyle={styles.button}
          disabled={!changed}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: object) => {
  const { user } = state.login;
  const { photo } = user;
  return { photo };
};

const mapDispatchToProps = {
  dispatchChangeProfilePicture: changeUserPhoto,
};

const ComponentWithNavigation = withNavigation(
  compose(
    graphql(CHANGE_PROFILE_PIC, { name: 'changePicture' }),
    connect(mapStateToProps, mapDispatchToProps),
  )(ChangeProfilePicture),
);

export default ComponentWithNavigation;
