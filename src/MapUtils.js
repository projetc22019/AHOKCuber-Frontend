import { mapState } from "vuex";
export default {
    data() {
        return {};
    },
    methods: {
        /**
         * Resolves with a DirectionsResult object
         * @param {object} mapRef - ref to map component
         */
        drawRouteAsync(mapRef) {
            return new Promise((resolve, reject) => {
                var directionsDisplaySet = Object.keys(this.directionsDisplay).length === 0;
                var directionsServiceSet = Object.keys(this.directionsService).length === 0;
                if (!directionsDisplaySet || !directionsServiceSet || !this.start || !this.destination) {
                    reject({
                        directionsService: this.directionsService,
                        directionsDisplay: this.directionsDisplay,
                        start: this.start,
                        destination: this.destination
                    });
                } else {
                    this.$nextTick(() => {
                        mapRef.$mapPromise.then(() => {
                            this.directionsDisplay.setMap(mapRef.$mapObject);
                            // this.trafficLayer.setMap(mapRef.$mapObject);
                            this.directionsService.route(
                                {
                                    origin: this.start,
                                    destination: this.destination,
                                    travelMode: "DRIVING",
                                    drivingOptions: {
                                        departureTime: new Date(Date.now()),
                                        trafficModel: 'optimistic'
                                    }
                                },
                                (response, status) => {
                                    if (status === "OK") {
                                        this.directionsDisplay.setDirections(response);
                                        resolve(response);
                                    } else {
                                        reject(status);
                                    }
                                }
                            );
                        });
                    });
                }
            });
        },
        /**
         * @returns {object} position - {lat, lng}
         */
        getCurrentLocationAsync() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject();
                }
                navigator.geolocation.getCurrentPosition(position => {
                    let pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(pos);
                });
            });

        },
        /**
         * 
         * @param {object} place - the place object from gmap-autocomplete 
         */
        getPlaceCoordinates(place) {
            return { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
        },
        getCoordinatesPlace(/*coords*/) {
            return "Your House";
        }
    },
    computed: {
        autocompleteOptions() {
            var southWest = new window.google.maps.LatLng(34.524510, 36.239550);
            var northEast = new window.google.maps.LatLng(33.270020, 35.194328);
            var lebanonBounds = new window.google.maps.LatLngBounds(southWest, northEast);

            var options = {
                bounds: lebanonBounds,
                componentRestrictions: { country: 'lb' }
            };
            return options;
        },
        ...mapState({
            mapCenter: state => state.mapStore.mapCenter,
            directionsDisplay: state => state.mapStore.directionsDisplay,
            directionsService: state => state.mapStore.directionsService,
            start: state => state.mapStore.start,
            destination: state => state.mapStore.destination,
        }),
    }
};