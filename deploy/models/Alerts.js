'use strict';
var bookshelf = require('../bookshelf');

let Alerts = bookshelf.Model.extend({
    tableName: 'alerts'
});

module.exports = Alerts;
