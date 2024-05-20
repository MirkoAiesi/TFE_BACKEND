import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Booking extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare restaurant_id: number

  @column.dateTime({ autoCreate: true })
  declare date_time: DateTime

  @column()
  declare number_people: number

  @column()
  declare status: number

  @column()
  declare comment: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
