import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 100).notNullable()
      table
        .integer('owner_id')
        .unique()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('address', 255).notNullable()
      table.string('desc')
      table.string('options')
      table.integer('status').defaultTo(0).notNullable()
      table.string('phone').notNullable
      table.string('cooking_type').notNullable()
      table.string('price').notNullable()
      table.integer('cultery').notNullable()
      table.jsonb('schedule').notNullable()
      table.string('cut_time')
      table.string('vacancy')
      table.float('rating').defaultTo(0);
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
