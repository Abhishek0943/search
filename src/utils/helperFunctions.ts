import { PermissionsAndroid, Platform } from 'react-native';
import { showMessage } from 'react-native-flash-message';

const showError = (message: string): void => {
  showMessage({
    type: 'danger',
    icon: 'danger',
    message,
  });
};

const showSuccess = (message: string): void => {
  showMessage({
    type: 'success',
    icon: 'success',
    message,
  });
};
const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS automatically handles permissions
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export function getColorCodeWithOpactiyNumber(color, transparency) {
  /*
HEXA VALUE CHANGE IS DIFFRENT IN JS, HERE THE TRANSPERANCY YOU WANT TO ADD IS ADDED AT THE END
Using an alpha value to update a color’s transparency will change the hex code format from #RRGGBB to #RRGGBBAA (red, green, blue, alpha). 
The first six values (the red, green, and blue ones) stay the exact same. The only difference is the last two values (the AA).
  */
  switch (String(transparency)) {
    case '10':
      return `#${color}1A`;
    case '15':
      return `#${color}26`;
    case '20':
      return `#${color}33`;
    case '25':
      return `#${color}40`;
    case '30':
      return `#${color}4D`;
    case '35':
      return `#${color}59`;
    case '40':
      return `#${color}66`;
    case '50':
      return `#${color}80`;
    case '60':
      return `#${color}99`;
    case '70':
      return `#${color}B3`;
    case '80':
      return `#${color}B4`;
    case '90':
      return `#${color}B5`;

  }
}


export { showError, showSuccess ,requestCameraPermission};
