import React, { Component } from 'react';
import VerifyLoggedIn from '../components/verifyLoggedIn.js'
import AlertsList from '../components/alerts/alertsList.js';
import '../styles/alerts.css';

class Alerts extends Component {
    render() {
        return (
            <div className='AlertsPage'>
                <VerifyLoggedIn/>
                <AlertsList/>
            </div>

        );
    }
}

export default Alerts;