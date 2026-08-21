try {
  const waypoint = {
    title: 'Destination',
    position: {
      lat: 37.4220679,
      lng: -122.0859545,
    },
  };

  const routingOptions = {
    travelMode: TravelMode.DRIVING,
    avoidFerries: false,
    avoidTolls: false,
  };

  const displayOptions: DisplayOptions = {
    showDestinationMarkers: true,
    showStopSigns: true,
    showTrafficLights: true,
  };

  await navigationController.setDestinations([waypoint], { routingOptions, displayOptions });
  await navigationController.startGuidance();
} catch (error) {
  console.error('Error starting navigation', error);
}
