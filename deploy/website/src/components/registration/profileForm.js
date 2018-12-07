import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import '../../styles/profile.css';

class ProfileForm extends Component {
    constructor(props){
        super(props);
        this.state={
            modal: false,
            email: this.props.email,
            phone: this.props.phone,
            currPass: '',
            newPass: '',
            confirmPass: '',
            messages: []
        }
        this.renderMessages = this.renderMessages.bind(this);
        this.toggleChangePassword = this.toggleChangePassword.bind(this);
    }
    componentWillReceiveProps(nextProps){
        if (this.state.email !== nextProps.email){
            this.setState({email: nextProps.email});
        }

        if (this.state.phone !== nextProps.phone){
            this.setState({phone: nextProps.phone});
        }
    }
    toggleChangePassword(){
        this.setState({
            modal: !this.state.modal
        })
    }
    onEmailChange(value){
        this.setState({
            email: value
        })
    }
    onPhoneChange(value){
        this.setState({
            phone: value
        })
    }
    //Sends data entered by user to the backend to update their email or phone numbrer
    updateProfile = async () =>{
        var response = await fetch('/api/user/editProfile/', 
            {method: 'post', 
            body: JSON.stringify({
                email: this.state.email,
                phone: this.state.phone,
            }),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials:'include'
            });

        var body = await response.json();

        this.setState({
            messages: body.messages
        })
    }
    //renders error messages or success messages if any are returned from backend
    renderMessages(){
        if(this.state.messages.length > 0){
            var allMessages = [];
            this.state.messages.map(messages => {
                if (messages.msg === "Profile updated successfully!"){
                    allMessages.push(<Alert className='alert-primary'>{messages.msg}</Alert>)
                }

                else{
                    allMessages.push(<Alert className='alert-danger'>{messages.msg}</Alert>)
                }
                return null;
            })
            return allMessages
        }
    }
    render(){
        return(
            <div className='profile-container'>
             <Modal isOpen={this.state.modal} toggle={this.toggleChangePassword}>
                <ModalHeader toggle={this.toggleChangePassword}>Change Password</ModalHeader>
                {/* Form that will make a call to the api to change the users password when submitted */}
                <form id='passwordForm' action='/api/user/editPassword' method='post'>
                    <ModalBody>
                        <div className='form-group'>
                            <label for="currPass" class="form-label">Current Password</label>
                            <input id='currPass' name='currPass' type='password' className='form-control'/>
                        </div>
                        <div className='form-group'>
                            <label for="newPass" class="form-label">New Password</label>
                            <input id='newPass' name='newPass' type='password' className='form-control'/>
                        </div>
                        <div className='form-group'>
                            <label for="confirmPass" class="form-label">Confirm Password</label>
                            <input id='confirmPass' name='confirmPass' type='password' className='form-control'/>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                            <Button type='submit' color="primary" className="primary-themed-btn" >Change Password</Button>{' '}
                            <Button type='button' color="secondary" onClick={this.toggleChangePassword}>Cancel</Button>
                    </ModalFooter>
                </form>
             </Modal>
                <div id='profile'>
                    <h2 className="profile-page-title">User Profile</h2>
                    <form id='profileForm'>
                        <div className='profile-info'>
                            {this.renderMessages()}
                            <div className='row'>
                                <label class="col-sm-4 col-form-label">Username</label>
                                <div class="form-group col-sm-8">
                                    <input id='username' name='username' type='username' className='form-control' placeholder={this.props.username} disabled/>
                                </div>
                            </div>
                            <div className='row'>
                                <label class="col-sm-4 col-form-label">Email</label>
                                <div class="form-group col-sm-8">
                                    <input id='email' name='email' type='email' className='form-control' onChange={e => this.onEmailChange(e.target.value)} placeholder="Email" value={this.state.email}/>
                                </div>
                            </div>
                            <div className='row'>
                                <label class="col-sm-4 col-form-label">Phone</label>
                                <div class="form-group col-sm-8">
                                    <input id='phone' name='phone' type='text' className='form-control' onChange={e => this.onPhoneChange(e.target.value)} placeholder="Phone Number" value={this.state.phone}/>
                                </div>
                            </div>
                            <div className='row'>
                                <label class="col-sm-4 col-form-label">Password</label>
                                <div class="form-group col-sm-8">
                                    <Button type='button' className="btn btn-secondary btn-block profile-btn" onClick={this.toggleChangePassword}>Change</Button>
                                </div>
                            </div>
                            <div className='col-12 no-padding'>
                                <Button onClick={this.updateProfile} type='button' className='btn btn-primary btn-block profile-save-btn'>Save Changes</Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default ProfileForm;