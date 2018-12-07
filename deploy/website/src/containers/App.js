import React, { Component } from 'react';
import '../styles/App.css';
import Navigation from '../components/navigation.js';
import Station from '../containers/stations.js';
import Map from '../containers/map.js';
import Create from '../containers/create.js';
import Historical from '../containers/historical.js';
import Health from '../containers/health.js';
import ResetPassword from '../containers/resetPassword.js';
import Alerts from '../containers/alerts.js'
import ProfileForm from '../components/registration/profileForm.js';
import VerifyLoggedIn from '../components/verifyLoggedIn.js'
import Admin from '../containers/admin.js'
import LoginForm from '../components/registration/loginForm.js';
import _ from 'lodash';

import {BrowserRouter as Router, Route} from 'react-router-dom';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      email: '',
      phone: '',
      isAdmin: false,
      permissions: ''
    }
  }

  componentDidMount(){
    this.getUser();
  }

  getUser = async() => {
    var response = await fetch('/api/user/getUserInfo', 
      { method: 'post', 
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    var body = await response.json();

    if (body.length > 0){
      if(_.isNull(body[0].phone)){
        this.setState({username: body[0].username, email: body[0].email, permissions: body[0].type});
      } else{
        this.setState({username: body[0].username, email: body[0].email, phone: body[0].phone, permissions: body[0].type});
      }
    }

    return body;
  }

  renderNav = () => {
    if (!window.location.pathname.includes('/user')){
      return (
        <Navigation 
          username={this.state.username}
          getUser={this.getUser}
          permissions={this.state.permissions}
        />
      );
    }

    else return null;
  }

  renderProfile = (props) => {
    return (
    <div className='ProfilePage'>
      <VerifyLoggedIn/>
      <ProfileForm
        username={this.state.username} 
        email={this.state.email} 
        phone={this.state.phone} 
        permissions={this.state.permissions}
      {...props}
      />
    </div>
    )
  }

  renderAdmin = (props) => {
    return(
      <div id="admin-page">
        <Admin permissions={this.state.permissions}/>
      </div>
    )
  }

  renderStations = (props) => {
    return(
      <div id="stations-page">
        <Station permissions={this.state.permissions}/>
      </div>
    )
  }

  render(props) {
    return (
      <Router>
        <div className="App">
          <Route path='/' username={this.state.username} render={this.renderNav}/>  
          <div className="main">
            <Route path="/" render={this.renderStations} exact/>
            <Route path="/map" component={Map}/>
            <Route path="/user/login" component={LoginForm}/>
            <Route path="/user/create" component={Create}/>  
            <Route path="/user/reset" component={ResetPassword} exact/>
            <Route path="/user/reset/:token" component={ResetPassword}/>
            <Route path="/profile" render={this.renderProfile}/>
            <Route path="/historical" component={Historical}/>
            <Route path="/health" component={Health}/>
            <Route path="/alerts" component={Alerts}/>
            <Route path="/admin" render={this.renderAdmin}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
