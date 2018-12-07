const knex = require('knex')(require('../knexfile'))
const nodemailer = require('nodemailer');
const Alerts = require('../models/Alerts');
const TriggeredAlerts = require('../models/TriggeredAlerts');
const moment = require('moment');
// const accountSid = process.env.TWILIO_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

sendAlerts = async () => {
    var triggered = []
    //gets all alerts and gets all weather data
    var alerts = await getAlerts();
    var weather = await getWeather();


    //removes extra rows added by 'between' keyword
    triggered = await handleBetween(alerts);

    //checks the weather data against the alert and returns an array of triggered alerts
    triggered = checkAlert(triggered, weather);
    
    //checks if the alert has been triggered within the threshold set by the user
    triggered = checkTime(triggered);

    //last_triggered value updated to current time on all triggered alerts
    triggered.map(triggered =>{
        Alerts.where({alert_id: triggered.alert_id}).save({
            last_triggered: moment.utc().format("YYYY-MM-DD HH:mm:ss")
        },{patch:true})
    })
    
    //inserts triggered alerts into the triggeredalerts table
    alertHistory(triggered);

    //sends either email or sms alerts depending on alert method
    triggered.map(triggered =>{
        if(triggered.method === 'email'){
            sendEmail(triggered)
        }
        else if(triggered.method === 'sms'){
            sendSMS(triggered)
        }
    })
}
//Sends the user an email for the triggered alert
//Email includes the alert that was triggered and
//the weather data at that station when it was triggered
sendEmail = async (triggered) =>{

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    if(triggered.secondValue){
        var mailOptions = {
            to: triggered.email,
            from: 'wstationtestdod@gmail.com',
            subject: 'Inclement weather alert!',
            text: 'You are receiving this message because the following alert was triggered:\n\n'+
            'The ' + triggered.type + ' is ' + triggered.keyword + ' ' + triggered.value + ' and ' + triggered.secondValue + ' at station: ' + triggered.station_name + '\n\n'+
            'The current weather at ' + triggered.station_name + ' is: \n\n'+
            'Temperature: ' + triggered.temperature + '\n' +
            'Pressure: ' + triggered.pressure + '\n' +
            'Humidity: ' + triggered.humidity + '\n'
            
        };
    }
    else{
        var mailOptions = {
            to: triggered.email,
            from: 'wstationtestdod@gmail.com',
            subject: 'Inclement weather alert!',
            text: 'You are receiving this message because the following alert was triggered:\n\n'+
            'The ' + triggered.type + ' is ' + triggered.keyword + ' ' + triggered.value + ' at station: ' + triggered.station_name + '\n\n'+
            'The current weather at ' + triggered.station_name + ' is: \n\n'+
            'Temperature: ' + triggered.temperature + '\n' +
            'Pressure: ' + triggered.pressure + '\n' +
            'Humidity: ' + triggered.humidity + '\n'
            
        };
    }
    transporter.sendMail(mailOptions,function(err){
        //Alert user email has been sent
        done(err, 'done');
    });
}
sendSMS = async (triggered) => {
    const client = await require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    var phone = '+1' + triggered.phone;

    client.messages.create({
        to: phone,
        from: '+13133670438',
        body: 'You are receiving this message because the following alert was triggered:\n\n'+
        'The ' + triggered.type + ' is ' + triggered.keyword + ' ' + triggered.value + ' at station: ' + triggered.station_name + '\n\n'+
        'The current weather at ' + triggered.station_name + ' is: \n\n'+
        'Temperature: ' + triggered.temperature + '\n' +
        'Pressure: ' + triggered.pressure + '\n' +
        'Humidity: ' + triggered.humidity + '\n'
    })
    .then(function(data) {
        console.log(data);
    })
    .catch(function(err){
        console.log(err);
    })
}

