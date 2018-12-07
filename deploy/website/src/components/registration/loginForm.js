import React, { Component } from 'react';
import '../../styles/login.css';

import {Alert, Button, Input} from 'reactstrap';
import { Redirect } from 'react-router';
import Cookies from 'js-cookie';
import _ from 'lodash';

import logo from '../../images/space-satellite-dish-512x512.png';

class LoginForm extends Component {
    constructor(props){
        super(props);

        var loggedIn = Cookies.get('loggedIn')
        if (_.isUndefined(loggedIn)) loggedIn = false;
        
        if(this.props.location.state){
            this.state={
                username:'',
                password:'',
                messages: this.props.location.state.errors,
                errors: [],
                redirect:false,
                loggedIn: loggedIn
            };
        }
        else{
            this.state={
                username: '',
                password: '',
                messages: [],
                errors: [],
                redirect: false,
                loggedIn: loggedIn
            };
        }

        this.submitForm = this.submitForm.bind(this);
        this.renderErrors = this.renderErrors.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.createRedirect = this.createRedirect.bind(this);
    }
    onUsernameChange(value){
        this.setState({
          username: value
        })
    }
    onPasswordChange(value){
        this.setState({
          password: value
        })
    }

    submitForm = async () => {
        var response = await fetch('/api/user/login/', 
            {method: 'post', 
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
            }),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials:'include'
            });

        var body = await response.json();

        if(body.redirect === 'true'){
            await Cookies.set('loggedIn', 'true')
        }
        this.setState({
          errors: body.errors,
          redirect: body.redirect
        })
    }
    handleKeyPress(target){
        if(target.charCode === 13){
            this.submitForm();
        }
    }
    createRedirect(){
        this.setState({
            redirect:true
        })
    }
    renderMessages(){
        if(this.state.messages.length > 0){
            var allMessages = []
            this.state.messages.map(msg => {
                allMessages.push(<Alert classname='error-alert'>{msg.msg}</Alert>);
                return null;
            })
            return allMessages;
        }
    }
    renderErrors(){
        if(this.state.errors.length > 0){
            var allErrors = []
            this.state.errors.map(errors =>{
                allErrors.push(<Alert className='alert-danger login-error'>{errors.msg}</Alert>)
                return null;
            })
          return allErrors;
        }
    }
    render(){
        if(this.state.loggedIn === 'true'){
            return (<Redirect to='/'/>)
        }
        else if(this.state.redirect){
            return (<Redirect to='/user/create'/>)
        }
        else{
            return(
                <div id='login-page'> 
                    <div className='login-container'>
                        <img src={logo} className="login-logo" width="200" height="200" alt=""></img>
                        {this.renderErrors()} 
                        {this.renderMessages()}               
                        <form id='loginForm'>
                            <div className='login-info mb-3'>
                            <div className='col-12 row'>
                                <a className="forgot-link" id="forgot" href="/user/reset">Forgot password?</a> 
                            </div>
                            <div className='form-group'>
                                <Input id='username' name='username' type='text' className='form-control' placeholder='Username' onKeyPress={this.handleKeyPress} onChange={e => this.onUsernameChange(e.target.value)}/>
                            </div>
                            <div className='form-group'>
                                <Input id='password' name='password' type='password' className='form-control' placeholder='Password' onKeyPress={this.handleKeyPress} onChange={e => this.onPasswordChange(e.target.value)}/>
                            </div>
                            </div>
                            <div className='row'>
                                <div className='col-6'>
                                    <Button type='button' onClick={this.createRedirect} className='btn btn-secondary btn-block register-btn'>Register</Button>
                                </div>
                                <div className='col-6'>
                                    <Button type='button' onClick={this.submitForm} className='btn btn-secondary btn-block login-btn'>Login</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <footer id="footer-id" className="footer white-footer">
                        <a href="https://goodstuffnononsense.com/hand-drawn-icons/space-icons/" rel="noopener noreferrer" target="_blank">Satellite Icon</a> By <a href="https://goodstuffnononsense.com/about/" rel="noopener noreferrer" target="_blank">Agata</a> / <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="_blank">CC BY</a>
                    </footer>
                </div>
            )
        }
    }
}

export default LoginForm;