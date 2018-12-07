const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const Weather = require('../models/Weather');
const LatestWeather = require('../models/LatestWeather');
const Station = require('../models/Station');
const knex = require('knex')(require('../knexfile'));
const openweather = require('../services/openWeatherMap');
const _ = require('lodash');
var moment = require('moment');

// Adds weather data to the db via post request
// This is probably super slow but it makes it more efficient for the user on the stations page for now
router.post('/', async function (req, res) {
    var station = await knex('stations').select().where('apikey', req.body.apikey);
    if (station.length > 0){
    // if (_.isNull(station[0].expiration) ||  moment(station[0].expiration).utc(station[0].expiration).isAfter(req.body.created_at)){
        var latestWeather = await openweather.getLatestOpenWeatherData(req.body.apikey);

        // Get Open Weather Maps data every minute or if the latest weather does not have any owm data
        if ((req.body.data_index % 12 == 0 || req.body.data_index == 0) ||
        (_.isUndefined(latestWeather.visibility) || _.isNull(latestWeather.visibility))){
            var openWeatherData = await openweather.getOpenWeatherData(req.body.latitude, req.body.longitude);
        } else{
            var openWeatherData = latestWeather;
        }

        var result = await new Weather({
            apikey: req.body.apikey,
            created_at: req.body.created_at,
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            pressure: req.body.pressure,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            cpu_usage: req.body.cpu_usage,
            ram_usage: req.body.ram_usage,
            battery: req.body.battery,
            //
            visibility: openWeatherData["visibility"],
            wind_speed: openWeatherData['wind_speed'],
            wind_direction: openWeatherData['wind_direction']
        }).save()

        // Store our resulting row in latest weather so we can quickly get the latest weather
        // for our main page
        if (result.id){
            var latest = await LatestWeather.where('apikey', req.body.apikey).fetch();
            if (latest){
                var result = await LatestWeather.where('apikey', req.body.apikey).save({
                    weather_id: result.id,
                    apikey: req.body.apikey,
                }, {patch:true});
            }

            else{
                var result = await new LatestWeather({
                    weather_id: result.id,
                    apikey: req.body.apikey,
                }).save()
            }
        }

        // Update our connected status if it is 0 / off
        if (station[0].connected === 0){
            await Station.where('apikey', req.body.apikey).save({
                connected: 1,
                last_connected: moment().utc().format("YYYY-MM-DD HH:mm:ss")
            }, {patch:true});
        }

        return res.json({result});
    }

    else{
        res.status(400).send('Invalid API Key.')
    }
});

// Returns all weather data from the database
router.get('/', async function (req, res) {
    try{
        var weather = await knex('sensor_type').select().orderBy('created_at', 'desc')
    } catch(ex){
        return res.json({});
    }

    return res.json({ weather });
});

// Returns the latest weather data for each station from the database
router.get('/latest', async function (req, res) {
    try{
        var weather = await knex('latestweather')
            .join('sensor_type', 'latestweather.weather_id', 'sensor_type.weather_id')
            .join('stations', 'latestweather.apikey', 'stations.apikey')
            .select('sensor_type.*', 'stations.station_name', 'stations.last_connected', 'stations.connected')
            .orderBy('stations.connected', 'desc')
            .orderBy('stations.station_name')
    } catch(ex){
        console.log(ex);
        return res.json({});
    }
    return res.json({ weather });
});

// Returns the temperature for the last 24 from each station from the database
router.get('/sensorData/:from/:to/:type', async function (req, res) {
    from = moment(req.params.from).utc().format("YYYY-MM-DD HH:mm:ss");
    to = moment(req.params.to).utc().format("YYYY-MM-DD HH:mm:ss");
    try{
        var temp = await knex('sensor_type').select('sensor_type.temperature', 'sensor_type.pressure', 'sensor_type.humidity', 'sensor_type.cpu_usage', 'sensor_type.ram_usage', 'sensor_type.battery', 'sensor_type.created_at', 'sensor_type.apikey', 'stations.station_name').from('sensor_type')
        .leftJoin('stations', 'stations.apikey', 'sensor_type.apikey')
        .whereBetween('sensor_type.created_at', [from, to])
        .orderBy('sensor_type.created_at');
    } catch(ex){
        console.log(ex);
        return res.json({});
    }

    return res.json({ temp });
});

// Retrieve all station names
router.get('/stations_name', async function (req, res) {
    try{
        var names = await knex('stations').select('stations.station_name')
    } catch(ex){
        console.log(ex);
        return res.json({});
    }
    return res.json({ names });
});

// Returns the latest weather data for each station from the database
router.post('/verifyKey', async function (req, res) {
    var station = await knex('stations').select().where('apikey', req.body.apikey);
    if (station.length > 0){
        if (_.isNull(station[0].expiration) ||  moment(station[0].expiration).utc(station[0].expiration).isAfter(req.body.time)){
            if (station[0].taken === 0){
                var result = await Station.where('apikey', req.body.apikey).save({
                    taken: 1,
                }, {patch:true});
                res.status(200).send("Verified API Key.");
            }

            else{
                res.status(409).send('API Key already taken.');
            }
        }
        else res.status(400).send('Invalid API Key.');
    }
    else res.status(400).send('Invalid API Key.');
});

// Returns the latest weather data for each station from the database
router.post('/offlineData', async function (req, res) {
    req.body.map(async (row) => {
        try{
            var result = await new Weather({
                apikey: row.apikey,
                created_at: row.created_at,
                temperature: row.temperature,
                humidity: row.humidity,
                pressure: row.pressure,
                cpu_usage: row.cpu_usage,
                ram_usage: row.ram_usage,
                battery: row.battery,
                latitude: row.latitude,
                longitude: row.longitude
            }).save()
        } catch(ex) { 
            console.log(ex); 
        }
    })
    return res.status(400).send('Added historical data.');
});


module.exports = router;