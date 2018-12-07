'use strict';
var bookshelf = require('../bookshelf');

// Station model allows access to our stations table in other
// parts of the app once we include it.
let Station = bookshelf.Model.extend({
    tableName: 'stations'
});

module.exports = Station;