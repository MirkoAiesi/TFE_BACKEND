import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { changePasswordValidator } from '#validators/auth'
import hash from '@adonisjs/core/services/hash'

export default class UsersController {
  async getUserInformation({ auth, response }: HttpContext) {
    try {
      const tokenData = await auth.use('api').authenticate()
      return response.json(tokenData)
    } catch (error) {
      return response.status(500).json({ error: error })
    }
  }

  async modifyProfile({ auth, response, request }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const newData = request.only(['first_name', 'last_name'])
      await User.query().where('id', user.id).update({
        first_name: newData.first_name,
        last_name: newData.last_name,
      })
      return response.status(200).json('User has been correctly modified.')
    } catch (error) {
      return response.status(500).json({ error: error })
    }
  }
  async modifyPassword({ auth, response, request }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const newData = request.all()
      const goodPassword = await hash.verify(user.password, newData.currentPassword)
      if (goodPassword) {
        const payload = await changePasswordValidator.validate(newData)
        await User.query()
          .where('id', user.id)
          .update({
            password: await hash.make(payload.newPassword),
          })
        await User.accessTokens.delete(user, user.currentAccessToken.identifier)
        return response.status(200).json("User's password has been correctly modified.")
      } else {
        return response.status(401).json('Wrong password.')
      }
    } catch (error) {
      return response.status(500).json({ error: error })
    }
  }
  async deleteAccount({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      user.delete()
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      return response.status(200).json('User has been successfully deleted.')
    } catch (error) {
      return response.status(500).json({ error: error })
    }
  }
}
