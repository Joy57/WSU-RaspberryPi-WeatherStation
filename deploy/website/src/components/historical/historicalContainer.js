import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import '../../styles/historical.css';
import { Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input } from 'reactstrap';
import GraphData from './graphContainer'
import DatePicker  from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
var Moment = require('moment');
var MomentRange = require('moment-range');

var moment = MomentRange.extendMoment(Moment);

var shouldDraw = true;



class HistoricalContainer extends Component{
    //set the props for the container
    constructor(props){
        super(props);
        //set the default range of the graph to be the last 24 hours from whatever time it is.
        var oneday = moment().subtract(1, "days");
        var now = moment();
        this.state = {
            stationsData: {},
            stations: [],
            modal: false,
            loading: true, //makes the rendering wait til it is done loading all the data
            sensorType: 'temperature', //default graph is temperature
            fromDate: oneday.format("YYYY-MM-DD HH:mm:ss"), //the props that set the range for the graph
            toDate: now.format("YYYY-MM-DD HH:mm:ss"),
            toBeDrawn: [],
            dateError: false,
            stationError: false,
        }
        this.toggleFilter = this.toggleFilter.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        this.handleFromChange = this.handleFromChange.bind(this);
        this.onStationChange = this.onStationChange.bind(this);
        this.updateGraph = this.updateGraph.bind(this);
    }

    //Function that toggles the filter modal on or off based on its current state
    toggleFilter(){
        this.setState({
            modal: !this.state.modal
        });
        shouldDraw = false;

    }

    //once the component mounts it grabs the sensor data for the graph
    componentDidMount() {
        this.getSensorData()
    }

    //When the to date value is changed in the modal it is handled here
    handleToChange(date) {
        if(date){
            var newDate = date.format("YYYY-MM-DD HH:mm:ss");
            this.setState({
                toDate: newDate
            });
            shouldDraw = false;
        }
    }

    //When the from date value is changed in the modal it is handled here
    handleFromChange(date) {
        if(date){
            var newDate = date.format("YYYY-MM-DD HH:mm:ss");
            this.setState({
                fromDate: newDate
            });
            shouldDraw = false;
        }
    }

    //When the sensor type is changed in the modal it is handled here
    onSenseChange(value) {
        this.setState({
            sensorType: value
        });
        shouldDraw = false;
    }

    onStationChange(e){
        var options = e.target.options;
        var selected = [];
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        this.setState({
            toBeDrawn: selected
        });
        shouldDraw = false;

    }

