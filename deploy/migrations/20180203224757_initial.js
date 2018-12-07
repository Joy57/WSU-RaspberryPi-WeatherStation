var knex = require('knex')(require('../knexfile'))
var knexCleaner = require('knex-cleaner');

// Create all tables for future use
exports.up = async function(knex, Promise) {
    await knex.schema.hasTable('permissions').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('permissions', function(table){
                table.increments('permission_id').primary();
                table.string('type', 16);
            })
        }
    })
    await knex.schema.hasTable('users').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('users', function(table){
                table.string('username', 32).primary();
                table.string('password', 64).unique();
                table.string('email', 128).unique();
                table.string('phone', 10).unique();
                table.string('reset_password_token', 20);
                table.dateTime('reset_password_expires');
                table.integer('permission_id').references('permission_id').inTable('permissions').unsigned().onDelete('SET NULL').onUpdate('CASCADE');
            })
        }
    })
    await knex.schema.hasTable('stations').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('stations', function (table) {
                table.string('apikey', 20).primary();
                table.string('station_name', 64);
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.timestamp('last_connected').defaultTo(knex.fn.now());
                table.dateTime('expiration');
                table.boolean('connected');
            })
        }
    })
    await knex.schema.hasTable('sensor_type').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('sensor_type', function(table){
                table.increments('weather_id').primary();
                table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable().index();
                table.float('temperature', 5, 2);
                table.float('humidity', 5, 2);
                table.float('pressure', 6, 2);
                table.string('latitude');
                table.string('longitude');
                table.float('cpu_usage', 4, 2);
                table.string('battery', 8);
                table.float('ram_usage', 4, 2);
                table.integer('visibility', 4);
                table.float('wind_speed', 5, 2);
                table.float('wind_direction', 5, 2);
                table.string('apikey', 20).references('apikey').inTable('stations').onDelete('SET NULL').onUpdate('CASCADE');
            })
        }
    })
    await knex.schema.hasTable('latestweather').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('latestweather', function(table){
                table.integer('weather_id').references('weather_id').inTable('sensor_type').unsigned().onDelete('CASCADE').onUpdate('CASCADE');
                table.string('apikey', 20).references('apikey').inTable('stations').onDelete('CASCADE').onUpdate('CASCADE');
                table.primary(['weather_id', 'apikey']);
            })
        }
    })
    await knex.schema.hasTable('alerts').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('alerts', function(table){
                table.increments('alert_id').primary();
                table.string('type');
                table.string('keyword');
                table.string('threshold');
                table.boolean('deleted');
                table.timestamp('last_triggered')
                table.string('apikey').references('apikey').inTable('stations').onDelete('CASCADE').onUpdate('CASCADE');
                table.string('username').references('username').inTable('users').onDelete('SET NULL').onUpdate('CASCADE');
            })
        }
    })
    await knex.schema.hasTable('alertvalues').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('alertvalues', function(table){
                table.increments('value_id').primary();
                table.float('value', 5, 2);
                table.integer('alert_id').references('alert_id').inTable('alerts').unsigned().onDelete('SET NULL').onUpdate('CASCADE');
            })
        }
    })
    await knex.schema.hasTable('alertmethods').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('alertmethods', function(table){
                table.increments('method_id').primary();
                table.string('method', 16);
                table.integer('alert_id').references('alert_id').inTable('alerts').unsigned().onDelete('SET NULL').onUpdate('CASCADE');
            })
        }
    })
    await knex.schema.hasTable('triggeredalerts').then((exists) => {
        if (!exists) {
            return knex.schema.createTable('triggeredalerts', function(table){
                table.increments('triggered_id').primary();
                table.boolean('read');
                table.boolean('cleared');
                table.string('method', 16);
                table.float('temperature', 5, 2);
                table.float('humidity', 5, 2);
                table.float('pressure', 6, 2);
                table.float('cpu_usage', 4, 2);
                table.float('ram_usage', 4, 2);
                table.timestamps(true, true);
                table.integer('alert_id').references('alert_id').inTable('alerts').unsigned().onDelete('SET NULL').onUpdate('CASCADE');            
            })
        }
    })
};


// Drop all tables in case we need to undo a migration
exports.down = function(knex, Promise) {
    return knexCleaner.clean(knex).then(() => {});
};