'use strict';
var bookshelf = require('../bookshelf');

let AlertValues = bookshelf.Model.extend({
    tableName: 'alertvalues'
});

module.exports = AlertValues;
