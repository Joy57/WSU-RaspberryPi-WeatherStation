import React, { Component } from 'react';
import '../../styles/stations.css';

class ConnectionIndicator extends Component {
    constructor(props){
        super(props);
        this.state = {
            color: '#e21f1f',
            apikey: this.props.apikey,
            connected: this.props.connected
        }
    }

    // Set the status color based on the initial updated time passed
    // to this component
    componentDidMount() {
        this.setState({
            connected: this.props.connected
        })
    }

    // Each time the station card updates, pass down the new 
    // props (updated time in this case)
    componentWillReceiveProps(nextProps) {
        if (this.state.connected !== nextProps.connected) this.setState({connected: nextProps.connected});
    }

    render() {
        if (this.state.connected === 1){
            return (
                <span className="connection-indicator-icon"><i class="fa fa-plug" aria-hidden="true"></i></span>
            );
        }

        else{
            return (
                <span className="connection-indicator" style={{backgroundColor: "#ff2626"}}></span>
            );
        }
    }
}

export default ConnectionIndicator;
