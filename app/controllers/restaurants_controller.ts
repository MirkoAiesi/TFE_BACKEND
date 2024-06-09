import type { HttpContext } from '@adonisjs/core/http'
import { addRestaurantValidator } from '#validators/restaurant'
import Restaurant from '#models/restaurant'
import fs from 'fs'
import path from 'path'

export default class RestaurantsController {
  async getAllRestaurants({ response }: HttpContext) {
    try {
      const list = await Restaurant.all()
      response.status(200).json(list)
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async search({ request, response }: HttpContext) {
    const { name, type, price, dogs, terrace, card } = request.only(['name', 'type', 'price', 'dogs', 'terrace', 'card'])

    let query = Restaurant.query()

    // Filtrer d'abord par nom
    if (name) {
      query = query.where('name', 'LIKE', `%${name}%`)
    }

    const restaurants = await query.exec()

    // Appliquer les autres filtres aux résultats
    let filteredRestaurants = restaurants

    if (type) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.cooking_type === type)
    }

    if (price) {
      if (price === '€ (-50€)') {
        filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.price === "€ (-50€)")
      } else if (price === '€€ (50€ - 80€)') {
        filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.price === "€€ (50€ - 80€)")
      } else if (price === '€€€ (+80€)') {
        filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.price === '€€€ (+80€)')
      }
    }
    if (dogs) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => {
        const params = restaurant.options.split(',')
        return params[0] === 'oui'
      })
    }

    if (terrace) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => {
        const params = restaurant.options.split(',')
        return params[1] === 'oui'
      })
    }

    if (card) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => {
        const params = restaurant.options.split(',')
        return params.length > 2 && params[2] !== ''
      })
    }

    return response.json(filteredRestaurants)
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
      console.log(user)
      const restaurant = await addRestaurantValidator.validate(
        request.only(['name', 'address', 'desc', 'options', 'status', 'phone', 'cooking_type', 'price', 'cultery', 'schedule', 'cut_time', 'vacancy', 'rating'])
      )
      console.log(restaurant)
      await Restaurant.create({
        owner_id: user.id,
        ...restaurant,
      })
      response.status(201).json('Restaurant successfully created.')
    } catch (error) {
      console.log(error)
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
  public async uploadPhotos({ params, request, response }: HttpContext) {
    const restaurantId = params.id
    const photos = request.files('photos', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg']
    })

    if (!photos || !photos.length) {
      return response.badRequest('No photos uploaded')
    }

    const uploadPath = path.join('public', restaurantId)
    console.log(uploadPath)

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    for (const photo of photos) {
      await photo.move(uploadPath, {
        name: `${new Date().getTime()}.${photo.extname}`,
        overwrite: true
      })
    }

    return response.json({ message: 'Photos uploaded successfully' })
  }

  public async getPhotos({ params, response }: HttpContext) {
    const restaurantId = params.id
    const uploadPath = path.join('public', restaurantId)

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      return response.json([])
    }

    const files = fs.readdirSync(uploadPath)
    const fileUrls = files.map(file => `/${restaurantId}/${file}`)

    return response.json(fileUrls)
  }
  public async deletePhoto({ params, response }: HttpContext) {
    const { id: restaurantId, fileName } = params
    const filePath = path.join('public', restaurantId, fileName)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return response.json({ message: 'Photo deleted successfully' })
    } else {
      return response.status(404).json({ message: 'Photo not found' })
    }
  }

  async updateRestaurantStatus({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      if (user.id !== 1) {
        return response.status(403).json({ error: 'Access denied. Only administrators can update restaurant status.' })
      }
      const { id, status } = request.only(['id', 'status'])
      const restaurant = await Restaurant.find(id)
      if (!restaurant) {
        console.log(`Restaurant with ID ${id} not found`)
        return response.status(404).json({ error: 'Restaurant not found' })
      }
      restaurant.status = status
      await restaurant.save()
      return response.status(200).json('Restaurant status successfully updated.')
    } catch (error) {
      console.error(error)
      return response.status(500).json(error)
    }
  }
}
