import type { HttpContext } from '@adonisjs/core/http'
import { addRatingValidator } from '#validators/review'
import Review from '#models/review'
import User from '#models/user'
import Restaurant from '#models/restaurant'

export default class ReviewsController {
  async addReview({ auth, request, response, params }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate();
      const restaurantId = params.id;
      console.log(restaurantId)
      const restaurant = {
        ...request.all(),
        restaurant_id: restaurantId
      }
      const payload = await addRatingValidator.validate(restaurant);
      const { restaurant_id, ...restPayload } = payload;

      await Review.create({
        user_id: user.id,
        restaurant_id: restaurantId,
        ...restPayload,
      });
      user.fidelity = user.fidelity + 5
      user.save()
      response.status(201).json('Review successfully created.');
    } catch (error) {
      console.error('Error in addReview:', error);
      response.status(500).json({ message: 'Internal Server Error', error });
    }
  }
  async getReview({ auth, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate()

      let reviews
      if (user.id === 1) {
        reviews = await Review.all()
      }

      response.status(200).json(reviews)
    } catch (error) {
      console.error('Error in getReview:', error)
      response.status(500).json({ message: 'Internal Server Error', error })
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
  async getUserReviews({ params, response }: HttpContext) {
    try {
      const userId = params.userId
      const reviews = await Review.query().where('user_id', userId)

      const enrichedReviews = await Promise.all(reviews.map(async (review) => {
        const resto = await Restaurant.findBy('id', review.restaurant_id)
        return {
          ...review.toJSON(),
          restaurant_name: resto ? resto.name : 'Unknown'
        }
      }))

      return response.status(200).json(enrichedReviews)

      response.status(200).json(reviews)
    } catch (error) {
      response.status(500).json({ message: 'Une erreur est survenue.', error: error.message })
    }
  }
  async deleteReview({ auth, params, response }: HttpContext) {
    try {
      const user = await auth.use('api').authenticate();
      const reviewId = params.id;

      const review = await Review.findOrFail(reviewId);

      if (review.user_id !== user.id) {
        return response.status(403).json({ message: 'Unauthorized to delete this review' });
      }

      await review.delete();
      response.status(200).json({ message: 'Review successfully deleted' });
    } catch (error) {
      response.status(500).json({ message: 'Une erreur est survenue.', error: error.message });
    }
  }
}
