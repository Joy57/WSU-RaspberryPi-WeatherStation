import React, { Component } from 'react';
import { getMarkerStyle, getContainerStyle, FadeAndSlideUpInfo, FadeAndSlideUpLabel } from './markerStyles'
import '../../styles/map.css';

class Marker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            station: this.props.station,
            hover: this.props.hover,
            label: this.props.label,
            neverHover: this.props.neverHover
        }
    }

    // Update the hover status when mousing over this marker
    componentWillReceiveProps(nextProps){
        var hover = nextProps.$hover;
        if (hover !== this.state.hover){
            this.updateHover(hover);
        }

        var label = nextProps.label;
        if (label !== this.state.label){
            this.updateLabel(label);
        }

        if (nextProps.neverHover !== this.state.neverHover){
            this.setState({ neverHover: nextProps.neverHover });
        }
    }

    // Updates the hover state attribute
    updateHover(hover) {
        if (!this.state.neverHover){
            if (this.state.label === true) this.updateLabel(!this.state.label);
            this.setState({ hover: hover })
        }
    }

    updateLabel(label) {
        this.setState({ label: label })
    }

    renderLabel(label){
        return(
            <FadeAndSlideUpLabel in={this.state.hover} label={this.state.label}>
                <span className="marker-label-title">{this.state.station.station_name}</span>
            </FadeAndSlideUpLabel>
        );
    }

    render() {
        const cStyle = getContainerStyle(this.state.hover);
        const mStyle = getMarkerStyle(this.state.hover, this.props.$getDimensions(this.props.markerId));
        
        return (
            <div style={cStyle} className="marker-container">
                <FadeAndSlideUpInfo in={this.state.hover}>
                    <div className="col-12">
                        <p className="marker-info-title">{this.state.station.station_name}</p>
                    </div>
                    <p className="marker-info-text">temperature: {this.props.station.temperature} &deg;F</p>
                    <p className="marker-info-text">pressure: {this.props.station.pressure} hPa</p>
                    <p className="marker-info-text">humidity: {this.props.station.humidity}%</p>
                </FadeAndSlideUpInfo>
                { this.renderLabel(this.state.label) }
                <i style={mStyle} className="fa fa-map-marker marker-icon" aria-hidden="true"></i>
            </div>
        ); 
    }

}

export default Marker;