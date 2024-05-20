import { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'

export default class BookingsController {
  async addBooking({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const data = request.only(['restaurant_id', 'date_time', 'number_people', 'comment'])
      await Booking.create({
        user_id: user.id,
        restaurant_id: data.restaurant_id,
        date_time: data.date_time,
        number_people: data.number_people,
        comment: data.comment,
      })

      return response.status(201).json('Booking successfully created.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getMyBooking({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const bookings = await Booking.findBy('user_id', user.id)
      return response.status(200).json(bookings)
    } catch (error) {
      return response.status(500).json(error)
    }
  }
}
