import type { HttpContext } from '@adonisjs/core/http'
import stripe from '../../services/stripe_service.js'

interface LineItem {
  name: string
  price: number
  quantity: number
}


export default class PaymentController {
  async createCheckoutSession({ request, response, auth }: HttpContext) {
    try {
      const { amount, currency, successUrl, cancelUrl, items } = request.only([
        'amount',
        'currency',
        'successUrl',
        'cancelUrl',
        'items',
      ])
      const user = await auth.use('api').authenticate()

      const lineItems = (items as LineItem[]).map((item: LineItem) => ({
        price_data: {
          currency,
          product_data: {
            name: item.name,
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: item.price, // Stripe expects the amount in cents
        },
        quantity: item.quantity,
      }))

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'bancontact'],
        line_items: lineItems,
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: user.email, // Optionally add the customer's email
      })

      return response.json({ id: session.id, url: session.url })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return response.status(500).json({ error: error.message })
    }
  }
}
