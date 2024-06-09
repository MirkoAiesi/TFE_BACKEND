import { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'
import Restaurant from '#models/restaurant'

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
      const bookings = await Booking.query().where('user_id', user.id)
      console.log(bookings)
      return response.status(200).json(bookings)
    } catch (error) {
      return response.status(500).json(error)
    }
  }
  async getBookingsByRestaurant({ params, response }: HttpContext) {
    try {
      const { restaurantId } = params
      const bookings = await Booking.query().where('restaurant_id', restaurantId)
      return response.status(200).json(bookings)
    } catch (error) {
      return response.status(500).json(error)
    }
  }
  async getBookingsByUser({ params, response }: HttpContext) {
    try {
      const { userId } = params
      if (isNaN(parseInt(userId))) {
        return response.status(400).json({ message: 'Invalid user ID' })
      }
      console.log('Fetching bookings for user ID:', userId); // Log pour vérification

      const bookings = await Booking.query().where('user_id', userId)
      console.log('Bookings:', bookings); // Log les réservations pour vérification

      return response.status(200).json(bookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      return response.status(500).json({ message: 'Failed to fetch bookings', error })
    }
  }
  async updateBookingStatus({ auth, request, response }: HttpContext) {
    try {
      const restaurateur = await auth.use('api').authenticate()
      const { id, status } = request.only(['id', 'status'])

      const restaurant = await Restaurant.query()
        .where('owner_id', restaurateur.id)
        .firstOrFail()
      const booking = await Booking.query()
        .where('id', id)
        .andWhere('restaurant_id', restaurant.id)
        .first()

      if (!booking) {
        console.log(`Booking with ID ${id} and Restaurant ID ${restaurant.id} not found`)
        return response.status(404).json({ error: 'Booking not found' })
      }

      booking.status = status
      await booking.save()

      return response.status(200).json('Booking status successfully updated.')
    } catch (error) {
      console.error(error)
      return response.status(500).json(error)
    }
  }

  async updateBookingStatusByUser({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate();
      const { id, status } = request.only(['id', 'status']);

      const booking = await Booking.query()
        .where('id', id)
        .andWhere('user_id', user.id)
        .first();

      if (!booking) {
        console.log(`Booking with ID ${id} and User ID ${user.id} not found`);
        return response.status(404).json({ error: 'Booking not found' });
      }

      booking.status = status;
      await booking.save();

      return response.status(200).json('Booking status successfully updated.');
    } catch (error) {
      console.error(error);
      return response.status(500).json(error);
    }
  }

}
