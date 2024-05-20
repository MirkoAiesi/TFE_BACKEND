import type { HttpContext } from '@adonisjs/core/http'
import { addRestaurantValidator } from '#validators/restaurant'
import Restaurant from '#models/restaurant'

export default class RestaurantsController {
  async getAllRestaurants({ response }: HttpContext) {
    try {
      const list = await Restaurant.all()
      response.status(200).json(list)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getRestaurant({ params, response }: HttpContext) {
    try {
      const restaurantId = params.id
      const data = await Restaurant.findBy('id', restaurantId)
      response.status(200).json(data)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async addRestaurant({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const restaurant = await addRestaurantValidator.validate(
        request.only(['name', 'address', 'desc'])
      )
      await Restaurant.create({
        owner_id: user.id,
        ...restaurant,
      })
      response.status(201).json('Restaurant successfully created.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async modifyRestaurant({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const restaurant = await addRestaurantValidator.validate(
        request.only(['name', 'address', 'desc'])
      )
      await Restaurant.query().where('owner_id', user.id).update({
        name: restaurant.name,
        address: restaurant.address,
        desc: restaurant.desc,
      })
      response.status(200).json('Restaurant successfully modified.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async deleteRestaurant({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const restaurant = await Restaurant.findBy('owner_id', user.id)
      if (restaurant) {
        await restaurant.delete()
        response.status(200).json('Restaurant successfully deleted.')
      }
    } catch (error) {
      response.status(500).json(error)
    }
  }
}