    getStations = async () =>{
        var names = [];
        const response = await fetch('/api/weather/stations_name/', {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        names = body.names;
        if(this.state.toBeDrawn.length === 0){
            for (var i = 0; i < names.length; i++){
                this.state.toBeDrawn.push(names[i].station_name)
            }
        }
        return names;
    };


    //async call that is grabbing the sensor data based on current state of the props
    getSensorData = async () => {
        var data;
        var stationsDict = {};
        var toDate = this.state.toDate;
        var fromDate = this.state.fromDate;
        var type = this.state.sensorType;
        const response = await fetch('/api/weather/sensorData/' + fromDate +'/' + toDate + '/'+ type, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        });  //API fetch call to get data based on time and sensor type
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        if (body.temp) data = body.temp;            //storing the response from the fetch call in to variable data
        for (var i = 0; i < data.length; i++) {     // for loop to sort through returned data
            //we are storing the data in a dictionary based on station name
            var station_name = data[i].station_name;
            var sensorData = "";
            if (!stationsDict[station_name]) stationsDict[station_name] = {"points": []};  // if the station name is not found in the dictionary yet add it with arrays to store data and time
            if (type === 'temperature') {
                //data is returned in JSON format so based on what sensor type is how we determine to push it into the data array
                sensorData = data[i].temperature;
            }
            else if(type === 'pressure'){
                sensorData = data[i].pressure;
            }
            else if(type === 'humidity'){
                sensorData = data[i].humidity;
            }
            else if(type === 'cpu_usage'){
                sensorData = data[i].cpu_usage;
            }
            else if(type === 'ram_usage'){
                sensorData = data[i].ram_usage;
            }
            //Time is returned as created_at so for that we push it in to the dates array of the station in the dictionary
            stationsDict[station_name]["points"].push({x: data[i].created_at, y: sensorData});

        }
        var newStationsDict = this.processDataPoints(stationsDict);
        var names = await this.getStations();
        this.setState({
            // end the async function by setting the state so that the stations dictionary is stored in stations data
            stationsData: newStationsDict,
            loading: false, // set loading to false so that graph can be rendered
            stations: names
        });
        shouldDraw = true;
    };

    processDataPoints(stationsDict){
        var to = this.state.toDate;
        var from = this.state.fromDate;
        var data;
        var points = [];
        var newStationsDict = {};
        for (var station_name in stationsDict) {
            data = stationsDict[station_name];
            newStationsDict[station_name] = {};
            var dateRange = moment.range(from, to);
            for(var i = 0; i < data["points"].length; i++){
                if(dateRange.diff('days') === 1 || data["points"].length > 1 ){
                    if ( i % 180 === 0){
                        if (data["points"][i]["y"] !== 0){
                            var date = moment(data["points"][i]["x"]).utc(data["points"][i]["x"]).local().format("MM/DD/YY HH:mm:ss");
                            points.unshift({x: date, y: data["points"][i]["y"]});
                        }
                    }
                }

            }
            newStationsDict[station_name]["points"]= points;
            //clear the arrays after storing the data
            points = [];
        }
        return newStationsDict;
    }

    //function upon hitting submit in the modal with new data to update the graph and close the modal
    updateGraph = async () => {
        var today = moment();
        if(this.state.toDate > today.format("YYYY-MM-DD HH:mm:ss") || this.state.fromDate > this.state.toDate
            || this.state.to < this.state.fromDate){
            this.setState({
                dateError: true
            });
        }

        else if(this.state.toBeDrawn.length > 5 ){
            this.setState({
                stationError: true
            });
        }

        else{
            this.setState({
                loading: true,
                dateError: false,
                stationError: false,
                modal: false,
            });
            shouldDraw = true;
            await this.getSensorData();//call the async function to get the data based on the new parameters set by the filter
        }

    };


    renderStations(){
        var options = [];
        this.state.stations.map((station, index) => {
            options.push(<option key={"name" + index} value={station.station_name}>{station.station_name}</option>);
            return null;
        });
        return options;
    }

    //function that handles the rendering of the graph it is done by sensor type
    renderGraph(){
        return(
            <GraphData
                //passes the stations data to the graph component
                data={this.state.stationsData}
                stations={this.state.toBeDrawn}
                from={this.state.fromDate} // passes the to and from dates to the graph component
                to={this.state.toDate}
                height={500} //The height and width of the graph is passed to the graph component
                width={"100%"}
                sensorType={this.state.sensorType}
                shouldUpdate={shouldDraw}
            />
        );
    }

    renderDateError(){
        if(this.state.dateError === true){
            return(
                 <Alert className='alert-danger error-alert'>Invalid date range selected</Alert>
            );
        }
    }

    renderStationsError(){
        if(this.state.stationError === true ){
            return(
                <Alert className='alert-danger error-alert'>You may only select 5 stations to draw</Alert>
            );
        }
    }
    
    render(){
        if(this.state.loading === false){   // if the state is no longer loading then it will render the page
            return(
                <div className="historical-container">
                    <Modal isOpen={this.state.modal} className="filter-modal" toggle={this.toggleFilter}>
                        <ModalHeader toggle={this.toggleFilter}>Filter Historical Graph</ModalHeader>
                        <form id='filterForm'>
                            <ModalBody>
                                <div className='form-group'>
                                    <label>Data Type</label>
                                    <Input type="select" name='senseType' id='senseType' value={this.state.sensorType} onChange={e => this.onSenseChange(e.target.value)}>
                                        <option value='temperature'>Temperature</option>
                                        <option value='humidity'>Humidity</option>
                                        <option value='pressure'>Pressure</option>
                                        <option value='cpu_usage'>CPU Usage</option>
                                        <option value='ram_usage'>RAM Usage</option>
                                    </Input>
                                </div>
                                <div className='form-group'>
                                    {this.renderDateError()}
                                    <div className="row">
                                        <div className="col-6">
                                            <label for="dateBegin" className="form-label">From</label>
                                            <DatePicker
                                                id='dateBegin' 
                                                name='dateBegin'
                                                dateFormat="YYYY-MM-DD HH:mm:ss"
                                                className='form-control'
                                                placeholderText="From Datetime"
                                                selected={moment(this.state.fromDate)}
                                                onChange={this.handleFromChange}
                                                showTimeSelect />
                                        </div>
                                        <div className="col-6">
                                            <label for="dateEnd" className="form-label">To</label>
                                            <DatePicker
                                                id='dateEnd' 
                                                name='dateEnd'
                                                dateFormat="YYYY-MM-DD HH:mm:ss"
                                                className='form-control'
                                                placeholderText="To Datetime"
                                                selected={moment(this.state.toDate)}
                                                onChange={this.handleToChange}
                                                showTimeSelect />
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    {this.renderStationsError()}
                                    <FormGroup>
                                        <label for="stations" className="form-label">Stations</label>
                                        <Input type="select" name="selectMulti" id="SelectMulti" onChange={this.onStationChange} multiple>
                                            {this.renderStations()}
                                        </Input>
                                    </FormGroup>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button type='button' color="secondary" onClick={this.toggleFilter}>Cancel</Button>
                                <Button type='button' color="primary" onClick={this.updateGraph}>Submit</Button>
                            </ModalFooter>
                        </form>
                    </Modal>
                    <div className="filter row">
                        <Button type='button' color="primary" className="btn btn-primary filter-btn" id="filter" onClick={this.toggleFilter}>Filter</Button>
                    </div>
                    {this.renderGraph() }
                </div>
            )
        }

       else {
            return (
                <div className="loading-spinner container">
                    <ReactLoading type={'spin'} color={'#4bc0c0'}/>
                </div>
            );
        }
    }
}
export default HistoricalContainer;