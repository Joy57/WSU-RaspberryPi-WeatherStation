import React, { Component } from 'react';
import { Alert } from 'reactstrap';
import '../../styles/historical.css';
import Graph from './graph'

var colorsGraph = ['#4bc0c0', '#c0864b', '#4b86c0', '#c04b4b', '#c0c04b', '#4bc086', '#c04b86', '#327c0c'];  // Array of colors to be choosen when drawing multiple lines on the graph
var colorIndex = 0;   //variable to keep track of what index is currently selected in the graph

class GraphData extends Component{
    constructor(props) {
        super(props);
        this.state = {
            // set the state to be the props that were passed to it by historical container
            data: this.props.data,
            stations: this.props.stations,
            height: this.props.height,
            from: this.props.from,
            to: this.props.to,
            width: this.props.width,
            sensorType: this.props.sensorType,
            datasets: {"datasets": []}, // a dictionary of datasets to be drawn on the graph
            shouldUpdate: this.props.shouldUpdate
        }
    }

    componentWillReceiveProps(nextProps){
        var data = (nextProps.data !== this.state.data) ? nextProps.data : this.state.data;
        var stations = (nextProps.stations !== this.state.stations) ? nextProps.stations : this.state.stations;
        var from = (nextProps.from !== this.state.from) ? nextProps.from : this.state.from;
        var to = (nextProps.to !== this.state.to) ? nextProps.to : this.state.to;
        var sensorType = (nextProps.sensorType !== this.state.sensorType) ? nextProps.sensorType : this.state.sensorType;

        if (data !== this.state.data || stations !== this.state.station || from !== this.state.from ||
            to !== this.state.to || sensorType !== this.state.sensorType){
                this.setState({
                    data: data,
                    stations: stations,
                    from: from,
                    to: to,
                    sensorType: sensorType ,
                    datasets: {"datasets": []}
                }, () => {
                    colorIndex = 0;
                    this.updateGraph();
                });
        }
    }
    shouldComponentUpdate(nextProps){
        if(nextProps.shouldUpdate){
            return true
        }
        else{
            return false
        }

    }

    updateGraph(){
        var data;
        var stations = this.state.stations;
        for (var station_name in this.state.data) {
            data = this.state.data[station_name];
            //this.createLines(station_name, data["sensorData"], data["dates"]);
            if(stations.includes(station_name)){
                //create the lines for each station based on its data that has been passec
                this.createLine(station_name, data["points"])
            }
        }
        this.setState({
            shouldUpdate: false
        })
    }

    componentDidMount(){
        var data;
        var stations = this.state.stations;
        for (var station_name in this.state.data) {
            data = this.state.data[station_name];
            //this.createLines(station_name, data["sensorData"], data["dates"]);
            if(stations.includes(station_name)){
                //create the lines for each station based on its data that has been passec
                this.createLine(station_name, data["points"])
            }
        }
    }

    componentWillUnmount() {
        // reset the color index upon the page being unloaded
        colorIndex = 0;
    }

    //function for creating the line on the graph based on station data
    createLine(name, data) {
        var datasets = this.state.datasets;     //creating a variable of datasets based on what it currently is because it will be added on too
        const newDataset = {            //creating the new dataset for the line and setting the styling
                label: name,
                fill: false,
                lineTension: 0.1,
                backgroundColor: colorsGraph[colorIndex],       //creating the color of the line based on the current position of the color array
                borderColor: colorsGraph[colorIndex],
                borderDash: [8, 4],
                borderWidth: 2,
                borderJoinStyle: 'miter',
                pointRadius: 4,
                pointHitRadius: 10,
                pointBorderColor: colorsGraph[colorIndex],
                pointBackgroundColor: '#fff',
                pointBorderWidth: 3,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: colorsGraph[colorIndex],
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                data: data,                                 //storing the actual data to be plotted for the line
        };
        datasets["datasets"].push(newDataset);      // push the new dataset in to the array of datasets to be drawn
        this.setState({
            datasets: datasets                      // set the state with the new dataset that has been added to it
        });
        if (colorIndex === colorsGraph.length - 1) colorIndex = 0
        else colorIndex++;  //other wise move the index to the next position
    }

    render(){

        if (this.state.datasets["datasets"].length > 0){
            return(
                <Graph className="row graph"
                    //passes the stations data to the graph component
                    height={500} //The height and width of the graph is passed to the graph component
                    width={"100%"}
                    maxDate={this.state.to}
                    minDate={this.state.from}
                    sensorType={this.state.sensorType}
                    datasets={this.state.datasets}
                    shouldUpdate={this.state.shouldUpdate}
                />
            );
        }
        else{ //if there is nothing loaded in to data sets thats because no data was returned so no weather data
            return(
                <div className='col-12 no-data-alert'>
                    <Alert color="primary">There is no weather data for this filter.</Alert>
                </div>
            );
        }
    }
}
export default GraphData;