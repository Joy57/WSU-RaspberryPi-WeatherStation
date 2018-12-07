const async = require('async');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const knex = require('knex')(require('../knexfile'));

exports.up = async function(knex, Promise) {
    var hash = await bcrypt.hash("superuser123", 10);
    var superuserId = await knex('permissions').select('permission_id').where('type', '=', 'Superuser');
    superuserId = superuserId[0]["permission_id"];
    return Promise.all([
        await knex.schema.hasTable('users').then((exists) => {
            if (exists) {
                return knex("users").insert([
                        {
                            username: "superuser",
                            email: "superuser1073543@gmail.com",
                            password: hash,
                            permission_id: superuserId
                        },
                    ]);
            }
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex('users').truncate()
    ]);
};
