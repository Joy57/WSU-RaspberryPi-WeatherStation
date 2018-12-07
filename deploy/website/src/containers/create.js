import React, { Component } from 'react';
import '../styles/App.css';
import CreateUserForm from '../components/registration/createUserForm.js';

class Create extends Component {
  render() {
    return (
        <div id="reset-page">
          <CreateUserForm/>
        </div>
    );
  }
}

export default Create;