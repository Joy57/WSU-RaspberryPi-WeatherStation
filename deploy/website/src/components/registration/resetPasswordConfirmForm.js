import React, { Component } from 'react';
import '../../styles/login.css';
import {Alert, Button, Input} from 'reactstrap';
import { Redirect } from 'react-router';

class ResetPasswordConfirmForm extends Component {
    constructor(props){
        super(props);
        this.state={
            newPass: '',
            confirmPass: '',
            redirect: false,
            errors: [],
        }
        this.tokenUrl = '/api/user/reset/' + this.props.token;
        this.renderErrors = this.renderErrors.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    submitForm = async () => {
        var response = await fetch(this.tokenUrl, 
            {method: 'post', 
            body: JSON.stringify({
                newPass: this.state.newPass,
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
            redirect: body.redirect,
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
    onPasswordChange(value){
        this.setState({
            newPass: value
        })
    }
    onPasswordConfirmChange(value){
        this.setState({
            confirmPass: value
        })
    }
    handleKeyPress(target){
        if(target.charCode === 13){
            this.submitForm();
        }
    }
    render(){
        if(this.state.redirect){
            return ( <Redirect to={{pathname: '/user/login', state: {errors: [{msg: "Your password has been updated and you can now login"}]}}}/>)
        }
        else{
            return(
                <div className="confirm-container">
                    <h2 className="login-title">Reset Password</h2> 
                    <form className='ResetPasswordForm'>
                        {this.renderErrors()}
                        <div className='form-group'>
                            <Input id='newPass' name='newPass' type='password' class='form-control' placeholder='Password' onKeyPress={this.handleKeyPress} onChange={e => this.onPasswordChange(e.target.value)}/>
                        </div>
                        <div className='form-group'>
                            <Input id='confirmPass' name='confirmPass' type='password' class='form-control' placeholder='Confirm Password' onKeyPress={this.handleKeyPress} onChange={e => this.onPasswordConfirmChange(e.target.value)}/>
                        </div>
                        <div className='row'>
                            <div className='col-6'>
                                <Button type='button' onClick={this.submitForm} className='btn btn-default btn-block login-btn'>Reset Password</Button>
                            </div>
                        </div>
                    </form>
                </div>
            )
        }
    }
}

export default ResetPasswordConfirmForm;
