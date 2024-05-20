import type { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#models/restaurant'
import Review from '#models/review'
import Booking from '#models/booking'

export default class RestorersController {
  async getReviews({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const restaurant = await Restaurant.findBy('owner_id', user.id)
      if (restaurant !== null) {
        const reviews = await Review.findManyBy('restaurant_id', restaurant.id)
        response.status(200).json(reviews)
      } else {
        response.status(404).json('Restaurant not found.')
      }
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getBookings({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const restaurant = await Restaurant.findBy('owner_id', user.id)
      if (restaurant !== null) {
        const bookings = await Booking.findManyBy('restaurant_id', restaurant.id)
        response.status(200).json(bookings)
      } else {
        response.status(404).json('Restaurant not found.')
      }
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async updateBooking({ auth, params, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const payload = request.only(['status'])
      const bookingId = params.id
      const restaurant = await Restaurant.findBy('owner_id', user.id)
      if (restaurant !== null) {
        await Booking.query().where('id', bookingId).update({
          status: payload.status,
        })
        response.status(200).json('Booking has been successfully updated.')
      } else {
        response.status(404).json('Restaurant not found.')
      }
    } catch (error) {
      response.status(500).json(error)
    }
  }
}
