const {
  mapViewAutoController,
  addListeners: addAutoListener,
  removeListeners: removeAutoListeners,
} = useNavigationAuto();

const navigationAutoCallbacks: NavigationAutoCallbacks = useMemo(
  () => ({
    onCustomNavigationAutoEvent: (event: CustomNavigationAutoEvent) => {
      console.log('onCustomNavigationAutoEvent:', event);
    },
    onAutoScreenAvailabilityChanged: (available: boolean) => {
      console.log('onAutoScreenAvailabilityChanged:', available);
      setMapViewAutoAvailable(available);
    },
  }),
  []
);

const setMapType = (mapType: MapType) => {
  console.log('setMapType', mapType);
  mapViewAutoController.setMapType(mapType);
};
