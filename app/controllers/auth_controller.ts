import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { registerUserValidator } from '#validators/auth'
import Restaurant from '#models/restaurant'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = request.all()
    const payload = await registerUserValidator.validate(data)
    await User.create(payload)
    return response.status(201).json({
      message: 'Inscription réussite.',
      type: 'success',
    })
  }

  async login({ request, response }: HttpContext) {
    const data = request.all()
    const user = await User.findBy('email', data.email)
    if (!user) {
      response.abort('Utilisateur introuvable.')
    }
    else {
      if (!(await hash.verify(user.password, data.password))) {
        return response.status(400).json('Wrong email or password.')
      } else {
        const token = await User.accessTokens.create(user)
        return token
      }
    }
  }
  async checkRestaurant({ auth, response }: HttpContext) {
    const user = auth.use('api').authenticate()
    if (user) {
      const restaurant = await Restaurant.findBy('owner_id', (await user).id)
      if (restaurant) {
        response.status(200).json(restaurant)
      } else {
        response.status(401).json(false)
      }
    }
  }
  async checkUser({ auth, response }: HttpContext) {
    try {
      await auth.use('api').authenticate();
      const user = auth.use('api').user;
      if (user) {
        return response.json({ userId: user.id });
      } else {
        return response.unauthorized({ message: 'User not authenticated' });
      }
    } catch (error) {
      return response.unauthorized({ message: 'User not authenticated' });
    }
  }
}



