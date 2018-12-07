const schedule = require('node-schedule');
const sendAlerts = require('./scripts/sendAlerts');
const checkConnected = require('./scripts/checkConnected');

module.exports =  {
    // Called every 15 seconds to check if any "connected" stations
    // are no longer sending data
    updateConnectedList() {
        schedule.scheduleJob('*/10 * * * * *', function(){
            checkConnected.checkConnected();
        }) 
    },

    //checks all user alerts every minute
    checkAlerts(){
        schedule.scheduleJob('0 * * * * *', function(){
            sendAlerts.sendAlerts();
        })
    }
}

