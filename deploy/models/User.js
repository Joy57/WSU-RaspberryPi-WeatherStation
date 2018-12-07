'use strict';
var bookshelf = require('../bookshelf');

let User = bookshelf.Model.extend({
    tableName: 'users'
});

module.exports = User;
