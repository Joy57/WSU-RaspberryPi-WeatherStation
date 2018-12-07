import React, { Component } from 'react';
import { Table, Alert, Button } from 'reactstrap';

class AdminPermission extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loading: true,
            regUsers: 0,
            permissions: this.props.permissions
        }
        this.updateUser = this.updateUser.bind(this);
        this.updateTable = this.updateTable.bind(this);
    };


    componentDidMount(){
        this.getUsers().then((users) => {
            this.setState({
                users: users,
                loading: false
            })
        });
    }

    getUsers = async () => {
        var users = [];
        var count = 0;
        const response = await fetch('api/user/allUsers', {method: 'get'});
        const body = await response.json();
        if (body.users.length > 0) users = body.users;
        if (response.status !== 200) throw Error(body.message);
        for(var i = 0; i < users.length; i++){
            if(users[i]["type"] === "User"){
                count++;
            }
        }
        await this.setState({ regUsers: count });
        return users;
    };


    updateTable = async() => {
         this.getUsers().then((users) => {
            this.setState({
                users: users,
                loading: false
            })
        });
    };

    // Update a single user with a permission type
    updateUser = async (user, type) => {
        await fetch ('/api/user/updatedPermissions', { method: 'put',
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
        await this.updateTable();
        return null;
    };

    renderButtons(user){
        if(this.state.permissions === "Admin"){
            return(
                <div className="col-12">
                    <Button color="primary" onClick={() => this.updateUser(user, "Admin")}>Promote</Button>
                </div>
            )
        }
        else{
            if(user["type"] === "Admin"){
                return(
                    <div className="row">
                        <div className="col-12">
                            <Button color="danger" onClick={() => this.updateUser(user, "User")}>Demote</Button>
                        </div>
                    </div>
                )
            }
            else{
                return(
                    <div className="row">
                        <div className="col-6">
                            <Button color="primary" onClick={() => this.updateUser(user, "Admin")}>Promote</Button>
                        </div>
                        <div className="col-6">
                            <Button color="danger" onClick={() => this.updateUser(user, "User")}>Demote</Button>
                        </div>
                    </div>
                )
            }

        }
    }


    render() {
        if (this.state.loading === false && this.state.permissions === "Admin" && this.state.regUsers === 0){
            return(
                <div>
                    <Alert className="no-users-alert" color="primary">
                        There are currently no users to promote.
                    </Alert>
                </div>
            )
        }
        else if (this.state.loading === false){
            return(
                <Table className="admin-table" bordered>
                    <thead>
                    <tr>
                        <th>Username</th>
                        <th>Permissions</th>
                        <th>Update</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.users.map((user) => {
                            if(this.state.permissions === "Admin" && this.state.regUsers > 0){
                                if(user["type"] === "User" ){
                                    return (
                                        <tr>
                                            <td className="permissions-table-username">
                                                { user["username"] }
                                            </td>
                                            <td className="permissions-table-type">
                                                { user["type"]}
                                            </td>
                                            <td className="permissions-table-buttons">
                                                {this.renderButtons(user)}
                                            </td>
                                        </tr>
                                    );
                                }
                            }
                            else{
                                if(user["type"] === "User" || user["type"] === "Admin"){
                                    return (
                                        <tr>
                                            <td className="permissions-table-username">
                                                { user["username"] }
                                            </td>
                                            <td className="permissions-table-type">
                                                { user["type"]}
                                            </td>
                                            <td className="permissions-table-buttons">
                                                {this.renderButtons(user)}
                                            </td>
                                        </tr>
                                    );
                                }
                            }
                            return null;
                        })
                    }
                    </tbody>
                </Table>
            );
        }
        else{
            return (
                <div>
                    <Alert className="no-users-alert" color="primary">
                        Loading user table.
                    </Alert>
                </div>
            );
        }
    }
}

export default AdminPermission;