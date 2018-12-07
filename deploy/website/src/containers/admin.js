import React, { Component } from 'react';
import VerifyLoggedIn from '../components/verifyLoggedIn.js';
import AdminStationList from '../components/admin/adminStationList.js';
import NewUserApproval from '../components/admin/newUserApproval.js';
import AdminPermission from '../components/admin/adminPermission.js';
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Alert } from 'reactstrap';
import classnames from 'classnames';
import '../styles/admin.css';


class Admin extends Component {
    constructor(props) {
        super(props);
        this.toggleTab = this.toggleTab.bind(this);
        this.state = {
            activeTab: '1',
            permissions: props.permissions
        };
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.permissions !== this.state.permissions){
            this.setState({
                permissions: nextProps.permissions
            })
        }
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        if (this.state.permissions === "Admin" || this.state.permissions === "Superuser") {
            return (
                <div className='adminPage'>
                    <VerifyLoggedIn/>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                            className={classnames({ active: this.state.activeTab === '1' })}
                            onClick={() => { this.toggleTab('1'); }}
                            >
                            Edit Stations
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                            className={classnames({ active: this.state.activeTab === '2' })}
                            onClick={() => { this.toggleTab('2'); }}
                            >
                            Pending Users
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                            className={classnames({ active: this.state.activeTab === '3' })}
                            onClick={() => { this.toggleTab('3'); }}
                            >
                            Edit Permissions
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <Row>
                                <Col sm="12">
                                    <AdminStationList></AdminStationList>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="2">
                            <Row>
                                <Col sm="12">
                                    <NewUserApproval></NewUserApproval>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="3">
                            <Row>
                                <Col sm="12">
                                    <AdminPermission
                                        permissions={this.state.permissions}
                                    />
                                </Col>
                            </Row>
                        </TabPane>
                    </TabContent>
                </div>
            );
        }

        else {
            return (
                <div className="container">
                    <VerifyLoggedIn/>
                    <Alert className="no-auth-alert" color="danger">
                        You are not authorized to view this.
                    </Alert>
                </div>
            );
        }
    }
}

export default Admin;