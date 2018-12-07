'use strict';
var bookshelf = require('../bookshelf');

let AlertMethods = bookshelf.Model.extend({
    tableName: 'alertmethods'
});

module.exports = AlertMethods;