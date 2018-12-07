import React, { Component } from 'react';
import VerifyLoggedIn from '../components/verifyLoggedIn';
import MapContainer from '../components/map/mapContainer';
import SidebarItem from '../components/map/sidebarItem';
import { FormGroup, Input, Alert, Label, Button } from 'reactstrap';

class Map extends Component {
    constructor() {
        super();
        this.state = {
            stations: [],
            checkedStations: [],
            loading: true,
            mapHeight: 0,
            mapWidth: 0,
            filter: '',
            showLabels: true,
            mapMode: "move",
            recenter: false
        };
        this.checkboxOnChange = this.checkboxOnChange.bind(this);
        this.allCheckboxesOnChange = this.allCheckboxesOnChange.bind(this);
        this.labelsOnChange = this.labelsOnChange.bind(this);
        this.mapModeOnChange = this.mapModeOnChange.bind(this);
    }

    // Set all stations that have sent weather in our state as checked
    componentDidMount(){
        const height = this.mapElement.clientHeight;
        const width = this.mapElement.clientWidth;
        this.setState({
            mapHeight: height,
            mapWidth: width
        })
        this.getLatestWeather().then(stations => {
            var checkedStations = this.addCheckedStations(stations);
            this.setState({
                stations: stations,
                checkedStations: checkedStations,
                loading: false
            })
        });
    }

    // Push stations into our checkedStations array
    addCheckedStations(stations){
        var checkedStations = [];
        if (stations.length !== 0){
            stations.map(station => {
                if (station.latitude !== "n/a" && station.longitude !== "n/a"){
                    checkedStations.push(station);
                }
                return null;
            })
        }

        return checkedStations;
    }

    // Request the stations' latest we ather
    getLatestWeather = async () => {
        var stations = [];
        const response = await fetch('/api/weather/latest/', {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message); 
        if (body.weather) stations = body.weather;

        return stations;
    };

    // Set the component's filter state whenever the filter input changes 
    filterOnChange(e){
        this.setState({
            filter: e.target.value
        })
    }

    updateCheckedStations(stations){
        this.setState({
            checkedStations: stations
        });
    }

    mapModeOnChange(){
        if (this.state.mapMode === "move"){
            this.setState({
                mapMode: "draw"
            });
        }

        else{
            this.setState({
                mapMode: "move"
            });
        }
    }

    // Handle a checkbox click event by removing/adding it to the checkedStations
    checkboxOnChange(event, station){
        var checkedStations = this.state.checkedStations;
        if (event.target.checked === true){
            checkedStations.push(station);
            this.updateCheckedStations(checkedStations);
        }

        else{
            var index = checkedStations.indexOf(station);
            if (checkedStations.length === 1) checkedStations.pop();
            else checkedStations.splice(index, 1);
            this.updateCheckedStations(checkedStations);
        }
    }

    labelsOnChange(event){
        this.setState({
            showLabels: event.target.checked
        });
    }

    allCheckboxesOnChange(event){
        if (event.target.checked === true){
            var checkedStations = this.addCheckedStations(this.state.stations);
            this.setState({
                checkedStations: checkedStations
            });
        }

        else {
            this.setState({
                checkedStations: []
            });
        }
    }

    updateMapRecenter = () => {
        this.setState({
            recenter: !this.state.recenter
        })
    }

    // Returns false if the filter string is not in the station's name.
    // Returns true if the filter is empty or is within the station's name.
    filterStations(station){
        if (this.state.filter !== '')
            return station.station_name.toLowerCase().includes(this.state.filter.toLowerCase());
        return true;
    }

    renderDrawButton(){
        if (this.state.mapMode === "move"){
            return (<Button color="primary" className="btn btn-sm mode-btn" onClick={this.mapModeOnChange}>Average Weather</Button>);
        }

        else{
            return (<Button color="danger" className="btn btn-sm mode-btn" onClick={this.mapModeOnChange}>Stop Drawing</Button>);
        }
    }

    renderSidebar(){
        if (this.state.stations.length === 0){
            return <Alert className="no-stations-alert" color="primary">
                        There are no stations with GPS data.
                    </Alert>
        }

        else{
            var displayIndex = -1;
            return (
                <div className="name-list">
                {
                    this.state.stations
                    .filter(this.filterStations.bind(this))
                    .map((station, index) => {
                        if (station.latitude !== "n/a" && station.longitude !== "n/a"){
                            displayIndex += 1;
                            if (this.state.checkedStations.indexOf(station) >= 0){
                                return (
                                    <SidebarItem key={station.apikey} checked={true} index={displayIndex} station={station} checkboxOnChange={this.checkboxOnChange}></SidebarItem>
                                );
                            }

                            else{
                                return (
                                    <SidebarItem key={station.apikey} checked={false} index={displayIndex} station={station} checkboxOnChange={this.checkboxOnChange}></SidebarItem>
                                );
                            }
                        }
                        return null;
                    })
                }
                </div>
            );
        }
    }

    render() {
        if (this.state.loading === false){
            return(
                <div className='MapPage'>
                    <VerifyLoggedIn/>
                    <div className="sidebar-container" style={{position: 'absolute', left: 0, top: 0, width: '25%', height: '100%'}}>
                        <div className='sidebar'>
                            <FormGroup check className="show-labels-container">
                                <Label check>
                                    <Input type="checkbox" defaultChecked={true} onChange={(event) => this.labelsOnChange(event)}/>{' '}
                                    <span className="show-labels">Show Labels</span>
                                </Label>
                                { this.renderDrawButton() }
                            </FormGroup>
                            <FormGroup className="col-12">
                                <Input type="text" className="filterWidth" name="stationFilter" id="stationFilter" placeholder="Filter" onChange={this.filterOnChange.bind(this)} />
                            </FormGroup>
                            <FormGroup check className="all-checkboxes-container">
                                <Label check>
                                    <Input type="checkbox" defaultChecked={true} onChange={(event) => this.allCheckboxesOnChange(event)}/>{' '}
                                    <span className="show-labels">All</span>
                                </Label>
                                <Button className="btn btn-sm recenter-btn" color="secondary" onClick={this.updateMapRecenter}>Recenter Map</Button>
                            </FormGroup>
                            <div className="col-12">
                                <h4 className="map-title">Last Known Locations</h4>
                            </div>
                            { this.renderSidebar() }
                        </div>
                    </div>
                    <div className="map-container" ref={ (mapElement) => this.mapElement = mapElement} style={{position: 'absolute', right: 0, top: 0, width: '75%', height: '100%'}}>
                        <MapContainer height={this.state.mapHeight} width={this.state.mapWidth} checkedStations={this.state.checkedStations} showLabels={this.state.showLabels} mapMode={this.state.mapMode} mapOnly={false} updateRecenter={this.updateMapRecenter} recenter={this.state.recenter}></MapContainer>
                    </div>
                    <footer id="footer-id" className="footer">
                        <a href="https://goodstuffnononsense.com/hand-drawn-icons/space-icons/" rel="noopener noreferrer" target="_blank">Satellite Icon</a> By <a href="https://goodstuffnononsense.com/about/" rel="noopener noreferrer" target="_blank">Agata</a> / <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="_blank">CC BY</a>
                    </footer>
                </div>
            )
        }

        else{
            return(
                <div className='MapPage'>
                    <div className="map-container" ref={ (mapElement) => this.mapElement = mapElement} style={{position: 'absolute', right: 0, top: 0, width: '75%', height: '100%'}}>
                    </div>
                </div>
            );
        }
    }
}

export default Map;