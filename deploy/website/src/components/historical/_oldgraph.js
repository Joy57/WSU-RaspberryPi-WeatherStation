import React, { Component } from 'react';
import '../../styles/historical.css';
import { Scatter } from 'react-chartjs-2'
var Moment = require('moment');
var MomentRange = require('moment-range');

var moment = MomentRange.extendMoment(Moment);

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: this.props.height,
            width: this.props.width,
            maxDate: this.props.maxDate,
            minDate: this.props.minDate,
            sensorType: this.props.sensorType,
            datasets: this.props.datasets,
            shouldUpdate: this.props.shouldUpdate
        }
    }


    render(){
        //render each dataset that has been made below sets the styling of the overall graph and chart not the lines
        var min = this.state.minDate;
        var max = this.state.maxDate;
        var dateRange = moment.range(min, max);
        var labelString = " ";
        var callback;
        if (this.state.sensorType === 'temperature'){
            labelString = "Temperature";
            callback = function(value, index, values) {
                return value + '°';     // add the degree symbol to the points on the y axis
            }
        }

        else if (this.state.sensorType === 'humidity'){
            labelString = "Humidity";
            callback = function(value, index, values) {
                return value + '%';     // add the degree symbol to the points on the y axis
            }
        }

        else if (this.state.sensorType === 'pressure'){
            labelString = "Pressure";
            callback = function(value, index, values) {
                return value + 'hPa';     // add the degree symbol to the points on the y axis
            }
        }
        if(dateRange.diff('days') === 1 || dateRange.diff('days') < 1 ) var unit = 'hour';
        else unit = 'day';

        
        return(
            <div className='graph'>
                <Scatter
                    data={this.state.datasets}      //load in the datasets aka lines to be drawn
                    width={this.state.width}        // set the width and the height
                    height={this.state.height}
                    // spanGaps={{}}
                    options={{
                        maintainAspectRatio: false,    //options setup the styling for the graph setting the x and y axis
                        showLines: true,
                        animation: false,
                        scales: {
                            xAxes: [{
                                stacked: false,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Time',
                                    fontFamily: 'Roboto Mono',
                                    fontColor: '#000',
                                    fontSize: 15
                                },
                                type: 'time',
                                time: {
                                    unit: unit,
                                    displayFormats: {
                                        hour: 'HH:mm',
                                        day: 'MM/DD/YYYY',
                                    },
                                    min: min,
                                    max: max
                                },
                                gridLines: {
                                    drawBorder: true,
                                },
                                ticks: {
                                    fontColor: '#000',
                                    fontFamily: 'Roboto Mono',
                                    fontSize: 15
                                },
                            }],
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: labelString,
                                    fontFamily: 'Roboto Mono',
                                    fontColor: '#000',
                                    fontSize: 15
                                },
                                type: 'linear',
                                ticks: {
                                    fontColor: '#000',
                                    fontFamily: 'Roboto Mono',
                                    fontSize: 15,
                                    callback: callback
                                },
                                gridLines: {
                                    borderDash: [2,1],
                                    drawBorder: false
                                }
                            }],
                        },
                    }}
                />
            </div>
        );
    }
}
export default Graph;