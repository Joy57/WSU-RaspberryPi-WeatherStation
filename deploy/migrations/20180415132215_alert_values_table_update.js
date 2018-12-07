
exports.up = async function(knex, Promise) {
    return Promise.all([
        await knex.schema.raw('alter table alertvalues modify column value float(6,2)')
    ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex('alertvalues').truncate()
    ]);
};
