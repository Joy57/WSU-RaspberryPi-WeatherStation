import React, { Component } from 'react';
import '../styles/navbar.css';
import logo from '../images/space-satellite-dish-512x512.png';
import Cookies from 'js-cookie';
import { Link, Redirect} from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, Modal, ModalBody, ModalFooter, ModalHeader, Form, Button, Alert } from 'reactstrap';
var moment = require('moment');

class Navigation extends Component {
    constructor(props) {
        super(props);
        this.toggleAlert = this.toggleAlert.bind(this);
        this.dismissAlerts = this.dismissAlerts.bind(this);
        this.toggleAlertModal = this.toggleAlertModal.bind(this);
        this.renderAlerts = this.renderAlerts.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this.state = {
            dropdownOpen: false,
            alertDropDown: false,
            redirect: false,
            alerts: [],
            modal: false,
            temperature: null,
            pressure: null,
            humidity: null,
            cpu_usage: null,
            ram_usage: null,
            time: null,
            station_name: null,
            keyword: null,
            type: null,
            value: null,
            secondValue: null,
            unread: false,
            navShown: false,
            permissions: this.props.permissions
        }
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.toggleNav = this.toggleNav.bind(this);
    }
    
    componentWillReceiveProps(nextProps){
        if(nextProps.permissions !== this.state.permissions){
            this.setState({
                permissions: nextProps.permissions
            })
        }
    }

    //fetch all alerts when navbar mounts
    componentDidMount = async () => {
        this.props.getUser();
        await this.getTriggeredAlerts();
        this.interval = setInterval(this.getTriggeredAlerts, 5000);
    }

    //clear interval when navbar unmounts
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getTriggeredAlerts = async () => {
        var alerts = [];
        //fetch call to gather any triggered webpage alerts for user
        
        var response = await fetch('/api/alerts/webpage/' ,
            {   method: 'post', 
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }
        )
        var body = await response.json();
        alerts = body.alerts;

        //check for unread alerts here
        var unread = false;
        await alerts.map(alerts => {
            if (alerts.read === 0) {
                unread = true;
            }
            return null;
        })

        this.setState({alerts: alerts, unread: unread});
    }

    toggleDropdown() {
        this.setState({
            dropdown: !this.state.dropdown
        })
    }

    toggleNav() {
        this.setState({
            navShown: !this.state.navShown
        })
    }

    toggleAlert = async () => {
        //fetch call to set alerts to read for user
        fetch('/api/alerts/read', {method: 'put', credentials: 'include'})

        this.setState({
            unread: false,
            alertDropDown: !this.state.alertDropDown
        })
    }

    //when user clicks on alert from dropdown, modal will toggle and values will be set for that specific alert
    toggleAlertModal(station_name, type, keyword, value, secondValue, temperature, pressure, humidity, cpu_usage, ram_usage, time) {
        this.setState({
            station_name: station_name,
            type: type,
            keyword: keyword,
            value: value,
            secondValue: secondValue,
            temperature: temperature,
            pressure: pressure,
            humidity: humidity,
            cpu_usage: cpu_usage,
            ram_usage: ram_usage,
            time: time,
            modal: !this.state.modal
        })
    }

    closeModal() {
        this.setState({
            modal: false
        })
    }

    renderAdmin() {
        if (this.state.permissions === "Admin" || this.state.permissions === "Superuser") {
            return( 
                <DropdownItem tag='a'>
                    <Link to={'/admin'} className='nav-link nav-link-dark'>admin</Link>
                </DropdownItem>
            );
        }
        else {
            return null;
        }
     }

    logout = async() => {
        await Cookies.set('loggedIn', false);

        var response = await fetch('/api/user/logout', {method: 'post', credentials: 'include'})
        var body = await response.json();
        this.setState({
            redirect: true
        })
        return body;
    }

