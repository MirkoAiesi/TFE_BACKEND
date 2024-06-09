import type { HttpContext } from '@adonisjs/core/http'
import { addRatingValidator } from '#validators/review'
import Review from '#models/review'
import User from '#models/user'

export default class ReviewsController {
  async addReview({ auth, request, response, params }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate();
      const restaurantId = params.id; // Récupérer l'ID du restaurant à partir des paramètres
      console.log(restaurantId)
      const restaurant = {
        ...request.all(),
        restaurant_id: restaurantId
      }
      const payload = await addRatingValidator.validate(restaurant);

      // Exclure explicitement restaurant_id du payload s'il existe
      const { restaurant_id, ...restPayload } = payload;

      await Review.create({
        user_id: user.id,
        restaurant_id: restaurantId, // Utiliser l'ID du restaurant ici
        ...restPayload,
      });

      response.status(201).json('Review successfully created.');
    } catch (error) {
      console.error('Error in addReview:', error); // Journaliser l'erreur pour le débogage
      response.status(500).json({ message: 'Internal Server Error', error });
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
  async getRestaurantReview({ params, response }: HttpContext) {
    try {
      const restaurantId = params.id
      const reviews = await Review.query().where('restaurant_id', restaurantId)

      const enrichedReviews = await Promise.all(reviews.map(async (review) => {
        const user = await User.find(review.user_id)
        return {
          ...review.toJSON(),
          user: {
            firstName: user?.firstName,
            lastName: user?.lastName,
          }
        }
      }))

      response.status(200).json(enrichedReviews)
    } catch (error) {
      response.status(500).json({ message: 'Une erreur est survenue.', error: error.message })
    }
  }
}
