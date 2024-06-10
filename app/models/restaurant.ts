import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Booking from './booking.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Restaurant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare owner_id: number

  @column()
  declare address: string

  @column()
  declare options: string

  @column()
  declare status: number

  @column()
  declare phone: string

  @column()
  declare cooking_type: string

  @column()
  declare price: string

  @column()
  declare cultery: number

  @column()
  declare schedule: object

  @column()
  declare cut_time: string

  @column()
  declare vacancy: string

  @column()
  declare rating: number

  @column()
  declare facebook: string

  @column()
  declare instagram: string

  @column()
  declare web: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Booking)
  public bookings!: HasMany<typeof Booking>
}
