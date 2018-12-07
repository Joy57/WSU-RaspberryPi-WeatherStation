import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Cookies from 'js-cookie';
import _ from 'lodash';

class VerifyLoggedIn extends Component{
    constructor() {
        super();
        var verified = Cookies.get('loggedIn')
        if (_.isUndefined(verified)) verified = 'false';
        this.state = {
            verified: verified
        }
    }
    render(){
        if(this.state.verified === 'false') {
            return <Redirect to='/user/login'/>;
        }
        else {
            return true;
        }
    }
}

export default VerifyLoggedIn;