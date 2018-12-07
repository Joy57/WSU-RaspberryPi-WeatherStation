const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const Alerts = require('../models/Alerts');
const AlertValues = require('../models/AlertValues');
const AlertMethods = require('../models/AlertMethods');
const TriggeredAlerts = require('../models/TriggeredAlerts');
const Station = require('../models/Station');
const knex = require('knex')(require('../knexfile'));
const moment = require('moment');

//post request that creates a new alert for the user
router.post('/create', async function(req, res){

    var station = req.body.station;
    var datatype = req.body.datatype;
    var keyword = req.body.keyword;
    var value = req.body.value;
    var secondValue = req.body.secondValue;
    var email = req.body.email;
    var sms = req.body.sms;
    var webpage = req.body.webpage;
    var threshold = req.body.threshold;

    //gets apikey of station selected by user
    var apikey = await Station.where({station_name: station}).fetch();

    var error = await alertValidation(value, secondValue, keyword, datatype, email, sms, webpage);
    if(error){
        return res.status(200).json({error: error.error})
    }

    var duration = moment.duration({'days' : 1});
    var newAlert = await new Alerts({
        apikey: apikey.attributes.apikey,
        type: datatype,
        keyword: keyword,
        threshold: threshold,
        username: req.session.username,
        deleted: false,
        last_triggered: moment.utc().subtract(duration).format("YYYY-MM-DD HH:mm:ss")
    }).save();

    if(email){
        await new AlertMethods({
            method: 'email',
            alert_id: newAlert.attributes.id
        }).save();
    }
    if(sms){
        await new AlertMethods({
            method: 'sms',
            alert_id: newAlert.attributes.id
        }).save();
    }
    if(webpage){
        await new AlertMethods({
            method: 'webpage',
            alert_id: newAlert.attributes.id
        }).save();
    }
    if(value){
        await new AlertValues({
            value: value,
            alert_id: newAlert.attributes.id
        }).save();
    }
    if(secondValue){
        await new AlertValues({
            value: secondValue,
            alert_id: newAlert.attributes.id
        }).save();
    }


    //success
    return res.status(200).json({})
})

//Gets any webpage alerts for user that hasnt been dismissed
router.post('/webpage/', async function(req, res){
    var alerts = []

    if(req.session.username){    
        alerts = await knex('triggeredalerts')
        .select('triggeredalerts.triggered_id', 'alertvalues.value', 'alerts.alert_id', 'stations.station_name', 'alerts.type','alerts.keyword', 'triggeredalerts.read', 'triggeredalerts.temperature', 'triggeredalerts.humidity', 'triggeredalerts.pressure', 'triggeredalerts.cpu_usage', 'triggeredalerts.ram_usage', 'triggeredalerts.created_at')
        .leftJoin('alerts', 'triggeredalerts.alert_id', '=', 'alerts.alert_id')
        .leftJoin('alertvalues', 'alerts.alert_id', '=', 'alertvalues.alert_id')
        .leftJoin('stations', 'stations.apikey', '=','alerts.apikey')
        .where('alerts.username', '=', req.session.username)
        .where('triggeredalerts.cleared', '=', false)
        .orderBy('triggeredalerts.triggered_id', 'asc')

        alerts = await parseBetween(alerts);

    }
    return res.status(200).json({alerts});
})

//Sets all webpage alerts to read for the user
router.put('/read/', async function(req, res){
    var response = await knex('triggeredalerts')
    .update('triggeredalerts.read', true)
    .leftJoin('alerts', 'triggeredalerts.alert_id','=','alerts.alert_id')
    .where('triggeredalerts.read','=', false)
    .where('alerts.username','=', req.session.username)
    .where('triggeredalerts.cleared', '=', false)

    return res.status(200).json({succcess: 'success'});
})

//Sets webpage alerts to cleared when user dismisses alerts
router.put('/webpage/', async function(req, res){
    var alerts = await knex('triggeredalerts')
    .update('triggeredalerts.cleared', true)
    .leftJoin('alerts', 'triggeredalerts.alert_id','=','alerts.alert_id')
    .where('alerts.username', '=', req.session.username)
    .where('triggeredalerts.cleared', '=', false);

    return res.status(200).json({success: 'success'});
})

