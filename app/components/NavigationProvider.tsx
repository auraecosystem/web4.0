import React from 'react';
import {
  NavigationProvider,
  TaskRemovedBehavior,
} from '@googlemaps/react-native-navigation-sdk';

const App = () => {
  return (
    <NavigationProvider
      termsAndConditionsDialogOptions={{
        title: 'Terms and Conditions',
        companyName: 'QUBUHUB',
        showOnlyDisclaimer: false,
        uiParams: { // Optional UI customization
          backgroundColor: '#FFFFFF',
          titleColor: 'rgba(0,0,0,1)',
        },
      }}
      taskRemovedBehavior={TaskRemovedBehavior.CONTINUE_SERVICE}
    >
      {/* Add your application components here */}
    </NavigationProvider>
  );
};

export default App;
