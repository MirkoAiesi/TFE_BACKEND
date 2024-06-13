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
    if (name) {
      query = query.whereRaw('LOWER(name) LIKE ?', [`%${name.toLowerCase()}%`])
    }

    const restaurants = await query.exec()
    let filteredRestaurants = restaurants

    if (type) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.cooking_type === type)
    }
    if (price) {
      if (price === '€') {
        filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.price === "€ (-50€)")
      } else if (price === '€€') {
        filteredRestaurants = filteredRestaurants.filter(restaurant => restaurant.price === "€€ (50€ - 80€)")
      } else if (price === '€€€') {
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
        return params[1].trim().toLowerCase() === 'oui'
      })
    }

    if (card) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => {
        const params = restaurant.options.split(',')
        return params.length > 2 && params[2] !== ''
      })
    }

    const enhancedRestaurants = await Promise.all(filteredRestaurants.map(async (restaurant) => {
      const restaurantDir = path.join('public', String(restaurant.id));

      let firstImage = null;
      if (fs.existsSync(restaurantDir)) {
        const files = fs.readdirSync(restaurantDir).filter(file => /\.(jpg|jpeg|png|gif|webp)$/.test(file));
        if (files.length > 0) {
          firstImage = files[0];
        }
      }

      return {
        ...restaurant.toJSON(),
        firstImage,
      };
    }));

    return response.json(enhancedRestaurants);
  }
  async getRestaurant({ params, response }: HttpContext) {
    try {
      const restaurantId = params.id;
      const restaurant = await Restaurant.findBy('id', restaurantId);

      if (!restaurant) {
        return response.status(404).json({ message: 'Restaurant not found' });
      }

      const restaurantDir = path.join('public', String(restaurantId));

      let files = [];
      if (fs.existsSync(restaurantDir)) {
        files = fs.readdirSync(restaurantDir).filter(file => /\.(jpg|jpeg|png|gif)$/.test(file));
      }

      const data = {
        restaurant,
        files,
      };

      response.status(200).json(data);
    } catch (error) {
      response.status(500).json(error);
    }
  }
  async addRestaurant({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const restaurant = await addRestaurantValidator.validate(
        request.only(['name', 'address', 'options', 'status', 'phone', 'cooking_type', 'price', 'cultery', 'schedule', 'cut_time', 'vacancy', 'rating'])
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
        request.only(['name', 'address', 'options', 'phone', 'cooking_type', 'price', 'cultery', 'schedule', 'cut_time', 'vacancy'])
      )
      await Restaurant.query().where('owner_id', user.id).update({
        name: restaurant.name,
        address: restaurant.address,
        options: restaurant.options,
        phone: restaurant.phone,
        cooking_type: restaurant.cooking_type,
        price: restaurant.price,
        cultery: restaurant.cultery,
        schedule: restaurant.schedule,
        cut_time: restaurant.cutTime,
        vacancy: restaurant.vacancy,
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
  async updateRestaurantRating({ params, request, response }: HttpContext) {
    try {
      const restaurantId = params.id;
      const { rating } = request.only(['rating']);

      if (rating === undefined || isNaN(rating)) {
        return response.status(400).json({ error: 'Invalid rating value' });
      }

      const restaurant = await Restaurant.find(restaurantId);

      if (!restaurant) {
        return response.status(404).json({ message: 'Restaurant not found' });
      }

      restaurant.rating = rating;
      await restaurant.save();

      return response.status(200).json({ message: 'Restaurant rating successfully updated.', restaurant });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'An error occurred while updating the rating' });
    }
  }
  async addSocialLinks({ params, request, response }: HttpContext) {
    try {
      const restaurantId = params.id;
      const { facebook, instagram, web } = request.only(['facebook', 'instagram', 'web']);

      const restaurant = await Restaurant.find(restaurantId);

      if (!restaurant) {
        return response.status(404).json({ message: 'Restaurant not found' });
      }

      restaurant.facebook = facebook;
      restaurant.instagram = instagram;
      restaurant.web = web;
      await restaurant.save();

      return response.status(200).json({ message: 'Social links successfully added.', restaurant });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'An error occurred while adding the social links' });
    }
  }
}
