import React, { Component } from 'react';
import '../../styles/admin.css';
import { Button, Card, CardText, Modal, ModalHeader, ModalBody, ModalFooter, FormFeedback, Input, FormGroup } from 'reactstrap';
import DatePicker  from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import _ from 'lodash';

class AdminStationCard extends Component {
    constructor(props){
        super(props);
        var expiration = "";
        
        if (props.station.expiration !== '' && !_.isNull(props.station.expiration)){
            expiration = moment(props.station.expiration).utc(props.station.expiration).local();
        }

        this.state = {
            modal: false,
            station: props.station,
            name: props.station.station_name,
            oldName: props.station.station_name,
            apikey: props.station.apikey,
            expiration: expiration,
            error: {
                nameInput: '',
                expirationInput: ''
            }
        }

        this.toggleEditStation = this.toggleEditStation.bind(this);
        this.onExpirationChange = this.onExpirationChange.bind(this);
    }

    // Toggle the station detail modal open/closed
    toggleEditStation(clicked){
        var name = this.state.name;
        name = (clicked === "cancel") ? this.props.station.station_name : name;
        
        if (this.state.error.nameInput !== "" || this.state.error.expirationInput !== ""){
            this.setState({
                modal: !this.state.modal,
                error: {
                    nameInput: '',
                    expirationInput: ''
                },
                name: name
            });
        }

        else{
            this.setState({
                modal: !this.state.modal,
                name: name
            });
        }
    }

    saveStation = async() => {
        var response = await fetch('/api/stations/' + this.state.apikey, 
            {method: 'put', 
             body: JSON.stringify({station_name: this.state.name, oldName: this.state.oldName, expiration:  moment.utc(this.state.expiration).format('YYYY-MM-DD HH:mm:ss')}),
             headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              }
        });
        var body = await response.json();
        if (!_.isUndefined(body.error)){
            this.setState({
                error:{
                    nameInput: body.error,
                    expirationInput: this.state.error.expirationInput
                } 
            })
        }

        else {
            this.setState({ 
                nameInput: '',
                expirationInput: this.state.error.expirationInput 
            })
            this.toggleEditStation("save");
        }
        return body;
    }

    // Render the station name input with or without errors
    renderNameInput(){
        if (this.state.error.nameInput.length > 0){
            return (
                <FormGroup>
                    <Input type="text" className="station_name is-invalid" name="station_name" id="station_name" placeholder="Name" onChange={e => this.onNameChange(e.target.value)} value={this.state.name}></Input>
                    <FormFeedback>{this.state.error.nameInput}</FormFeedback>
                </FormGroup>
            );
        }

        else
            return (
                <FormGroup>
                    <Input id='station_name' name='station_name' type='text' className='form-control' placeholder='Name' onChange={e => this.onNameChange(e.target.value)} value={this.state.name}/>
                </FormGroup>
            );
    }

    renderExpirationInput(){
        if (this.state.error.expirationInput.length > 0){
            return (
                <FormGroup>
                    <DatePicker
                        id='expiration' 
                        name='expiration'
                        dateFormat="YYYY-MM-DD HH:mm:ss"
                        className='form-control is-invalid'
                        placeholderText="Expiration"
                        selected={!_.isNull(this.state.expiration) ? this.state.expiration : null}
                        onChange={this.onExpirationChange}
                        showTimeSelect
                    />
                    <p className="form-text error-text">
                        {this.state.error.expirationInput}
                    </p>
                </FormGroup>
            );
        }

        else{
            return (
                <DatePicker
                    id='expiration' 
                    name='expiration'
                    dateFormat="YYYY-MM-DD HH:mm:ss"
                    className='form-control'
                    placeholderText="Expiration"
                    selected={this.state.expiration !== '' ? this.state.expiration : null}
                    onChange={this.onExpirationChange}
                    showTimeSelect/>
            );
        }
    }

    // Update the station name state on input change
    onNameChange(value){
        this.setState({
             name: value
        });
    }

    onExpirationChange(value){
        if (moment(value).isAfter(moment())){
            this.setState({ 
                expiration: value,
                error: {
                    nameInput: this.state.error.nameInput,
                    expirationInput: "",
                } 
            });
        }

        else if (_.isNull(value)){
            this.setState({ expiration: "" })
        }

        else{
            this.setState({
                error: {
                    nameInput: this.state.error.nameInput,
                    expirationInput: "Expiration date cannot be before now",
                } 
            });
        }
    }

    render() {
        return (
            <div className="col-12 admin-station-container">
                <Modal isOpen={this.state.modal} toggle={this.toggleEditStation}>
                    <ModalHeader toggle={() => this.toggleEditStation("cancel")}>Station Info</ModalHeader>
                    <ModalBody>
                        <div className='form-group'>
                            <label>Name:</label>
                            { this.renderNameInput() }
                        </div>
                        <div className='form-group'>
                            <label className="form-label">Expiration:</label>
                            { this.renderExpirationInput() }
                        </div>
                        <div className='form-group'>
                            <label>API Key:</label>
                            <input id='api_key' name='api_key' type='text' className='form-control' placeholder='' value={this.state.apikey} readOnly="readonly"/>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="col-12 no-padding">
                            <div className="delete-container left">
                                <Button color="danger" className="btn btn-warning" onClick={() => {this.props.deleteStation(this.state.apikey); this.toggleEditStation()}}>Delete</Button>
                            </div>
                            <div className="save-changes-container right">
                                <Button color="primary" className="primary-themed-btn" onClick={this.saveStation}>Save Changes</Button>
                                <Button color="secondary" className="cancel-btn" onClick={() => this.toggleEditStation("cancel")}>Cancel</Button>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

                <Card onClick={this.toggleEditStation} className="admin-station-card">
                    <div className="col-12">
                        <CardText>
                            <div className="row">
                                <div className="col-12 station-title">
                                    { this.state.name }
                                </div>
                            </div>
                        </CardText>
                    </div>
                </Card>
            </div>
        );
    }
}

export default AdminStationCard;
