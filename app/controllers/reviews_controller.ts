import type { HttpContext } from '@adonisjs/core/http'
import { addRatingValidator } from '#validators/review'
import Review from '#models/review'

export default class ReviewsController {
  async addReview({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const payload = await addRatingValidator.validate(request.all())
      await Review.create({
        user_id: user.id,
        ...payload,
      })

      response.status(201).json('Review successfully created.')
    } catch (error) {
      response.status(500).json(error)
    }
  }
  async getReview({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()
      const reviews = await Review.findBy('user_id', user.id)
      response.status(200).json(reviews)
    } catch (error) {
      response.status(500).json(error)
    }
  }
}
