import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import { middleware } from '#start/kernel'
const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const RestaurantsController = () => import('#controllers/restaurants_controller')
const BookingsController = () => import('#controllers/bookings_controller')
const ReviewsController = () => import('#controllers/reviews_controller')
const RestorersController = () => import('#controllers/restorers_controller')
const AdminController = () => import('#controllers/admin_controller')

router.get('/testing', () => {
  return 'Hello world !'
})

router
  .group(() => {
    router
      .group(() => {
        router.post('/register', [AuthController, 'register'])
        router.post('/login', [AuthController, 'login'])
      })
      .prefix('/auth')

    router
      .group(() => {
        router.get('/', [UsersController, 'getUserInformation']).use(middleware.auth())
        router.patch('/modify', [UsersController, 'modifyProfile']).use(middleware.auth())
        router.patch('/modify/password', [UsersController, 'modifyPassword']).use(middleware.auth())
        router.delete('/delete', [UsersController, 'deleteAccount']).use(middleware.auth())
      })
      .prefix('/profile')
    router
      .group(() => {
        router.get('/all', [RestaurantsController, 'getAllRestaurants'])
        router.get('/:id', [RestaurantsController, 'getRestaurant'])
        router.post('/add', [RestaurantsController, 'addRestaurant']).use(middleware.auth())
        router.patch('/modify', [RestaurantsController, 'modifyRestaurant']).use(middleware.auth())
        router.delete('/delete', [RestaurantsController, 'deleteRestaurant']).use(middleware.auth())
      })
      .prefix('/restaurants')
    router
      .group(() => {
        router.post('/create', [BookingsController, 'addBooking']).use(middleware.auth())
        router.get('/', [BookingsController, 'getMyBooking']).use(middleware.auth())
      })
      .prefix('/bookings')
    router
      .group(() => {
        router.post('/create', [ReviewsController, 'addReview']).use(middleware.auth())
        router.get('/', [ReviewsController, 'getReview']).use(middleware.auth())
      })
      .prefix('/reviews')
    router
      .group(() => {
        router.get('/reviews', [RestorersController, 'getReviews']).use(middleware.auth())
        router.get('/bookings', [RestorersController, 'getBookings']).use(middleware.auth())
        router
          .patch('/bookings/update/:id', [RestorersController, 'updateBooking'])
          .use(middleware.auth())
      })
      .prefix('/restorer')
    router
      .group(() => {
        router.get('/users', [AdminController, 'getUsers']).use(middleware.checkAdmin())
        router
          .patch('/users/update/:id', [AdminController, 'updateUser'])
          .use(middleware.checkAdmin())
        router
          .delete('/users/delete/:id', [AdminController, 'deleteUsers'])
          .use(middleware.checkAdmin())
        router
          .patch('/restaurants/accept/:id', [AdminController, 'acceptRestaurant'])
          .use(middleware.checkAdmin())
        router
          .delete('/restaurants/delete/:id', [AdminController, 'deleteRestaurant'])
          .use(middleware.checkAdmin())
        router
          .patch('/restaurants/update/:id', [AdminController, 'updateRestaurant'])
          .use(middleware.checkAdmin())
        router
          .get('users/bookings/:id', [AdminController, 'getUserBookings'])
          .use(middleware.checkAdmin())
        router
          .get('/restaurants/bookings/:id', [AdminController, 'getRestaurantBookings'])
          .use(middleware.checkAdmin())
        router
          .get('/users/reviews/:id', [AdminController, 'getUserReviews'])
          .use(middleware.checkAdmin())
        router
          .get('/restaurants/reviews/:id', [AdminController, 'getRestaurantReviews'])
          .use(middleware.checkAdmin())
        router
          .delete('/bookings/delete/:id', [AdminController, 'deleteBooking'])
          .use(middleware.checkAdmin())
        router
          .delete('/reviews/delete/:id', [AdminController, 'deleteReview'])
          .use(middleware.checkAdmin())
      })
      .prefix('/admin')

    router.get('/testing', () => {
      return 'Hello world !'
    })
  })
  .prefix('/api')

//SWAGGER
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})
