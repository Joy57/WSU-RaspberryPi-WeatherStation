'use strict';
var bookshelf = require('../bookshelf');

// Station model allows access to our stations table in other
// parts of the app once we include it.
let StationNames = bookshelf.Model.extend({
    tableName: 'station_names'
});

module.exports = StationNames;