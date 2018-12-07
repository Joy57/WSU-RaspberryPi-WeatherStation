import React, { Component } from 'react';
import '../../styles/login.css';
import {Alert, Button, Input} from 'reactstrap';
import { Redirect } from 'react-router';
import Cookies from 'js-cookie';
import _ from 'lodash';

class CreateUserForm extends Component {
    constructor(props){
        super(props);
        var loggedIn = Cookies.get('loggedIn')
        if (_.isUndefined(loggedIn)) loggedIn = false;
        this.state={
            redirect: false,
            return: false,
            username: '',
            email: '',
            password: '',
            confirmPass: '',
            errors: [],
            loggedIn: loggedIn 
        };
        this.submitForm = this.submitForm.bind(this);
        this.renderErrors = this.renderErrors.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.return = this.return.bind(this);
    }
    //sets state based on value entered by user in the fields
    onUsernameChange(value){
        this.setState({
          username: value
        })
    }
    onEmailChange(value){
        this.setState({
          email: value
        })
    }
    onPasswordChange(value){
        this.setState({
          password: value
        })
    }
    onConfirmPassChange(value){
        this.setState({
            confirmPass: value
        })
    }
    handleKeyPress(target){
        if(target.charCode === 13){
            this.submitForm();
        }
    }
    return(){
        this.setState({
            return: true
        })
    }
    //sents data for user account to back end
    //errors are returned (if they exist) and the redirect flag is set (true if user's account was created successfully)
    submitForm = async () => {
        var response = await fetch('/api/user/create/', 
            {method: 'post', 
            body: JSON.stringify({
                username: this.state.username,
                email: this.state.email,
                password: this.state.password,
                confirmPass: this.state.confirmPass
            }),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials:'include'
            });
        var body = await response.json();
        this.setState({
          errors: body.errors,
          redirect: body.redirect
        })

    }
    //displays any errors on the page if they were returned from the backend
    renderErrors(){
        if(this.state.errors.length > 0){
            var allErrors = []
            this.state.errors.map(errors =>{
                allErrors.push(<Alert className='alert-danger error-alert'>{errors.msg}</Alert>)
                return null;
            })
          return allErrors;
        }
    }
    render(){
        //redirects user if the flag was set
        if(this.state.loggedIn === 'true'){
            return(<Redirect to='/'/>)
        }
        else if(this.state.return){
            return ( <Redirect to='/user/login'/>)
        }
        else if(this.state.redirect){
            return ( <Redirect to={{pathname: '/user/login', state: {errors: [{msg: "Your account and been created and is currently pending Admin approval"}]}}}/>)
        }
        else{
            return(
            <div className='register-container'> 
            <h2 className="login-title">Create Account</h2> 
            <form id='createForm'>
              <div className='login-info mb-3'>
                <div className='form-group'>            
                {this.renderErrors()}

                  <Input id='username' name='username' type='text' className='form-control' placeholder='Username' onKeyPress={this.handleKeyPress} onChange={e => this.onUsernameChange(e.target.value)}/>
                </div>
                <div className='form-group'>
                  <Input id='email' name='email' type='email' className='form-control' placeholder='Email' aria-label='Email' onKeyPress={this.handleKeyPress} onChange={e => this.onEmailChange(e.target.value)} />
                </div>
                <div className='form-group'>
                  <Input id='password' name='password' type='password' className='form-control' placeholder='Password' aria-label='Password' onKeyPress={this.handleKeyPress} onChange={e => this.onPasswordChange(e.target.value)} />
                </div>
                <div className='form-group'>
                  <Input id='confirmPass' name='confirmPass' type='password' className='form-control' placeholder='Confirm Password' aria-label='Confirm Password' onKeyPress={this.handleKeyPress} onChange={e => this.onConfirmPassChange(e.target.value)} />
                </div>
              </div>
              <div className='row'>
                <div className='col-6'>
                  <Button type='button' onClick={this.return} className='btn btn-default btn-block return-btn'>Return</Button>               
                </div>
                <div className='col-6'>
                  <Button type='button' onClick={this.submitForm} className="btn btn-default btn-block submit-btn">Submit</Button>
                </div>
              </div>
            </form>
        </div>
        )}
    }
}

export default CreateUserForm;