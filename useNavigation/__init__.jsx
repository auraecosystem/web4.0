import {
  useNavigation,
  NavigationSessionStatus,
} from '@googlemaps/react-native-navigation-sdk';

const { navigationController } = useNavigation();

const initializeNavigation = useCallback(async () => {
  // First show Terms and Conditions dialog (uses options from NavigationProvider)
  const termsAccepted = await navigationController.showTermsAndConditionsDialog();

  if (!termsAccepted) {
    console.log('User declined terms');
    return;
  }

  // Initialize the navigation session and check the status
  const status = await navigationController.init();
  
  switch (status) {
    case NavigationSessionStatus.OK:
      console.log('Navigation initialized successfully');
      break;
    case NavigationSessionStatus.NOT_AUTHORIZED:
      console.error('API key not authorized');
      break;
    case NavigationSessionStatus.TERMS_NOT_ACCEPTED:
      console.error('Terms not accepted');
      break;
    case NavigationSessionStatus.LOCATION_PERMISSION_MISSING:
      console.error('Location permission required');
      break;
    case NavigationSessionStatus.NETWORK_ERROR:
      console.error('Network error');
      break;
    default:
      console.error('Unknown error:', status);
  }
}, [navigationController]);
