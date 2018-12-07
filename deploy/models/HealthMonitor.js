'use strict';
var bookshelf = require('../bookshelf');

// Allows access to our health monitor table in other
// parts of the app once we include it.
let StationNames = bookshelf.Model.extend({
    tableName: 'healthmonitor'
});

module.exports = HealthMonitor;