    //changes the bell icon depending on if there are unread alerts or not
    renderBell(){
        if(this.state.unread){
            var count = 0;
            this.state.alerts.map(alert =>{
                if(!alert.read){
                    count++;
                }
                return null;
            })
            return(
                <div className="bell">
                    <span className="fa-stack">
                        <i className="fa fa-bell fa-stack-1x" aria-hidden="true"></i>
                        <strong class="fa-stack-1x unread-text">{count}</strong>
                        <i class="fa fa-square fa-stack-1x unread" aria-hidden="true"></i>
                    </span>
                </div>
            );
        }
        else{
            return(
                <div className="bell">
                    <span className="fa-stack">
                        <i className="fa fa-bell fa-stack-1x" aria-hidden="true"></i>
                        <strong class="fa-stack-1x unread-text hidden">{count}</strong>
                        <i class="fa fa-square fa-stack-1x unread hidden" aria-hidden="true"></i>
                    </span>
                </div>
            );
        }
    }

    //renders the header of the alert modal based on what alert the user is looking at
    renderHeader() {
        if (this.state.secondValue) {
            return (<ModalHeader
                toggle={this.toggleAlertModal}> {this.state.station_name}'s {this.state.type} is {this.state.keyword} {this.state.value} and {this.state.secondValue} </ModalHeader>)
        }
        else {
            return (<ModalHeader
                toggle={this.toggleAlertModal}> {this.state.station_name}'s {this.state.type} is {this.state.keyword} {this.state.value} </ModalHeader>)
        }
    }

    //renders the alert cards in the drop down for the user
    renderAlerts(){
        var webpageAlertCards = [];
        this.state.alerts.map((alerts, index) =>{
            var className = "";
            (!alerts.read) ? className = "alert-notification-card-unread" : className = "alert-notification-card";
            if(alerts.keyword === 'between'){
                webpageAlertCards.unshift(
                    <Card key={index} onClick={() => this.toggleAlertModal(alerts.station_name, alerts.type, alerts.keyword, alerts.value, alerts.secondValue, alerts.temperature, alerts.pressure, alerts.humidity, alerts.created_at)} className={className}> 
                        <div className="alert-text">
                            {alerts.station_name}'s {alerts.type} is {alerts.keyword} {alerts.value} and {alerts.secondValue}
                        </div>
                        <div className="alert-triggered-at">
                            { moment(alerts.created_at).utc(alerts.created_at).local().format("YYYY-MM-DD HH:mm:ss") }
                        </div>
                    </Card>
                );
            
            }
            else{
                webpageAlertCards.unshift(
                    <Card key={index} onClick={() => this.toggleAlertModal(alerts.station_name, alerts.type, alerts.keyword, alerts.value, null, alerts.temperature, alerts.pressure, alerts.humidity, alerts.created_at)} className={className}>
                        <div className="alert-text">
                            {alerts.station_name}'s {alerts.type} is {alerts.keyword}&nbsp;{alerts.value}
                        </div>
                        <div className="alert-triggered-at">
                            { moment(alerts.created_at).utc(alerts.created_at).local().format("YYYY-MM-DD HH:mm:ss") }
                        </div>
                    </Card>
                );
            }
            return null;
        })
        //shows message if there are no alerts
        if(webpageAlertCards.length === 0){
            return(<Alert color="primary">You have no alerts</Alert>)
        } else{
            webpageAlertCards.unshift(
                <DropdownItem key="dismiss-key" className="btn btn-sm dismiss-all" onClick={this.dismissAlerts}> Dismiss all alerts </DropdownItem>
            );
            return webpageAlertCards;
        }
    }

    //deletes alerts from database and update page
    dismissAlerts(){
        fetch('/api/alerts/webpage', {method: 'put', credentials: 'include'})

        this.getTriggeredAlerts();
    }

    render() {
        if(this.state.redirect) {
            return <Redirect to='/user/login'/>;
        }
        else{
            return (
                <div>
                    <Navbar className="react-nav" color="faded" fixed="top" light expand="md">
                        <NavbarBrand href="/">
                            <Link to={'/'} className='nav-link'><img src={logo} width="30" height="30" alt=""></img></Link>
                        </NavbarBrand>
                        <NavbarToggler className="navbar-toggler-container ml-auto" onClick={this.toggleNav} />
                        <Collapse isOpen={this.state.navShown} navbar>
                            <Nav>
                                <div className="col-md-2.5 col-xs-12 hidden-sm-up">
                                    <NavItem>
                                        <Link to={'/'} className='nav-link'>stations</Link>
                                    </NavItem>
                                </div>
                                <div className="col-md-2.5 col-xs-12 hidden-sm-up">
                                    <NavItem>
                                        <Link to={'/map'} className='nav-link'>map</Link>
                                    </NavItem>
                                </div>
                                <div className="col-md-2.5 col-xs-12 hidden-sm-up">
                                    <NavItem tag='a'>
                                        <Link to={'/alerts'} className='nav-link'>alerts</Link>
                                    </NavItem>
                                </div>
                                <div className="col-md-2.5 col-xs-12 hidden-sm-up">
                                    <NavItem>
                                        <Link to={'/historical'} className='nav-link'>historical</Link>
                                    </NavItem>
                                </div>
                                <div className="col-md-2.5 col-xs-12 hidden-sm-up">
                                    <NavItem>
                                        <Link to={'/health'} className='nav-link'>health</Link>
                                    </NavItem>
                                </div>
                                
                            </Nav>
                            <Nav className="ml-auto right-side-nav" navbar>
                                <div className="col-md-4 col-xs-12 hidden-sm-up">
                                    <Dropdown isOpen={this.state.alertDropDown} className="alerts-dropdown" toggle={this.toggleAlert} nav inNavbar>
                                        <DropdownToggle nav>
                                            {this.renderBell()}
                                        </DropdownToggle>
                                        <DropdownMenu className="alerts-menu" right>
                                            <div className="col-12">
                                                {this.renderAlerts()}
                                            </div>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                                <div className="col-md-4 col-xs-12 hidden-sm-up">
                                    <Dropdown isOpen={this.state.dropdown} className="username-dropdown" toggle={this.toggleDropdown} nav inNavbar>
                                        <DropdownToggle nav caret>
                                            {this.props.username}
                                        </DropdownToggle>
                                        <DropdownMenu className="user-menu" right>
                                            <DropdownItem tag='a'>
                                                <Link to={'/profile'} className='nav-link nav-link-dark'>profile</Link>
                                            </DropdownItem>
                                            { this.renderAdmin() }
                                            <DropdownItem tag='a'>
                                                <a onClick={this.logout} className='nav-link nav-link-dark'>logout</a>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </Nav>
                            <Modal isOpen={this.state.modal} toggle={this.toggleAlertModal}>
                                {this.renderHeader()}
                                <Form id='AlertForm'>
                                    <ModalBody>
                                        <p>{this.state.station_name} at: {moment(this.state.time).utc(this.state.time).local().format("YYYY-MM-DD HH:mm:ss")}</p>
                                        <p>Temperature: {this.state.temperature} &deg;F</p>
                                        <p>Pressure: {this.state.pressure} hPa</p>
                                        Humidity: {this.state.humidity}%
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button type='button' color="secondary" onClick={this.closeModal}>Close</Button>
                                    </ModalFooter>
                                </Form>
                            </Modal>
                        </Collapse>
                    </Navbar>
                    <footer id="footer-id" className="footer">
                        <a href="https://goodstuffnononsense.com/hand-drawn-icons/space-icons/" rel="noopener noreferrer" target="_blank">Satellite Icon</a> By <a href="https://goodstuffnononsense.com/about/" rel="noopener noreferrer" target="_blank">Agata</a> / <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="_blank">CC BY</a>
                    </footer>
                </div>
            );
        }
  }
}

export default Navigation;