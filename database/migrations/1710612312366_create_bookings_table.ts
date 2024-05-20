import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('restaurant_id')
        .unsigned()
        .references('id')
        .inTable('restaurants')
        .onDelete('CASCADE')
      table.timestamp('date_time').notNullable()
      table.integer('number_people').notNullable()
      table.integer('status').defaultTo(0).notNullable()
      table.text('comment')
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
