var knex = require('knex')(require('../knexfile'))

exports.up = function(knex, Promise) {
    return knex.schema.table('stations', function(t) {
        t.boolean('taken').notNull().defaultTo(0);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('stations', function(t) {
        t.dropColumn('taken');
    });
};