//Gets all alerts for user, all stations in database, and the entire alert history for the user
router.post('/', async function(req, res){
    //selects all alerts for user, joins alerts and alertvalues based on alert_id
    var alerts = await knex('alerts')
    .select('alerts.alert_id', 'stations.station_name', 'alerts.type', 'alerts.keyword', 'alerts.last_triggered', 'alerts.threshold', 'alertvalues.value')
    .leftJoin('stations', 'stations.apikey', '=','alerts.apikey')
    .leftJoin('alertvalues', 'alerts.alert_id', '=', 'alertvalues.alert_id')
    .where('alerts.username', '=', req.session.username)
    .where('alerts.deleted','=', false)

    var methods = await knex('alertmethods')
    .select('method', 'alert_id')

    var stations = await knex('stations')
    .select('station_name')

    var historicAlerts = await knex('triggeredalerts')
    .distinct('triggeredalerts.created_at', 'stations.station_name', 'alerts.alert_id', 'alerts.type', 'alerts.keyword', 'triggeredalerts.pressure', 'triggeredalerts.temperature', 'triggeredalerts.humidity', 'triggeredalerts.cpu_usage')
    .select('triggeredalerts.triggered_id', 'alertvalues.value')
    .leftJoin('alerts', 'triggeredalerts.alert_id', '=', 'alerts.alert_id')
    .leftJoin('alertvalues', 'alerts.alert_id', '=', 'alertvalues.alert_id')
    .leftJoin('stations', 'stations.apikey', '=','alerts.apikey')
    .where('alerts.username', '=', req.session.username)
    .orderBy('triggeredalerts.triggered_id')

    alerts = await parseBetween(alerts);
    alerts = await parseMethods(alerts, methods);
    historicAlerts = await parseBetween(historicAlerts);
    
    return res.status(200).json({alerts, stations, historicAlerts});
})


//post used to update an alert based on the :id passed by the frontend
router.post('/:id', async function(req,res){

    //values passed by frontend
    var station = req.body.station;
    var datatype = req.body.datatype;
    var keyword = req.body.keyword;
    var value = req.body.value;
    var secondValue = req.body.secondValue;
    var email = req.body.email;
    var sms = req.body.sms;
    var webpage = req.body.webpage;
    var threshold = req.body.threshold;

    var apikey = await Station.where({station_name: station}).fetch();

    var error = await alertValidation(value, secondValue, keyword, datatype, email, sms, webpage);
    if(error){
        return res.status(200).json({error: error.error})
    }

    await Alerts.where({alert_id: req.params.id}).save({
        apikey: apikey.attributes.apikey,
        type: datatype,
        threshold: threshold,
        keyword: keyword
    },{patch:true})
    
    //deletes old values associated with that alert
    await AlertValues.where({alert_id: req.params.id}).destroy();
    await AlertMethods.where({alert_id: req.params.id}).destroy();

    //stores new values, associates to alert by foreign key
    await new AlertValues({
        value: value,
        alert_id: req.params.id
    }).save();

    if(email){
        await new AlertMethods({
            method: 'email',
            alert_id: req.params.id
        }).save();
    }
    if(sms){
        await new AlertMethods({
            method: 'sms',
            alert_id: req.params.id
        }).save();
    }
    if(webpage){
        await new AlertMethods({
            method: 'webpage',
            alert_id: req.params.id
        }).save();
    }
    if(secondValue){
        await new AlertValues({
            value: secondValue,
            alert_id: req.params.id
        }).save();
    }
    return res.status(200).json({})
})
//soft deletes an alert once the user has deleted
router.put('/:id', async function(req, res){

    var response = await knex('alerts')
    .update('alerts.deleted', true)
    .where('alerts.alert_id', '=', req.params.id)
    return res.status(200).json({success: 'success'});
})

