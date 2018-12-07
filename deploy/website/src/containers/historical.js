import React, { Component } from 'react';
import VerifyLoggedIn from '../components/verifyLoggedIn.js'
import HistoricalContainer from '../components/historical/historicalContainer'
import '../styles/historical.css';

class Historical extends Component {
    render() {
        return (
            <div className='NavBar'>
                <VerifyLoggedIn/>
                <div className="container">
                    <h2 className="historical-page-title">Historical Graph</h2>
                    <div className="row">
                        <HistoricalContainer></HistoricalContainer>
                    </div>
                 </div>
            </div>
        );
    }
}



export default Historical;
