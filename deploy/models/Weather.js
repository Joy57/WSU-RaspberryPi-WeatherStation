'use strict';
var bookshelf = require('../bookshelf');


let Weather = bookshelf.Model.extend({
    tableName: 'sensor_type'
});

module.exports = Weather;