const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const Station = require('../models/Station');
const knex = require('knex')(require('../knexfile'));

// Creates a new station via post request
router.post('/', async function (req, res) {
    var expiration = req.body.expiration;
    if (expiration === 'Invalid date') expiration = null;
    
    if (req.body.station_name === "") {
        res.json({error: "Station name is required", redirect: false});
    }

    else{
        // If the station name doesn't exist, create a new one and insert it.
        var station = await knex('stations').select().where('station_name', req.body.station_name);
        if (station.length > 0){
            res.json({error: "Station name already exists", redirect: false});
        }

        else{
            if (req.body.station_name.length > 64){
                res.json({error: "Station name is too long. Must be 64 characters or less.", redirect: false});
            }

            else{
                var result = await new Station({
                    station_name: req.body.station_name,
                    apikey: req.body.api_key,
                    expiration: expiration,
                    connected: false,
                }).save()
                return res.json({result});
            }
        }
    }    
});

// Returns all stations in the database
router.get('/', async function (req, res) {
    try{
        var stations = await knex('stations').select().orderBy('station_name', 'desc')
    } catch(ex){
        return res.json({});
    }

    return res.json({ stations });
});

// Returns a single station by ID and either updates or deletes it depending on request params
router.route('/:api_key')
    // Update existing station 
    .put(async function(req, res){
        var expiration = req.body.expiration;
        if (expiration === 'Invalid date') expiration = null;

        var station = await knex('stations').select().where('station_name', req.body.station_name);
        if (station.length > 0 && req.body.station_name !== req.body.oldName){
            res.json({error: "Station name already exists", redirect: false});
        }

        else if (req.body.station_name === ""){
            res.json({error: "Station name is required", redirect: false});
        }

        else{
            if (req.body.station_name.length > 64){
                res.json({error: "Station name is too long. Must be 64 characters or less.", redirect: false});
            }

            else{
                var result = await Station.where('apikey', req.params.api_key).save({
                    station_name: req.body.station_name,
                    expiration: expiration
                }, {patch:true});
                return res.json({result});
            }
        }
    })
    // Delete existing station
    .delete(async function(req, res) {
        var result = await Station.where('apikey', req.params.api_key).destroy();
        res.json({result});
    });

router.route('/connected/:api_key')
    // Update existing station 
    .put(async function(req, res){
        var result = await Station.where('apikey', req.params.api_key).save({
            connected: req.body.connected,
            last_connected: req.body.last_connected
        }, {patch:true});
        return res.json({result});
    })

router.get('/download', function(req, res){
    var file = __dirname + '/download/weatherstation.zip';
    res.download(file);
});


module.exports = router;