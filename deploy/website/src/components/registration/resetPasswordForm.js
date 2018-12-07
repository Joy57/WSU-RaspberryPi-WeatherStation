import React, { Component } from 'react';
import '../../styles/login.css';
import {Alert, Button, Input, Form} from 'reactstrap';
import { Redirect } from 'react-router';
import Cookies from 'js-cookie';
import _ from 'lodash';


class ResetPasswordForm extends Component {
    constructor(props){
        super(props);

        var loggedIn = Cookies.get('loggedIn')
        if (_.isUndefined(loggedIn)) loggedIn = false;
        
        this.state={
            email: '',
            errors: [],
            loggedIn: loggedIn,
            redirect: false
        };
        this.submitForm = this.submitForm.bind(this);
        this.renderErrors = this.renderErrors.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.return = this.return.bind(this);
    }
    submitForm = async () => {
        var response = await fetch('/api/user/reset/', 
            {method: 'post', 
            body: JSON.stringify({
                email: this.state.email,
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
        })
    }
    renderErrors(){
        if(this.state.errors.length > 0){
            var allErrors = []
            this.state.errors.map(errors =>{
                allErrors.push(<Alert className='error-alert'>{errors.msg}</Alert>)
                return null;
            })
          return allErrors;
        }
    }
    onEmailChange(value){
        this.setState({
            email: value
        })
    }
    handleKeyPress(target){
        if(target.charCode === 13){
            target.preventDefault();
            this.submitForm();
        }
    }
    return(){
        this.setState({
            redirect: true
        })
    }
    render(){
        if(this.state.loggedIn === 'true'){
            return (<Redirect to='/'/>)
        }
        else if(this.state.redirect){
            return (<Redirect to='/user/login'/>)
        }
        else{
            return(
                <div id='reset-password-page'>
                    <div className="forgot-container">
                        <h2 className="login-title">Reset Password</h2> 
                        {this.renderErrors()}
                        <Form id='ResetPasswordForm'>
                            <div className='form-group'>
                                <Input id='email' name='email' type='email' class='form-control' placeholder='Email' onKeyPress={this.handleKeyPress} onChange={e => this.onEmailChange(e.target.value)}/>
                            </div>
                            <div className='row'>
                                <div className='col-6'>
                                    <Button type='button' onClick={this.return} className='btn btn-default btn-block return-btn'>Return</Button>
                                </div>
                                <div className='col-6'>
                                    <Button type='button' onClick={this.submitForm} className='btn btn-default btn-block recover-btn'>Recover Password</Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            )   
        }

    }
}

export default ResetPasswordForm;
