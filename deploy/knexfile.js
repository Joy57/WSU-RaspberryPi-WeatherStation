'use strict';
var knex = {
  client: 'mysql',
  connection: {
    host : 'wsu-weather-station.c3mp4kcz4s1w.us-east-1.rds.amazonaws.com',
    port:'3306',
    user : 'wsu',
    password : 'wsucapstone2018',
    database : 'weatherstation',
    connectionLimit : 50, // Limits the number of open connections to mysql (ie the rpis)
  }
};

module.exports = knex;
