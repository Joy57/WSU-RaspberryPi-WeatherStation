import React, { Component } from 'react';
import '../../styles/alerts.css';
import {Button, Card, CardText, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
const moment = require('moment');

class HistoricAlertCard extends Component {
    constructor(props){
        super(props);
        this.state={
            station: this.props.alert.station_name,
            type: this.props.alert.type,
            keyword: this.props.alert.keyword,
            temperature: this.props.alert.temperature,
            pressure: this.props.alert.pressure,
            humidity: this.props.alert.humidity,
            cpu_usage: this.props.alert.cpu_usage,
            ram_usage: this.props.alert.ram_usage,
            value: this.props.alert.value,
            secondValue: this.props.alert.secondValue,
            time: this.props.alert.created_at,
            modal: false
        };
        this.toggle = this.toggle.bind(this);
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.alert.station_name !== this.state.station_name){
            this.setState({
                station: nextProps.alert.station_name
            })
        }
        if(nextProps.alert.keyword !== this.state.keyword){
            this.setState({
                keyword: nextProps.alert.keyword
            })
        }
        if(nextProps.alert.type !== this.state.datatype){
            this.setState({
                type: nextProps.alert.type
            })
        }
        if(nextProps.alert.value !== this.state.value){
            this.setState({
                value: nextProps.alert.value
            })
        }
        if(nextProps.alert.secondValue !== this.state.secondValue){
            this.setState({
                secondValue: nextProps.alert.secondValue
            })
        }
        if(nextProps.alert.created_at !== this.state.time){
            this.setState({
                time: nextProps.alert.created_at
            })
        }
    }
    toggle(){
        this.setState({
            modal: !this.state.modal
        })
    }
    getParams(){
        if(this.state.keyword === 'between'){
            return(
                <div> {this.state.station}'s {this.state.type} is {this.state.keyword} {this.state.value} and {this.state.secondValue} </div>
            )
        }
        else{
            return(
                <div> {this.state.station}'s {this.state.type} is {this.state.keyword} {this.state.value} </div>

            )
        }
    }
    render(){
        return(
            <div className='container'>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>{this.getParams()}</ModalHeader>
                    <ModalBody>
                        <p>{this.state.station} at: {moment(this.state.time).utc(this.state.time).local().format("YYYY-MM-DD HH:mm:ss")}</p>
                        <p>Temperature: {this.state.temperature} &deg;F</p>
                        <p>Pressure: {this.state.pressure} hPa</p>
                        <p>Humidity: {this.state.humidity}%</p>
                        <p>CPU Usage: {this.state.cpu_usage}%</p>
                        <p>RAM Usage: {this.state.ram_usage}%</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button type='button' color='secondary' onClick={this.toggle}>Close</Button>
                    </ModalFooter>
                </Modal>
                <Card onClick={this.toggle} className='alertCard'>
                    <CardText className='cardText'>
                        {this.getParams()}
                        <div className="row">
                            <div className="col-12">
                                <span className="alert-triggered-at">{moment(this.state.time).utc(this.state.time).local().format("YYYY-MM-DD HH:mm:ss")}</span>
                            </div>
                        </div>
                    </CardText>
                </Card>
            </div>
        )
    }
}
export default HistoricAlertCard;