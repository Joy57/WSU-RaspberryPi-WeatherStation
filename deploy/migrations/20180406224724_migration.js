var knex = require('knex')(require('../knexfile'))

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists("permissions", function (table) {
        table.string('type');
        }).then(function () {
                return knex("permissions").insert([
                    {type: "Superuser"},
                    {type: "User"},
                    {type: "Admin"},
                    {type: "Pending"},
                    {type: "Denied"}
                ]);
            }
        ),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex('permissions').truncate()
    ]);

};
