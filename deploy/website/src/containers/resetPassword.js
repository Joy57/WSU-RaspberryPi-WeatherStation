import React, { Component } from 'react';
import '../styles/App.css';
import ResetPasswordForm from '../components/registration/resetPasswordForm.js';
import ResetPasswordConfirmForm from '../components/registration/resetPasswordConfirmForm.js';

class ResetPassword extends Component {
  render() {
    if(this.props.match.params.token){
      return(
        <div id="reset-page">
          <ResetPasswordConfirmForm token={this.props.match.params.token}/>
        </div>
      );
    }
    else{
      return (
        <div id="reset-page">
          <ResetPasswordForm/>
        </div>
      );
    }
  }
}

export default ResetPassword;