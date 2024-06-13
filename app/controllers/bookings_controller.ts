import { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'
import Restaurant from '#models/restaurant'
import User from '#models/user'

export default class BookingsController {
  async addBooking({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const data = request.only(['restaurant_id', 'date_time', 'number_people', 'comment', 'fidelity'])
      let reduction = null
      if (user.fidelity >= data.fidelity && data.fidelity !== null) {
        switch (data.fidelity) {
          case 100:
            reduction = 5
            break;
          case 200:
            reduction = 10
            break;
          case 500:
            reduction = 20
            break;
          default:
            reduction = null
        }
        user.fidelity = user.fidelity - data.fidelity
        user.save()
      } else {
        return response.status(500).json("Pas assez de points de fidélité")
      }
      await Booking.create({
        user_id: user.id,
        restaurant_id: data.restaurant_id,
        date_time: data.date_time,
        number_people: data.number_people,
        comment: data.comment,
        status: 0,
        fidelity: reduction ? reduction : null
      })

      return response.status(201).json('Booking successfully created.')
    } catch (error) {
      console.log(error)
      response.status(500).json(error)
    }
  }
  async getPendingBookings({ auth, response }: HttpContext) {
    try {

      const user = await auth.use('api').authenticate()

      await user.load('restaurant')
      const restaurant = user.restaurant
      if (!restaurant) {
        return response.status(404).json({ message: 'Restaurant not found' })
      }

      const restaurantId = restaurant.id
      if (typeof restaurantId !== 'number') {
        return response.status(400).json({ message: 'Invalid restaurant ID' })
      }

      const bookings = await Booking.query().where('restaurant_id', restaurantId).andWhere('status', 0)

      return response.json({ pendingBookings: bookings.length })
    } catch (error) {
      console.error('Error in getPendingBookings:', error)
      return response.status(500).json({ message: 'Internal Server Error', error })
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
      const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
        const user = await User.findBy('id', booking.user_id)
        return {
          ...booking.toJSON(),
          user_name: user ? user.lastName : 'Unknown'
        }
      }))

      return response.status(200).json(enrichedBookings)
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
      console.log('Fetching bookings for user ID:', userId);

      const bookings = await Booking.query().where('user_id', userId)

      const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
        const resto = await Restaurant.findBy('id', booking.restaurant_id)
        return {
          ...booking.toJSON(),
          restaurant_name: resto ? resto.name : 'Unknown'
        }
      }))

      return response.status(200).json(enrichedBookings)
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

      const user = await User.findBy('id', booking?.user_id)
      if (user) {
        user.fidelity = user.fidelity + 20
        user.save()
      }

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
  async deleteBooking({ auth, params, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate();
      const bookingId = params.id;

      const booking = await Booking.find(bookingId);
      if (!booking) {
        return response.status(500).json('Booking not found');

      }

      const restaurant = await Restaurant.find(booking.restaurant_id);
      if (!restaurant) {
        return response.status(500).json('Restaurant not found');
      }

      if (restaurant.owner_id !== user.id) {
        return response.status(500).json('You do not have permission to delete this booking');
      }

      await booking.delete();
      return response.status(200).json('Booking successfully deleted');
    } catch (error) {
      console.error(error);
      return response.status(500).json('An error occurred while deleting the booking');
    }
  }

}
