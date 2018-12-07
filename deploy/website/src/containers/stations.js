import React, { Component } from 'react';
import '../styles/App.css';
import StationList from '../components/stations/stationList.js';
import VerifyLoggedIn from '../components/verifyLoggedIn.js'

class Stations extends Component {
  constructor(props) {
      super(props);
      this.state = {
          permissions: props.permissions
      };
  }

  componentWillReceiveProps(nextProps){
      if(nextProps.permissions !== this.state.permissions){
          this.setState({
              permissions: nextProps.permissions
          })
      }
  }

  render() {
    return (
      <div className='station-list'>
        <VerifyLoggedIn/>
        <StationList permissions={this.state.permissions}/>
      </div>
    );
  }
}

export default Stations;
