import React, { Component } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

class RunningServer extends Component {
    // Constructor called when the component is loaded in
    constructor() {
        super();
        this.state = {
            modal: false,
            server: 1
        };
    }

    render() {
        return (
            <div className="container admin-content">
                <p>Currently running on server #<font color="red">{this.state.server}</font></p>
            </div>
        );
  }
}

export default RunningServer;