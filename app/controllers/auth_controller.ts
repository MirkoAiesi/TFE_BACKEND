import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { registerUserValidator } from '#validators/auth'

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
    console.log(data)
    const user = await User.findByOrFail('email', data.email)
    if (!user) {
      response.abort('Utilisateur introuvable.')
    }
    if (!(await hash.verify(user.password, data.password))) {
      return response.status(400).json('Wrong email or password.')
    } else {
      const token = await User.accessTokens.create(user)
      return token
    }
  }
}
