import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Restaurant from './restaurant.js'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

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

  @belongsTo(() => Restaurant, {
    foreignKey: 'restaurantId', // Utilise restaurantId comme clé étrangère
  })
  public restaurant!: BelongsTo<typeof Restaurant>

  @belongsTo(() => User, {
    foreignKey: 'userId', // Utilise userId comme clé étrangère
  })
  public user!: BelongsTo<typeof User>
}
