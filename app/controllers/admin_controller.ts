import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Restaurant from '#models/restaurant'
import Booking from '#models/booking'
import Review from '#models/review'

export default class AdminController {
  async getUsers({ response }: HttpContext) {
    try {
      const users = await User.all()
      response.status(200).json(users)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async updateUser({ params, request, response }: HttpContext) {
    try {
      const payload = request.only(['first_name', 'last_name', 'email'])
      await User.query()
        .where('id', params.id)
        .update({
          ...payload,
        })
      response.status(200).json('User has been successfully updated.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async deleteUsers({ params, response }: HttpContext) {
    try {
      await User.query().where('id', params.id).delete()
      response.status(200).json('User has been deleted.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async acceptRestaurant({ params, request, response }: HttpContext) {
    try {
      const payload = request.only(['status'])
      await Restaurant.query()
        .where('id', params.id)
        .update({
          ...payload,
        })
      response.status(200).json(payload.status)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async deleteRestaurant({ params, response }: HttpContext) {
    try {
      await Restaurant.query().where('id', params.id).delete()
      response.status(200).json('Restaurant has been deleted.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async updateRestaurant({ params, request, response }: HttpContext) {
    try {
      const payload = request.only(['name', 'address', 'desc', 'options'])
      await Restaurant.query()
        .where('id', params.id)
        .update({
          ...payload,
        })
      response.status(200).json('Restaurant has been updated.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getUserBookings({ params, response }: HttpContext) {
    try {
      const userBookings = await Booking.findManyBy('user_id', params.id)
      response.status(200).json(userBookings)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getRestaurantBookings({ params, response }: HttpContext) {
    try {
      const restaurantBookings = await Booking.findManyBy('restaurant_id', params.id)
      response.status(200).json(restaurantBookings)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getUserReviews({ params, response }: HttpContext) {
    try {
      const userReviews = await Review.findManyBy('user_id', params.id)
      response.status(200).json(userReviews)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getRestaurantReviews({ params, response }: HttpContext) {
    try {
      const restaurantReviews = await Review.findManyBy('restaurant_id', params.id)
      response.status(200).json(restaurantReviews)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async deleteBooking({ params, response }: HttpContext) {
    try {
      await Booking.query().where('id', params.id).delete()
      response.status(200).json('Booking has been deleted')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async deleteReview({ params, response }: HttpContext) {
    try {
      await Review.query().where('id', params.id).delete()
      response.status(200).json('Review has been deleted')
    } catch (error) {
      response.status(500).json(error)
    }
  }
}
