'use strict';
var bookshelf = require('../bookshelf');


let LatestWeather = bookshelf.Model.extend({
    tableName: 'latestweather'
});

module.exports = LatestWeather;