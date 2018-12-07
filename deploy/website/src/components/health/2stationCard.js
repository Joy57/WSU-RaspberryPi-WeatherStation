import React, { Component } from 'react';
import '../../styles/stations.css';
import { Input, Button, Card, CardText, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, FormFeedback } from 'reactstrap';
import ConnectionIndicator from './connectionIndicator';
import MapContainer from '../map/mapContainer';
import _ from 'lodash';
var moment = require('moment');
moment().format();

class StationCard extends Component {
    constructor(props){
        super(props);
        this.state = {
            station: this.props.station,
            // total will need to be changed based on the battery being used
            total: "24:00:00",
            modal: false,
            error: "",
            name: this.props.station.station_name,
            permissions: this.props.permissions
        }

        this.toggleStationDetail = this.toggleStationDetail.bind(this);
    }

    // Each time the station list updates, pass down the new 
    // props (station name in this case)
    componentWillReceiveProps(nextProps) {
        if ((this.state.name !== nextProps.station.station_name) && this.state.modal === false){
            this.onNameChange(nextProps.station.station_name);
        }

        if (this.state.station !== nextProps.station){
            this.setState({
                station: nextProps.station
            })
        }

        if(nextProps.permissions !== this.state.permissions){
            this.setState({
                permissions: nextProps.permissions
            })
        }
    }
    
    // Format the station's uptime for user viewing
    // TODO: Make this uptime not just last time data was received
    getUptime() {
        var uptime = "";
        if (this.props.station.connected){
            uptime = moment().diff(moment(moment(this.props.station.last_connected).utc(this.props.station.last_connected).local()))
            uptime = moment.utc(uptime).format("HH:mm:ss");
        }
        return uptime;
    }

    // Toggle the station detail modal open/closed
    toggleStationDetail(clicked){
        var name = this.state.name;
        name = (clicked === "cancel") ? this.props.station.station_name : name;
        
        if (this.state.error !== ""){
            this.setState({
                modal: !this.state.modal,
                error: "",
                name: name
            });
        }

        else{
            this.setState({
                modal: !this.state.modal,
                name: name
            });
        }
    }

    saveStationName = async() => {
        var response = await fetch('/api/stations/' + this.props.station.apikey, 
            {method: 'put', 
             body: JSON.stringify({station_name: this.state.name}),
             headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              }
        });
        var body = await response.json();
        if (!_.isUndefined(body.error)){
            this.setState({
                error: body.error,
            })
        }

        else {
            this.setState({ error: "" })
            this.toggleStationDetail("save");
        }

