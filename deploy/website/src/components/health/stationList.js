import React, { Component } from 'react';
import StationCard from './stationCard';
import { FormGroup, Input, Alert } from 'reactstrap';
import Cookies from 'js-cookie';
import _ from 'lodash';

// Station List component is a list of each station
// Each connected station is built out of a single Station component in a loop here
class StationList extends Component {
    // Constructor called when the component is loaded in
    constructor(props) {
        super(props);
        var view = Cookies.get('view');
        if (_.isUndefined(view)) view = 'list';
        this.state = {
            stations: [],
            secondsElapsed: 0,
            filter: '',
            view: view,
            permissions: props.permissions
        };
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.permissions !== this.state.permissions){
            this.setState({
                permissions: nextProps.permissions
            })
        }
    }

    // Sets the initial state of the component to be null/0 so 
    // we can update it later
    getInitialState() {
        return {
            stations: [],
            secondsElapsed: 0,
            filter: ''
        };
    }

    // Called when the component is first "mounted" (loaded) into the page
    // This fetches the stations from our API and adds them to our current state
    componentDidMount() {
        this.getLatestWeather().then(stations => { 
            this.setState({ stations: stations });
        });
        this.interval = setInterval(this.updateStations, 5000);
    }

    // Called when the component is destroyed and removed from the page
    // I am removing the interval so it is not still called after the component disappears.
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    // This will access our API to get updated data and then updates the state
    // of the page
    updateStations = async () => {
        this.getLatestWeather().then(stations => {
            this.setState({ 
                stations: stations, 
                secondsElapsed: this.state.secondsElapsed + 5
            });
        });
    }
    
    // Async call to fetch everything from our stations endpoint while the page is still loading
    // Returns an array of stations
    getLatestWeather = async () => {
        var stations = [];
        const response = await fetch('/api/weather/latest/', 
        {   headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
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

    // Returns false if the filter string is not in the station's name.
    // Returns true if the filter is empty or is within the station's name.
    filterStations(station){
        if (this.state.filter !== '')
            return station.station_name.toLowerCase().includes(this.state.filter.toLowerCase());

        return true;
    }

    // When changing the view between list/grid update the cookie and state
    handleViewChange(view){
        if (view !== this.state.view){
            this.setState({
                view: view
            })
            Cookies.set('view', view);
        }
    }

    // Render the filter input and buttons for choosing list/grid view
    renderFilters(){
        return (
            <div>
                <div className="row options-row">
                    <div className="view-options col-12 right">
                        <button className="btn btn-secondary btn-sm view-icon" id="list-view-btn" onClick={() => {this.handleViewChange('list')}}><i class="fa fa-th-list" aria-hidden="true"></i></button>
                        <button className="btn btn-secondary btn-sm view-icon" id="grid-view-btn" onClick={() => {this.handleViewChange('grid')}}><i class="fa fa-th fa-fw " aria-hidden="true"></i></button>
                    </div>
                </div>
                <FormGroup className="col-12">
                    <Input type="text" className="filterWidth" name="stationFilter" id="stationFilter" placeholder="Filter" onChange={this.filterOnChange.bind(this)} />
                </FormGroup>
            </div>
        );
    }

    // Render the station in either a grid or list format depending on the buttons
    // above the filter input
    renderStations(){
        if (this.state.view === "list"){
            return (this.state.stations
                .filter(this.filterStations.bind(this))
                .map(station => {
                    return (
                        <StationCard key={station.key} permissions={this.state.permissions} station={station}></StationCard>
                    );
                }) 
            ); 
        }

        else{
            return (
                <div className="row col-12">
                {
                    this.state.stations
                    .filter(this.filterStations.bind(this))
                    .map((station, index) => {
                        return (
                            <div class="col-md-6 col-sm-12 no-padding">
                                <StationCard key={station.key} permissions={this.state.permissions} station={station}></StationCard>
                            </div>
                        );
                    }) 
                }
                </div>
            ); 
        }
    }

    // If there are no stations stored in the state, render
    // the no stations alert.
    renderAlert(){
        if (this.state.stations.length === 0){
            return (
                <Alert className="no-stations-alert" color="primary">
                    There are no stations to display.
                </Alert>
            );
        }
    }

    render() {
        if (this.state.view === "list"){
            return (
                <div id="list-content-id" className="stations-container list-content">
                    { this.renderFilters() }
                    { this.renderStations() }
                    { this.renderAlert() }
                </div>
            );
        }

        else{
            return (
                <div id="grid-content-id" className="stations-container grid-content">
                    { this.renderFilters() }
                    { this.renderStations() }
                    { this.renderAlert() }
                </div>
            );
        }
  }
}

export default StationList;