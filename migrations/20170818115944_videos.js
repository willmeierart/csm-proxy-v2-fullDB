exports.up = function(knex, Promise) {
  return knex.schema.createTable('videos', (table)=>{
    table.integer('vimeo_id').primary()
    table.text('entire_json')
  })
};

exports.down = function(knex, Promise) {return knex.schema.dropTableIfExists('videos')};