        return body;
    }


    renderWeatherData(){
        var cpu_usage = this.props.station.cpu_usage; 
        var ram_usage = this.props.station.ram_usage;
        var battery;

        if(this.props.station.station_name === "Master")
        {
            battery = "Connected to power source";
        }
        else
        {
            var battery2sec = this.props.station.battery;

            var temp = this.state.total.split(':');
            var totalSec = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);

            temp = battery2sec.split(':');
            var batterySec = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);

            battery = ((1 - (batterySec/totalSec)) * 100).toFixed(2) + " %";
        }

        if (cpu_usage <= 0.0) cpu_usage = "n/a";
        
        return (
            <div className="col-md-10 col-sm-12">
                <p className="station-info">CPU Usage: {cpu_usage} %</p>
                <p className="station-info">Battery: {battery}</p>
                <p className="station-info">RAM Usage: {ram_usage} %</p>
            </div>
        );
    }

    renderMap(){
        if (this.props.station.latitude !== "n/a" && this.props.station.longitude !== "n/a"){
            return (
                <div className="modal-map-box">
                    <div className="modal-map-container" ref={ (mapElement) => this.mapElement = mapElement} style={{position: 'absolute', right: 0, bottom: 0, width: '100%', height: '200px'}}>
                        <MapContainer height={400} width={400} checkedStations={[this.state.station]} showLabels={false} recenter={false} neverHover={true} mapOnly={true}></MapContainer>
                    </div>
                </div>
            )
        }
    }

    // Update the station name state on input change
    onNameChange(value){
        this.setState({
             name: value
        });
    }
    
    // Render the station name input with or without a value if it exists
    renderNameInput(){
        if (this.state.permissions === "Admin" || this.state.permissions === "Superuser"){
            if (this.state.error.length > 0){
                return (
                    <FormGroup>
                        <Input type="text" className="stationNameInput is-invalid" name="stationNameInput" id="stationNameInput" placeholder="Name" onChange={e => this.onNameChange(e.target.value)} value={this.state.name}></Input>
                        <FormFeedback>{this.state.error}</FormFeedback>
                    </FormGroup>
                );
            }
    
            else{
                return (
                    <FormGroup>
                        <Input type="text" className="stationNameInput" name="stationNameInput" id="stationNameInput" placeholder="Name" onChange={e => this.onNameChange(e.target.value)} value={this.state.name}></Input>
                    </FormGroup>
                );
            }
        }

        else{
            return(
                <div>
                    <div className="station-detail-row-none">
                        <span className="left">Name</span>
                        <span className="right">{ this.state.name }</span>
                    </div><br/>          
                </div>
            );
        }
    }

    // If there is no station name, render the mac address
    // Otherwise, render the station name
    renderStationName(){
        if (this.state.name != null){
            return this.state.name;
        }
        else return null;
    }

    renderUptime(){
        if (this.props.station.connected === 1){
            return(
                <div>
                    <div className="station-detail-row">
                    <span className="left">Uptime</span>
                    <span className="right">{this.getUptime()}</span>
                    </div><br/>
                </div>
            );
        }
    }

    renderTemperature(temperature){
        if (temperature === "Unavailable"){
            return (
                <span className="right">{temperature}</span>
            );
        }

        else{
            return (
                <span className="right">{temperature} &deg;F</span>
            );
        }
    }

    renderSaveButton(){
        if (this.state.permissions === "Admin" || this.state.permissions === "Superuser"){
            return (
                <Button color="primary" id="save-station-changes-btn" className="primary-themed-btn" onClick={this.saveStationName}>Save Changes</Button>
            );
        }

        else return null;
    }

    render() {
        const cpu_usage = (this.props.station.cpu_usage === 0) ? "Unavailable" : this.props.station.cpu_usage + " %";
        const ram_usage = (this.props.station.ram_usage === 0) ? "Unavailable" : this.props.station.ram_usage + " %";
        
        var total = this.state.total;
        var battery, remaining;

        if(this.props.station.station_name === 'Master')
        {
            battery = "Connected to power source";
            remaining = " - ";
            total = " - ";
        }
        else
        {
            var battery2sec = this.props.station.battery;

            var temp = this.state.total.split(':');
            var totalSec = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);

            temp = battery2sec.split(':');
            var batterySec = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);

            battery = ((1 - (batterySec/totalSec)) * 100).toFixed(2) + " %";
            
            var remainingTime = new Date(null);
            remainingTime.setSeconds(totalSec - batterySec);
            remaining = remainingTime.toISOString().substr(11,8);
        }

        return (
            <div className="col-12 station-container">
                <Modal isOpen={this.state.modal} className="station-detail-modal" toggle={this.toggleStationDetail}>
                    <ModalHeader toggle={() => this.toggleStationDetail("cancel")}>Station Detail View</ModalHeader>
                    <ModalBody>
                        { this.renderNameInput() }
                        <div className="station-detail-container">
                            <div className="station-detail-row">
                                <span className="left">CPU Usage</span>
                                <span className="right">{cpu_usage}</span>
                            </div><br/>
                            <div className="station-detail-row">
                                <span className="left">RAM Usage</span>
                                <span className="right">{ram_usage}</span>
                            </div><br/>
                            <div className="station-detail-row">
                                <span className="left">Battery Level</span>
                                <span className="right">{battery}</span>
                            </div><br/>
                            <div className="station-detail-row">
                                <span className="left">Total Battery Life</span>
                                <span className="right">{total}</span>
                            </div><br/>
                            <div className="station-detail-row">
                                <span className="left">Remaining Battery</span>
                                <span className="right">{remaining}</span>
                            </div><br/>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        { this.renderSaveButton() }
                        <Button color="secondary" onClick={() => this.toggleStationDetail("cancel")}>Cancel</Button>
                    </ModalFooter>
                </Modal>

                <Card onClick={this.toggleStationDetail} className="station-card">
                    <div className="col-12">
                        <CardTitle>
                            <div className="row">
                                <div className="col-8">
                                    <p className="station-name">
                                        <ConnectionIndicator updated={this.props.station.created_at} connected={this.props.station.connected} apikey={this.props.station.apikey}></ConnectionIndicator>
                                        <span className="station-name-inner">{ this.renderStationName() }</span>
                                    </p>
                                </div>
                                <div className="col-4">
                                    <p className="station-uptime">{moment(this.props.station.created_at).utc(this.props.station.created_at).local().format("MM/DD/YY HH:mm:ss")}</p>
                                </div>
                            </div>
                        </CardTitle>
                        <CardText className="no-padding bottom-card">
                            <div className="row">
                                {/* Holds station data on the left side of the card */}
                                { this.renderWeatherData() }
                                {/* Holds API data on the right side of the card */}
                                {/* this.renderAdditionalData() */}
                            </div>
                        </CardText>
                    </div>
                </Card>
            </div>
        );
    }
}

export default StationCard;
