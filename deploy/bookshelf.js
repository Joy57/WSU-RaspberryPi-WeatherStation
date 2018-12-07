'use strict';
var knex = require('knex')(require('./knexfile'));
var bookshelf = require('bookshelf')(knex);
module.exports = bookshelf;