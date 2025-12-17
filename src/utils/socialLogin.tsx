// import { appleAuth, AppleAuthRequestResponse, AppleAuthCredentialState } from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from '@react-native-google-signin/google-signin';
// import {
//   GraphRequest,
//   GraphRequestCallback,
//   GraphRequestManager,
//   LoginManager,
//   LoginResult,
// } from 'react-native-fbsdk-next';

type ErrorWithCode = {
  code: string;
  message?: string;
};

export const googleLogin = async (): Promise<GoogleUser | ErrorWithCode> => {
  GoogleSignin.configure();
  try {
    await GoogleSignin.signOut();
    const userInfo = await GoogleSignin.signIn();
    console.log(userInfo, 'google login in try block');
    return userInfo;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('SIGN_IN_CANCELLED');
      return error;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('IN_PROGRESS');
      return error;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('PLAY_SERVICES_NOT_AVAILABLE');
      return error;
    } else {
      console.log(error, 'error in gmail');
      return error;
    }
  }
};

// export const fbLogin = (
//   resCallback: GraphRequestCallback & { (result?: any): void }
// ): Promise<void> => {
//   LoginManager.logOut();
//   return LoginManager.logInWithPermissions(['email', 'public_profile']).then(
//     (result: LoginResult) => {
//       if (
//         result.declinedPermissions &&
//         result.declinedPermissions.includes('email')
//       ) {
//         resCallback({ message: 'Email is required' });
//       }
//       if (!result.isCancelled) {
//         const infoRequest = new GraphRequest(
//           '/me?fields=email,name,picture,friends',
//           null,
//           resCallback
//         );
//         new GraphRequestManager().addRequest(infoRequest).start();
//       }
//     },
//     (error: any) => {
//       console.error('Facebook login error:', error);
//     }
//   );
// };

// export const handleAppleLogin = async (): Promise<AppleAuthRequestResponse> => {
//   return new Promise(async (resolve, reject) => {
//     const checkAppleSupport = appleAuth.isSupported;
//     if (checkAppleSupport) {
//       try {
//         const appleAuthRequestResponse = await appleAuth.performRequest({
//           requestedOperation: appleAuth.Operation.LOGIN,
//           requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
//         });

//         const credentialState: AppleAuthCredentialState =
//           await appleAuth.getCredentialStateForUser(
//             appleAuthRequestResponse.user
//           );

//         if (credentialState === appleAuth.State.AUTHORIZED) {
//           console.log('checking apple login >>> ', appleAuthRequestResponse);
//           resolve(appleAuthRequestResponse);
//         } else {
//           reject(credentialState);
//         }
//       } catch (err) {
//         reject(err);
//       }
//     } else {
//       reject('Apple login is not supported on this device');
//     }
//   });
// };