//Removes extra row generated by 'between' alerts and stores second value into dictionary under 'secondValue'
parseBetween = async(alerts) => {
    var newAlerts = [];
    var currentID = null;
    var grabbedValue= null;

    alerts.map(alerts =>{
        if(alerts.keyword === 'between'){
            var id = getID(alerts)
            if(currentID !== id){
                grabbedValue = alerts.value;
                currentID = id;
            }
            else{
                if(grabbedValue > alerts.value){
                    alerts.secondValue = grabbedValue;
                }
                else{
                    alerts.secondValue = alerts.value;
                    alerts.value = grabbedValue;
                }
                newAlerts.push(alerts);
            }
        }
        else{
            newAlerts.push(alerts);
        }
    })
    return newAlerts;
};
//returns id of alert depending on which tabel it came from
function getID(alert){
    if(alert.triggered_id){
        return alert.triggered_id
    }
    else{
        return alert.alert_id
    }
}
//sets flags for alert based on which alert methods it has
parseMethods = async(alerts, methods) => {
    var newAlerts = [];
    
    alerts.map(alerts => {
        methods.map(methods =>{
            if((methods.method === 'email') && (methods.alert_id === alerts.alert_id) ){
                alerts.email = true;
            }
            else if((methods.method === 'sms') && (methods.alert_id === alerts.alert_id)){
                alerts.sms = true;
            }
            else if((methods.method === 'webpage') && (methods.alert_id === alerts.alert_id)){
                alerts.webpage = true;
            }
        })
        newAlerts.push(alerts);
    })

    return newAlerts;
}
alertValidation = async(value, secondValue, keyword, datatype, email, sms, webpage) => {
    if(!value){
        return {error: 'Enter a value'};
    }
    //checks that at least one method is selected
    if(!(email || sms || webpage)){
        return {error: 'Select an alert method'};
    }
    //prevents user from submitting blank value
    if(keyword === 'between' && !secondValue){
        return {error: 'Enter a second value'};
    }
    //prevents second value from being greater than first value
    if((secondValue) && (value > secondValue)){
        return {error: 'Values are in wrong order'};
    }

    //checks value for non-digits
    if(value){
        var valueReg = value.toString().replace('-','').match(/\D/g);
    }
    //checks secondValue for non-digits
    if(secondValue){
        var secondValueReg = secondValue.toString().replace('-','').match(/\D/g);
    }    
    if(valueReg){
        return {error: 'Invalid value'};
    }
    if(secondValueReg){
        return {error: 'Invalid second value'};
    }

    var err = outOfRange(value, datatype);
    if(err){
        return {error: err.error}
    }
    if(secondValue){
        var err = outOfRange(secondValue, datatype);
        if(err){
            return {error: err.error}
        }
    }

    return null;
}
function outOfRange(value, datatype){
    //ensures humidity value isnt negative
    if((datatype === 'humidity') && (value < 0)){
        return {error: 'Value outside acceptable range'};
    }
    //ensures temperature value doesnt go below -100
    if((datatype === 'temperature') && (value < -100)){
        return {error: 'Value outside acceptable range'};
    }
    //ensures humidity doesnt go above 100
    if((datatype === 'humidity') && (value > 100)){
        return {error: 'Value outside acceptable range'}
    }
    //ensures temperature doesnt go above 999
    if((datatype === 'temperature') && (value > 999)){
        return {error: 'Value outside acceptable range'};
    }
    //ensures pressure doesnt go above 9999
    if((datatype === 'pressure') && (value < 0 || value > 9999)){
        return {error: 'Value outside acceptable range'};
    }
    //ensures pressure doesnt go above 9999
    if((datatype === 'cpu_usage') && (value < 0 || value > 101)){
        return {error: 'Value outside acceptable range'};
    }
    //ensures pressure doesnt go above 9999
    if((datatype === 'ram_usage') && (value < 0 || value > 8001)){
        return {error: 'Value outside acceptable range'};
    }
    //ensures pressure doesnt go above 9999
    if((datatype === 'battery') && (value < 0 || value > 101)){
        return {error: 'Value outside acceptable range'};
    }
    return null;
}
module.exports = router;