//Sets historic data for triggered alerts
//If the alert is a webpage alert then the read flag is set to false, otherwise it is null
alertHistory = async (triggered) => {
    var ids = [];
    var newTrig = [];

    triggered.map(alert =>{
        if(alert.method === 'webpage'){
            ids.push(alert.alert_id);

            new TriggeredAlerts({
                read: false,
                temperature: alert.temperature,
                pressure: alert.pressure,
                humidity: alert.humidity,
                alert_id: alert.alert_id,
                cleared: false,
                created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss")
            }).save()
        }
        else{
            newTrig.push(alert);
        }
    })
    newTrig.map(alert =>{
        if(!ids.includes(alert.alert_id)){
            ids.push(alert.alert_id);

            new TriggeredAlerts({
                read: null,
                temperature: alert.temperature,
                pressure: alert.pressure,
                humidity: alert.humidity,
                alert_id: alert.alert_id,
                created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss")
            }).save()
        }
    })
}
//Checks alert to see if it has been triggered
//Weather data for the alert is then stored in the dictionary
function checkAlert(triggered, weather){
    var newTrig = []
    triggered.map((triggered, index) =>{
        weather.map(weather => {
            if(triggered.keyword === 'above'){
                if((weather[triggered.type] > triggered.value) && (weather.station_name === triggered.station_name)){
                    triggered.temperature = weather.temperature;
                    triggered.pressure = weather.pressure;
                    triggered.humidity = weather.humidity
                    newTrig.push(triggered);
                }
            }
            else if((triggered.keyword === 'between') && (weather.station_name === triggered.station_name)){
                if((weather[triggered.type] > triggered.value) && (weather[triggered.type] < triggered.secondValue) && (weather.station_name === triggered.station_name)){
                    triggered.temperature = weather.temperature;
                    triggered.pressure = weather.pressure;
                    triggered.humidity = weather.humidity
                    newTrig.push(triggered);
                }
            }
            else if((triggered.keyword === 'below')  && (weather.station_name === triggered.station_name)){
                if(weather[triggered.type] < triggered.value){
                    triggered.temperature = weather.temperature;
                    triggered.pressure = weather.pressure;
                    triggered.humidity = weather.humidity
                    newTrig.push(triggered);
                }
            }
        })
    })
    return newTrig;
}
//checks threshold value set by user and if that threshold has not been exceeded then the alert is not sent
function checkTime(triggered){
    newTrig = [];
    triggered.map(triggered =>{
        if(triggered.threshold === '1 hour'){
            if((1000 * 60 * 60) < (moment.utc() - triggered.last_triggered)){
                newTrig.push(triggered);
            }
        }
        else if(triggered.threshold === '12 hours'){
            if((1000 * 60 * 60 * 12) < (moment.utc() - triggered.last_triggered)){
                newTrig.push(triggered);
            }
        }
        else if(triggered.threshold === '24 hours'){
            if((1000 * 60 * 60 * 24) < (moment.utc() - triggered.last_triggered)){
                newTrig.push(triggered);
            }
        }
    })

    return newTrig;
}

//extra row is removed from between alerts and the greater value is added to the first row as 'secondValue'
function handleBetween(alerts){
    var triggered = []
    var id = null;
    var method = null;

    alerts.map(map =>{
        if(map.keyword === 'between'){
            id = map.alert_id;
            method = map.method;
            alerts.map(map2 =>{
                if((map2.alert_id === id) && (map2.method === method) && (map2.value > map.value)){
                    map.secondValue = map2.value;
                    triggered.push(map);
                }
            })
        }
        else{
            triggered.push(map)
        }
    })
    return triggered;
}
//gets all alerts from the database
getAlerts = async () =>{
    //Gets all alerts currently in database and the user's email address/phone
    var alerts = await knex('alerts')
    .select('alerts.alert_id', 'stations.station_name', 'alerts.type', 'alerts.keyword' ,'alerts.threshold' , 'alerts.last_triggered', 'alertvalues.value', 
    'alertmethods.method', 'alerts.username', 'users.email', 'users.phone')
    .leftJoin('alertvalues', 'alerts.alert_id', '=', 'alertvalues.alert_id')
    .leftJoin('alertmethods', 'alerts.alert_id', '=', 'alertmethods.alert_id')
    .leftJoin('users', 'alerts.username', '=', 'users.username')
    .leftJoin('stations', 'stations.apikey', '=','alerts.apikey')

    .where('alerts.deleted', '=', false)
    return alerts;
}
getWeather = async () => {
    //gets the most recent weather data from each station
    var weather = await knex('latestweather')
    .join('sensor_type', 'latestweather.weather_id', 'sensor_type.weather_id')
    .join('stations', 'latestweather.apikey', 'stations.apikey')
    .select('sensor_type.*', 'stations.station_name', 'stations.last_connected', 'stations.connected')
    .where('stations.connected', '=', true)
    return weather;
}

module.exports =  {
    sendAlerts
}