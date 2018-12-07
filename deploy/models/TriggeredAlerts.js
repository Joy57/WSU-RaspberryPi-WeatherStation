'use strict';
var bookshelf = require('../bookshelf');


let TriggeredAlerts = bookshelf.Model.extend({
    tableName: 'triggeredalerts'
});

module.exports = TriggeredAlerts;