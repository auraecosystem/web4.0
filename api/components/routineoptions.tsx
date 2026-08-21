<MapView
    mapId="your-map-id-here" // Optional: Your map ID configured in Google Cloud Console
    onMapReady={() => console.log('Map is ready')}
    onMapClick={(latLng) => console.log('Map clicked at', latLng)}
    onMapViewControllerCreated={setMapViewController}
/>
const { 
  navigationController, 
  removeAllListeners,
  setOnArrival,
  setOnRouteChanged,
  setOnNavigationReady,
} = useNavigation();

useEffect(() => {
  setOnArrival((event: ArrivalEvent) => {
    if (event.isFinalDestination) {
      console.log('Final destination reached');
      navigationController.stopGuidance();
    } else {
      console.log('Continuing to the next destination');
      navigationController.continueToNextDestination();
      navigationController.startGuidance();
    }
  });
  setOnRouteChanged(() => console.log('Route changed'));
  setOnNavigationReady(() => console.log('Navigation ready'));

  // On cleanup, removeAllListeners() clears all at once.
  // Alternatively, clear individual listeners: setOnArrival(null)
  return () => removeAllListeners();
}, [
  navigationController,
  setOnArrival,
  setOnRouteChanged,
  setOnNavigationReady,
  removeAllListeners,
]);
// Permissions must have been granted by this point.

<NavigationView
    mapId="your-map-id-here" // Optional: Your map ID configured in Google Cloud Console
    androidStylingOptions={{
        primaryDayModeThemeColor: '#34eba8',
        headerDistanceValueTextColor: '#76b5c5',
        headerInstructionsFirstRowTextSize: '20f',
    }}
    iOSStylingOptions={{
        navigationHeaderPrimaryBackgroundColor: '#34eba8',
        navigationHeaderDistanceValueTextColor: '#76b5c5',
    }}
    onMapReady={() => console.log('Map is ready')}
    onRecenterButtonClick={() => console.log('Recenter button clicked')}
    onMapViewControllerCreated={setMapViewController}
    onNavigationViewControllerCreated={setNavigationViewController}
/>

  
