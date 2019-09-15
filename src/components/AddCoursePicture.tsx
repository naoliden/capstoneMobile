import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  ScrollView,
  StyleSheet,
  Image,
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

const ADD_COURSE_PIC = gql`
  mutation addImage($upload: Upload!, $courseId: Int) {
    addImage(input: $upload, courseId: $courseId){
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
    width: 250,
    height: 200,
    margin: 15,
    alignSelf: 'center',
  },
  navigate: {
    fontSize: 18,
    color: BLUE,
    alignSelf: 'center',
    marginBottom: 15,
  },
});

class AddCoursePicture extends React.Component {
  public static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    addPicture: PropTypes.func.isRequired,
  }

  public constructor(props) {
    super(props);
    const { navigation } = props;
    const images = navigation.getParam('images', '');
    const stateImages = [];
    images.forEach((item: object) => {
      stateImages.push({ image: item.url });
    });
    this.state = {
      images: stateImages,
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
      const { images } = this.state;
      images.push({
        image: result.uri,
        imageType: result.type,
        new: true,
      });
      this.setState({ changed: true });
    }
  }

  public async handleSubmit() {
    const { images } = this.state;
    const { addPicture, navigation } = this.props;
    const courseId = navigation.getParam('courseId');
    const mimeTypes = {
      jpe: 'image/jpeg',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      svg: 'image/svg+xml',
      png: 'image/png',
    };
    const results = [];
    images.forEach((item: object) => {
      if (item.new) {
        const { image } = item;
        const { imageType } = item;
        let finalType;
        if (imageType === 'image') {
          const splitedImage = image.split('.');
          const extension = splitedImage.slice(-1).pop();
          finalType = mimeTypes[extension];
        } else {
          finalType = imageType;
        }
        const file = new ReactNativeFile({
          uri: image,
          type: finalType,
          name: 'profilePicture',
        });
        results.push(addPicture({
          variables: { upload: file, courseId: parseInt(courseId, 10) },
        }));
      }
    });
    await Promise.all(results);
    const refetch = navigation.getParam('refetch', () => null);
    await refetch();
    navigation.pop(2);
  }

  public render() {
    const { images, granted, changed } = this.state;
    return (
      <View style={styles.container}>
        <View style={{ height: 25 }} />
        {(images && images.length === 1) && (
          <Image
            source={{ uri: images[0].image }}
            style={styles.image}
          />
        )}
        {(images && images.length > 1) && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={(ref) => { this.scrollView = ref; }}
            onContentSizeChange={() => {
              this.scrollView.scrollToEnd({ animated: true });
            }}
          >
            {images.map((item: object, key) => (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                key={String(key).concat(item.image)}
              />
            ))}
          </ScrollView>
        )}
        <Button
          onPress={this.pickImage}
          title="Add picture"
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
    graphql(ADD_COURSE_PIC, { name: 'addPicture' }),
    connect(mapStateToProps, mapDispatchToProps),
  )(AddCoursePicture),
);

export default ComponentWithNavigation;
