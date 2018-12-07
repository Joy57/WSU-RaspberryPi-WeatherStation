import React, { Component } from 'react';
import { Table, Alert, Button } from 'reactstrap';

class NewUserApproval extends Component {
    constructor() {
        super();
        this.state = {
            pendingUsers: [],
            loading: true
        }
        this.updateUser = this.updateUser.bind(this);
    };

    // Set the pendingUsers array in the state
    componentDidMount(){
        this.getPendingUsers().then((pendingUsers) => {
            this.setState({ 
                pendingUsers: pendingUsers, 
                loading: false 
            })
        });
    }

    // Get all pending users
    getPendingUsers = async () => {
        var pendingUsers = [];
        const response = await fetch('api/user/pendingUsers', {method: 'get'});
        const body = await response.json();
        if (body.pendingUsers.length > 0) pendingUsers = body.pendingUsers;
        if (response.status !== 200) throw Error(body.message);
        return pendingUsers;
    };

    // Update the list of pending users
    updateTable(){
        this.getPendingUsers().then((pendingUsers) => {
            this.setState({ 
                pendingUsers: pendingUsers, 
                loading: false 
            })
        });
    };

    // Update a single user with a permission type
    updateUser = async (user, type) => {
        await this.setState({ loading: true });
        await fetch ('/api/user/permissions', { method: 'put', 
            body: JSON.stringify({
                username: user["username"], 
                permissions: type
            }),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials:'include'}
        );
        this.updateTable();
    }

    // Render an empty table alert
    renderAlert(){
        if (this.state.pendingUsers.length === 0){
            return (
                <tr>
                    <td colSpan="2">
                        <Alert className="no-users-alert-td" color="primary">
                            There are no pending users to display.
                        </Alert>
                    </td>
                </tr>
            );
        }
    }

    render() {
        if (this.state.loading === true){
            return (
                <div>
                    <Alert className="no-users-alert" color="primary">
                        There are no pending users to display.
                    </Alert>
                </div>
            );
        } else{
            return(
                <Table className="admin-table" bordered>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.pendingUsers.map((user) => {
                                return (
                                    <tr>
                                        <td className="admin-table-username">
                                            { user["username"] }
                                        </td>
                                        <td className="admin-table-buttons">
                                            <div className="row">                                          
                                                <div className="col-6">
                                                    <Button color="primary" onClick={() => this.updateUser(user, "User")}>Approve</Button>
                                                </div>
                                                <div className="col-6">
                                                    <Button color="danger" onClick={() => this.updateUser(user, "Denied")}>Deny</Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                        { this.renderAlert() }
                    </tbody>
                </Table>
            );
        }
    }
}

export default NewUserApproval;