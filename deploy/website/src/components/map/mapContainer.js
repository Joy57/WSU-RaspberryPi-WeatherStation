import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import { fitBounds } from 'google-map-react/utils';
import geolib from 'geolib';
import Marker from './marker';
import AveragesMarker from './averagesMarker';
import { MARKER_SIZE } from './markerStyles'
import '../../styles/map.css';

export class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.averageCircles = [];
        const {center, zoom} = this.calculateMapBounds(this.props.checkedStations, this.props.height, this.props.width);

        this.state = {
            stations: this.props.checkedStations,
            center: [center.lat, center.lng],
            zoom: zoom-1,
            hoverKey: null,
            clickKey: null,
            showLabels: this.props.showLabels,
            mode: this.props.mapMode,
            mapOnly: this.props.mapOnly,
            showAverages: false,
            averages: [],
            recenter: false,
            neverHover: this.props.neverHover
        };
    }

    // Update our values on prop change if they are different than before
    componentWillReceiveProps(nextProps) {
        if (nextProps.recenter !== this.state.recenter){
            const {center, zoom} = this.calculateMapBounds(nextProps.checkedStations, this.props.height, this.props.width);
            this.setState({
                center: [center.lat, center.lng],
                zoom: zoom-1,
            });
            this.props.updateRecenter();
        }

        if (nextProps.checkedStations !== this.state.stations){
            this.setState({ stations: nextProps.checkedStations });
        }

        if (nextProps.showLabels !== this.state.showLabels){
            this.setState({ showLabels: nextProps.showLabels });
        }

        if (nextProps.mapMode !== this.state.mode){
            this.updateMapMode(nextProps.mapMode);
            this.setState({ mode: nextProps.mapMode })
        }

        if (nextProps.neverHover !== this.state.neverHover){
            this.setState({ neverHover: nextProps.neverHover });
        }
    }

    // Calculate the size of the map bounds by lat/lon and 
    // return the center + zoom of the bounds
    calculateMapBounds(stations, height, width){
        var allCoords = [];
        var coords;
        var center = {lat: 42.357324, lng: -83.070117};
        var zoom = 16;
        for (var i = 0; i < stations.length; i++){
            coords = {
                latitude: stations[i].latitude, 
                longitude: stations[i].longitude
            };
            allCoords.push(coords);
        }

        if (allCoords.length > 1){
            var bounds = geolib.getBounds(allCoords);
            bounds = {
                nw: {
                    lat: bounds.maxLat,
                    lng: bounds.minLng
                },
                se: {
                    lat: bounds.minLat,
                    lng: bounds.maxLng
                }
            }
            bounds = fitBounds(bounds, {height: height-75, width: width});
            center = bounds.center;
            zoom = bounds.zoom;
        }

        else if (allCoords.length === 1){
            center = {
                lat: parseFloat(allCoords[0].latitude),
                lng: parseFloat(allCoords[0].longitude)
            }
            zoom = 16;
        }
        
        return {center, zoom}; 
    }

    // Directly access the google maps api once google-maps-react library is done loading
    handleGoogleMapApi(google){
        if (this.state.mapOnly === false){
            this.map = google.map;
            this.maps = google.maps;

            // Set up the google maps api drawing manager
            const drawingManager = new this.maps.drawing.DrawingManager({
                drawingControl: true,
                drawingControlOptions: {
                    position: this.maps.ControlPosition.BOTTOM_CENTER,
                    drawingModes: [
                        this.maps.drawing.OverlayType.MARKER,
                        this.maps.drawing.OverlayType.CIRCLE
                    ]
                },
                markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
                circleOptions: {
                    fillColor: '#fff',
                    fillOpacity: 0.4,
                    strokeWeight: 3,
                    clickable: false,
                    editable: true,
                    zIndex: 1
                }
            });
            drawingManager.setMap(this.map);
            this.drawingManager = drawingManager;
            this.updateMapMode(this.state.mode);

            // When a circle is done drawing, delete the existing one and 
            // average the weather data for the new circle
            this.maps.event.addListener(drawingManager, 'circlecomplete', (circle) => {
                // if (!_.isUndefined(this.averageCircle)) this.averageCircle.setMap(null);
                this.averageCircles.push(circle);
                this.averageWeather(circle);
            });
        }
    }

    // Switch between drawing and moving around the map modes
    updateMapMode(mode){
        if (mode === "draw"){
            this.drawingManager.setDrawingMode(this.maps.drawing.OverlayType.CIRCLE);
        }

        else{
            this.drawingManager.setDrawingMode(null);
        }
    }

    removeCircle = (index) => {
        var averages = this.state.averages;
        this.averageCircles[index].setMap(null);
        this.averageCircles.splice(index, 1);
        averages.splice(index, 1);

        this.setState({ averages: averages });
    }

    // Remove all average circles drawn on the map
    clearAverageCircles(){
        if (this.averageCircles.length > 0){ 
            this.setState({ showAverages: false, averages: [] });
            for (var i = 0; i < this.averageCircles.length; i++){
                this.averageCircles[i].setMap(null);
            }
            this.averageCircles = [];
        }
    }

    // Checks if the given latitude/longitude is within the radius of the circle drawn
    circleContains(latLng, circle){
        // Gets the distance from the center of the circle to the latitude/longitude object of the marker point
        var centerToPointDistance = this.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), latLng);
        // Gets the radius of the circle drawn
        var circleRadius = circle.getRadius();
        // Checks if the distance between the center of the circle and the marker point is less than or equal to the radius of the circle
        return (centerToPointDistance <= circleRadius);
    }

    // Average all the weather data from markers within the circle
    averageWeather(circle){
        var averages = {};
        var values = {temperature: [], pressure: [], humidity: []};
        for (var i = 0; i < this.state.stations.length; i++){
            var latLng = new this.maps.LatLng(this.state.stations[i].latitude, this.state.stations[i].longitude);
            
            if (this.circleContains(latLng, circle)){
                if (this.state.stations[i].temperature !== 0.0) values.temperature.push(this.state.stations[i].temperature);
                if (this.state.stations[i].pressure !== 0.0) values.pressure.push(this.state.stations[i].pressure);
                if (this.state.stations[i].humidity !== 0.0) values.humidity.push(this.state.stations[i].humidity);
            }
        }

        averages["temperature"] = values.temperature.reduce((accumulator,value) => accumulator + value, 0) / values.temperature.length;
        averages["pressure"] = values.pressure.reduce((accumulator,value) => accumulator + value, 0) / values.pressure.length;
        averages["humidity"] = values.humidity.reduce((accumulator,value) => accumulator + value, 0) / values.humidity.length;
        this.updateAverages(circle, averages);
    }

    // Update our state to show averages
    updateAverages(circle, averages){
        var averagesArray = this.state.averages;
        averagesArray.push({
            lat: circle.center.lat(),
            lng: circle.center.lng(),
            data: averages
        });

        this.setState({ 
            showAverages: true, 
            averages: averagesArray 
        });
    }

    // Sets the center and zoom state when the user moves the Google Map around
    _onBoundsChange = (center, zoom, bounds, ...other) => {
        this.setState({
            center: center,
            zoom: zoom
        });
    }

    // Fired when clicking a marker, does nothing for now
    _onChildClick = (key, childProps) => {
        // this.props.onCenterChange([childProps.lat, childProps.lng]);
    }

    // Occurs when the mouse pointer enters into the bounds of a marker
    _onChildMouseEnter = (key /*, childProps */) => {
        this.setState({
            hoverKey: key
        });
    }
    
    // Occurs when the mouse pointer leaves into the bounds of a marker
    _onChildMouseLeave = (/* key, childProps */) => {
        this.setState({
            hoverKey: null
        });
    }
    
    renderAverages(){
        var averageMarkers = [];
        if (this.state.showAverages){
            this.state.averages.map((average, index) => {
                averageMarkers.push(
                    <AveragesMarker key={index} lat={average["lat"]} lng={average["lng"]} removeCircle={this.removeCircle} show={this.state.showAverages} index={index} averages={average["data"]}></AveragesMarker>
                );
                return null;
            }) 
            return averageMarkers;
        } else {
            return null;
        }
    }

    render() {
        const style = {
            width: '100%',
            height: '100%',   
        }

        return (
            <div id="map" className="map">
                <GoogleMap
                    bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_KEY, libraries: ['drawing'].join(',') }}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    hoverDistance={MARKER_SIZE - 10}
                    onBoundsChange={this._onBoundsChange}
                    onChildClick={this._onChildClick}
                    onChildMouseEnter={this._onChildMouseEnter}
                    onChildMouseLeave={this._onChildMouseLeave}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={this.handleGoogleMapApi.bind(this)}
                    style={style}>
                    {this.state.stations
                        .map((station, index) => {
                            if (station.latitude !== "n/a" && station.longitude !== "n/a"){
                                return (
                                        <Marker
                                            key={station.apikey}
                                            markerId={index}
                                            lat={station.latitude}
                                            lng={station.longitude}
                                            station={station}
                                            hover={this.state.hoverKey === station.apikey}
                                            label={this.state.showLabels}
                                            neverHover={this.state.neverHover}
                                        />
                                );
                            }

                            else{
                                return null;
                            }
                        })
                    }
                    { this.renderAverages() }
                </GoogleMap>
            </div>
        ); 
    }

}
export default MapContainer