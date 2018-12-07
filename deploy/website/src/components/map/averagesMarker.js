import React, { Component } from 'react';
import { averagesStyle } from './markerStyles'
import _ from 'lodash';
import '../../styles/map.css';

class AveragesMarker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            averages: this.props.averages,
            show: this.props.show,
            index: this.props.index
        }
    }

    // When receiving new props, check if the averages or show state has changed
    // If either has changed, update it
    componentWillReceiveProps(nextProps){
        if (this.state.averages !== nextProps.averages){
            this.setState({ averages: nextProps.averages });
        }

        if (nextProps.show !== this.state.show){
            this.setState({ show: nextProps.show });
        }

        if (nextProps.index !== this.state.index){
            this.setState({ index: nextProps.index });
        }
    }

    // Render a div with the 3 averages fixed to 2 decimal points
    renderAverages(){
        var temperature = this.state.averages.temperature.toFixed(2);
        var pressure = this.state.averages.pressure.toFixed(2);
        var humidity = this.state.averages.humidity.toFixed(2)

        if (_.isNaN(this.state.averages.temperature)) temperature = 0.0;
        if (_.isNaN(this.state.averages.pressure)) pressure = 0.0;
        if (_.isNaN(this.state.averages.humidity)) humidity = 0.0;

        return (
            <div>
                <p className="marker-info-text">temperature: {temperature} &deg;F</p>
                <p className="marker-info-text">pressure: {pressure} hPa</p>
                <p className="marker-info-text">humidity: {humidity}%</p>
            </div>
        );
    }

    render() {
        // Only show if the prop passed down to it is true
        if (this.state.show){
            return (
                <div style={averagesStyle} className="averages-container">
                    <p className="marker-info-title left">Weather Averages</p>
                    <i className="fa fa-times average-marker-remove right" onClick={() => {this.props.removeCircle(this.state.index)}} aria-hidden="true"></i>
                    { this.renderAverages() }
                </div>
            ); 
        }

        else return null;
    }

}

export default AveragesMarker;