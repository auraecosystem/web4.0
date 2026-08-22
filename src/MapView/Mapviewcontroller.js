<MapView
map = new google.maps.Map(document.getElementById('map'), {
center: {lat: -34.397, lng: 150.644},
zoom: 8,
mapId: 'MAP_ID'
});
// Optional: Your map ID configured in Google Cloud Console
    onMapReady={() => console.log('Map is ready')}
    onMapClick={(latLng) => console.log('Map clicked at', latLng)}
    onMapViewControllerCreated={setMapViewController}
/>
